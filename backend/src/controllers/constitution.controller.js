const { supabaseAdmin } = require('../config/supabase');

const constitutionController = {
  /** GET /api/constitution */
  getAll: async (_req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('constitution')
        .select('*')
        .eq('is_active', true)
        .order('version', { ascending: false });

      if (error) return res.status(400).json({ error: error.message });
      res.json({ articles: data });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/constitution/:id */
  getById: async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('constitution')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error || !data) return res.status(404).json({ error: 'Article not found' });
      res.json({ article: data });
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/constitution — Admin only */
  create: async (req, res, next) => {
    try {
      const { title, content } = req.body;

      const { data, error } = await supabaseAdmin
        .from('constitution')
        .insert({ title, content, created_by: req.user.profile.id })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json({ article: data, message: 'Article created' });
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /api/constitution/:id — Admin only */
  update: async (req, res, next) => {
    try {
      const { title, content } = req.body;
      const { data, error } = await supabaseAdmin
        .from('constitution')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ article: data, message: 'Article updated' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = constitutionController;
