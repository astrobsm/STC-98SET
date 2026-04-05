const { supabaseAdmin } = require('../config/supabase');

const excoController = {
  /** GET /api/exco */
  getAll: async (_req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('exco_members')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) return res.status(400).json({ error: error.message });
      res.json({ exco_members: data });
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/exco — Admin only */
  create: async (req, res, next) => {
    try {
      const { name, position, contact, user_id, photo_url, tenure_start, tenure_end } = req.body;

      const { data, error } = await supabaseAdmin
        .from('exco_members')
        .insert({ name, position, contact, user_id, photo_url, tenure_start, tenure_end })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json({ exco_member: data, message: 'EXCO member added' });
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /api/exco/:id — Admin only */
  update: async (req, res, next) => {
    try {
      const updates = { ...req.body, updated_at: new Date().toISOString() };
      delete updates.id;

      const { data, error } = await supabaseAdmin
        .from('exco_members')
        .update(updates)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ exco_member: data, message: 'EXCO member updated' });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/exco/:id — Admin only */
  delete: async (req, res, next) => {
    try {
      const { error } = await supabaseAdmin
        .from('exco_members')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', req.params.id);

      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'EXCO member removed' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = excoController;
