const { supabaseAdmin } = require('../config/supabase');
const { PAYMENT } = require('../config/constants');
const path = require('path');
const crypto = require('crypto');

const paymentController = {
  /**
   * GET /api/payments — List payments (filtered by role)
   */
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 20, status, year, user_id } = req.query;
      const offset = (page - 1) * limit;
      const userRole = req.user.profile.role;
      const userId = req.user.profile.id;

      let query = supabaseAdmin
        .from('payments')
        .select('*, users!inner(full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Members see only their own payments
      if (userRole === 'member') {
        query = query.eq('user_id', userId);
      } else if (user_id) {
        query = query.eq('user_id', user_id);
      }

      if (status) query = query.eq('status', status);
      if (year) query = query.eq('year', Number(year));

      const { data, error, count } = await query;
      if (error) return res.status(400).json({ error: error.message });

      res.json({
        payments: data,
        pagination: { page: Number(page), limit: Number(limit), total: count },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/payments/summary — Financial summary for user or all
   */
  getSummary: async (req, res, next) => {
    try {
      const userRole = req.user.profile.role;
      const userId = req.user.profile.id;
      const { year = PAYMENT.YEAR } = req.query;

      if (userRole === 'member') {
        // Personal summary
        const { data, error } = await supabaseAdmin
          .from('payments')
          .select('amount_paid, status')
          .eq('user_id', userId)
          .eq('year', year)
          .eq('status', 'verified');

        if (error) return res.status(400).json({ error: error.message });

        const totalPaid = data.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        res.json({
          summary: {
            total_due: PAYMENT.ANNUAL_DUE,
            total_paid: totalPaid,
            outstanding: Math.max(0, PAYMENT.ANNUAL_DUE - totalPaid),
            year: Number(year),
            bank: { name: PAYMENT.BANK_NAME, account: PAYMENT.ACCOUNT_NUMBER, account_name: PAYMENT.ACCOUNT_NAME },
          },
        });
      } else {
        // Overall summary for admin/exco
        const { data: allUsers } = await supabaseAdmin
          .from('users')
          .select('id, full_name')
          .eq('is_active', true);

        const { data: payments } = await supabaseAdmin
          .from('payments')
          .select('user_id, amount_paid, status')
          .eq('year', year)
          .eq('status', 'verified');

        const totalExpected = (allUsers?.length || 0) * PAYMENT.ANNUAL_DUE;
        const totalCollected = (payments || []).reduce((sum, p) => sum + Number(p.amount_paid), 0);
        const paidUserIds = new Set((payments || []).map(p => p.user_id));

        // Per-user breakdown
        const userPaymentMap = {};
        (payments || []).forEach(p => {
          if (!userPaymentMap[p.user_id]) userPaymentMap[p.user_id] = 0;
          userPaymentMap[p.user_id] += Number(p.amount_paid);
        });

        const fullyPaid = Object.values(userPaymentMap).filter(amt => amt >= PAYMENT.ANNUAL_DUE).length;

        res.json({
          summary: {
            total_members: allUsers?.length || 0,
            total_expected: totalExpected,
            total_collected: totalCollected,
            outstanding: totalExpected - totalCollected,
            members_fully_paid: fullyPaid,
            members_partially_paid: paidUserIds.size - fullyPaid,
            members_not_paid: (allUsers?.length || 0) - paidUserIds.size,
            year: Number(year),
            bank: { name: PAYMENT.BANK_NAME, account: PAYMENT.ACCOUNT_NUMBER, account_name: PAYMENT.ACCOUNT_NAME },
          },
        });
      }
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/payments — Submit a payment
   */
  create: async (req, res, next) => {
    try {
      const userId = req.user.profile.id;
      const { amount_paid, year = PAYMENT.YEAR } = req.body;
      let proofUrl = null;

      // Handle file upload
      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const fileName = `${userId}/${crypto.randomUUID()}${ext}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('payment-proofs')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });

        if (uploadError) {
          return res.status(400).json({ error: `Upload failed: ${uploadError.message}` });
        }

        const { data: urlData } = supabaseAdmin.storage
          .from('payment-proofs')
          .getPublicUrl(fileName);

        proofUrl = urlData.publicUrl;
      }

      const { data, error } = await supabaseAdmin
        .from('payments')
        .insert({
          user_id: userId,
          amount_paid,
          total_due: PAYMENT.ANNUAL_DUE,
          payment_proof_url: proofUrl,
          year,
          status: 'pending',
        })
        .select('*, users!inner(full_name, email)')
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json({ payment: data, message: 'Payment submitted for verification' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/payments/:id/verify — Admin: verify/reject payment
   */
  verify: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, admin_note } = req.body;
      const adminId = req.user.profile.id;

      if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Status must be verified or rejected' });
      }

      const { data, error } = await supabaseAdmin
        .from('payments')
        .update({
          status,
          admin_note: admin_note || null,
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, users!inner(full_name, email)')
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ payment: data, message: `Payment ${status}` });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/payments/user/:userId — Get payments for specific user
   */
  getByUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const userRole = req.user.profile.role;
      const currentUserId = req.user.profile.id;

      if (userRole === 'member' && userId !== currentUserId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { data, error } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return res.status(400).json({ error: error.message });
      res.json({ payments: data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = paymentController;
