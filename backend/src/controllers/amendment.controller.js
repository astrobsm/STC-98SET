const { supabaseAdmin } = require('../config/supabase');

const amendmentController = {
  /**
   * GET /api/amendments — List all amendments with article title and proposer name
   */
  getAll: async (_req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('constitution_amendments')
        .select('*, constitution(title), users!constitution_amendments_proposed_by_fkey(full_name)')
        .order('created_at', { ascending: false });

      if (error) return res.status(400).json({ error: error.message });

      const amendments = (data || []).map((a) => ({
        ...a,
        article_title: a.constitution?.title || 'Unknown Article',
        proposed_by_name: a.users?.full_name || 'Unknown',
        constitution: undefined,
        users: undefined,
      }));

      res.json({ amendments });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/amendments — Propose a new amendment
   */
  create: async (req, res, next) => {
    try {
      const { article_id, proposed_text, reason } = req.body;

      if (!article_id || !proposed_text) {
        return res.status(400).json({ error: 'article_id and proposed_text are required' });
      }

      const { data, error } = await supabaseAdmin
        .from('constitution_amendments')
        .insert({
          article_id,
          proposed_text,
          reason: reason || null,
          proposed_by: req.user.profile.id,
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json({ amendment: data });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/amendments/:id/vote — Vote for or against
   */
  vote: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { vote } = req.body; // 'for' or 'against'
      const userId = req.user.profile.id;

      if (!['for', 'against'].includes(vote)) {
        return res.status(400).json({ error: "Vote must be 'for' or 'against'" });
      }

      // Get current amendment
      const { data: amendment, error: fetchErr } = await supabaseAdmin
        .from('constitution_amendments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !amendment) {
        return res.status(404).json({ error: 'Amendment not found' });
      }

      if (amendment.status !== 'proposed') {
        return res.status(400).json({ error: 'Can only vote on proposed amendments' });
      }

      // Check if already voted
      if (amendment.voted_by && amendment.voted_by.includes(userId)) {
        return res.status(400).json({ error: 'You have already voted on this amendment' });
      }

      const updates = {
        voted_by: [...(amendment.voted_by || []), userId],
        updated_at: new Date().toISOString(),
      };

      if (vote === 'for') {
        updates.votes_for = (amendment.votes_for || 0) + 1;
      } else {
        updates.votes_against = (amendment.votes_against || 0) + 1;
      }

      const { data, error } = await supabaseAdmin
        .from('constitution_amendments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ amendment: data, message: 'Vote recorded' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/amendments/:id/approve — Admin: approve and apply amendment
   */
  approve: async (req, res, next) => {
    try {
      const { id } = req.params;

      const { data: amendment, error: fetchErr } = await supabaseAdmin
        .from('constitution_amendments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !amendment) {
        return res.status(404).json({ error: 'Amendment not found' });
      }

      if (amendment.status !== 'proposed') {
        return res.status(400).json({ error: 'Amendment is not in proposed status' });
      }

      // Update amendment status
      const { error: updateErr } = await supabaseAdmin
        .from('constitution_amendments')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateErr) return res.status(400).json({ error: updateErr.message });

      // Apply the amendment text to the constitution article and bump version
      const { data: article } = await supabaseAdmin
        .from('constitution')
        .select('version')
        .eq('id', amendment.article_id)
        .single();

      await supabaseAdmin
        .from('constitution')
        .update({
          content: amendment.proposed_text,
          version: (article?.version || 1) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', amendment.article_id);

      res.json({ message: 'Amendment approved and applied' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/amendments/:id/reject — Admin: reject amendment
   */
  reject: async (req, res, next) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('constitution_amendments')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ amendment: data, message: 'Amendment rejected' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = amendmentController;
