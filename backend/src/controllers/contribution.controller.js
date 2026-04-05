const { supabaseAdmin } = require('../config/supabase');

const contributionController = {
  /**
   * GET /api/contributions — List all contributions with aggregated stats
   */
  getAll: async (req, res, next) => {
    try {
      // Get all contributions
      const { data: contributions, error } = await supabaseAdmin
        .from('contributions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return res.status(400).json({ error: error.message });

      // Get all active members count
      const { count: totalMembers } = await supabaseAdmin
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get payment aggregates per contribution
      const { data: payments } = await supabaseAdmin
        .from('contribution_payments')
        .select('contribution_id, amount_paid, status, user_id');

      const enriched = contributions.map((c) => {
        const cPayments = (payments || []).filter((p) => p.contribution_id === c.id);
        const verified = cPayments.filter((p) => p.status === 'verified');
        const totalCollected = verified.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        // Count unique members who are fully paid
        const byUser = {};
        for (const p of verified) {
          byUser[p.user_id] = (byUser[p.user_id] || 0) + Number(p.amount_paid);
        }
        const membersPaid = Object.values(byUser).filter((v) => v > 0).length;
        const membersFullyPaid = Object.values(byUser).filter((v) => v >= Number(c.target_amount)).length;

        return {
          ...c,
          total_members: totalMembers || 0,
          total_collected: totalCollected,
          members_paid: membersPaid,
          members_fully_paid: membersFullyPaid,
        };
      });

      res.json({ contributions: enriched });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/contributions/:id — Detailed view with per-member breakdown
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const { data: contribution, error } = await supabaseAdmin
        .from('contributions')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !contribution) {
        return res.status(404).json({ error: 'Contribution not found' });
      }

      // Get all active members
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, full_name, email, phone')
        .eq('is_active', true)
        .order('full_name');

      // Get payments for this contribution
      const { data: payments } = await supabaseAdmin
        .from('contribution_payments')
        .select('*')
        .eq('contribution_id', id)
        .order('created_at', { ascending: false });

      // Build per-member breakdown
      const members = (users || []).map((u) => {
        const userPayments = (payments || []).filter((p) => p.user_id === u.id);
        const verified = userPayments.filter((p) => p.status === 'verified');
        const pending = userPayments.filter((p) => p.status === 'pending');
        const amountPaid = verified.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        const pendingAmount = pending.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        const outstanding = Math.max(0, Number(contribution.target_amount) - amountPaid);

        return {
          user_id: u.id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          amount_paid: amountPaid,
          pending_amount: pendingAmount,
          outstanding,
          fully_paid: amountPaid >= Number(contribution.target_amount),
          payments: userPayments,
        };
      });

      const totalCollected = members.reduce((sum, m) => sum + m.amount_paid, 0);
      const membersFullyPaid = members.filter((m) => m.fully_paid).length;

      res.json({
        contribution: {
          ...contribution,
          total_members: members.length,
          total_collected: totalCollected,
          members_fully_paid: membersFullyPaid,
        },
        members,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/contributions — Admin: create contribution
   */
  create: async (req, res, next) => {
    try {
      const { title, description, target_amount, deadline } = req.body;

      if (!title || !target_amount) {
        return res.status(400).json({ error: 'Title and target_amount are required' });
      }

      const { data, error } = await supabaseAdmin
        .from('contributions')
        .insert({
          title,
          description: description || null,
          target_amount: Number(target_amount),
          deadline: deadline || null,
          created_by: req.user.profile.id,
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json({ contribution: data });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/contributions/:id — Admin: update contribution
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description, target_amount, deadline, status } = req.body;

      const updates = { updated_at: new Date().toISOString() };
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (target_amount !== undefined) updates.target_amount = Number(target_amount);
      if (deadline !== undefined) updates.deadline = deadline || null;
      if (status !== undefined) updates.status = status;

      const { data, error } = await supabaseAdmin
        .from('contributions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ contribution: data });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/contributions/:id — Admin: delete contribution
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { error } = await supabaseAdmin
        .from('contributions')
        .delete()
        .eq('id', id);

      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'Contribution deleted' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/contributions/:id/pay — Member: submit payment
   */
  pay: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { amount_paid } = req.body;
      const userId = req.user.profile.id;

      if (!amount_paid || Number(amount_paid) <= 0) {
        return res.status(400).json({ error: 'amount_paid must be > 0' });
      }

      const { data, error } = await supabaseAdmin
        .from('contribution_payments')
        .insert({
          contribution_id: id,
          user_id: userId,
          amount_paid: Number(amount_paid),
          status: 'pending',
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json({ payment: data, message: 'Payment submitted for verification' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/contributions/:cid/payments/:pid/verify — Admin: verify/reject
   */
  verifyPayment: async (req, res, next) => {
    try {
      const { pid } = req.params;
      const { status, admin_note } = req.body;

      if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Status must be verified or rejected' });
      }

      const { data, error } = await supabaseAdmin
        .from('contribution_payments')
        .update({
          status,
          admin_note: admin_note || null,
          verified_by: req.user.profile.id,
        })
        .eq('id', pid)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ payment: data, message: `Payment ${status}` });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = contributionController;
