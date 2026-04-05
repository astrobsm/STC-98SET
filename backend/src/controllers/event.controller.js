const { supabaseAdmin } = require('../config/supabase');

const eventController = {
  /** GET /api/events */
  getAll: async (req, res, next) => {
    try {
      const { upcoming, type, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from('events')
        .select('*', { count: 'exact' })
        .order('event_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (upcoming === 'true') {
        query = query.gte('event_date', new Date().toISOString());
      }
      if (type) query = query.eq('type', type);

      const { data, error, count } = await query;
      if (error) return res.status(400).json({ error: error.message });

      res.json({ events: data, pagination: { page: Number(page), limit: Number(limit), total: count } });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/events/:id */
  getById: async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error || !data) return res.status(404).json({ error: 'Event not found' });
      res.json({ event: data });
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/events — Admin/Exco only */
  create: async (req, res, next) => {
    try {
      const { title, description, event_date, type, location, meeting_link } = req.body;

      const { data, error } = await supabaseAdmin
        .from('events')
        .insert({
          title,
          description,
          event_date,
          type,
          location: location || null,
          meeting_link: meeting_link || null,
          created_by: req.user.profile.id,
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json({ event: data, message: 'Event created' });
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /api/events/:id */
  update: async (req, res, next) => {
    try {
      const updates = { ...req.body, updated_at: new Date().toISOString() };
      delete updates.id;
      delete updates.created_by;

      const { data, error } = await supabaseAdmin
        .from('events')
        .update(updates)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ event: data, message: 'Event updated' });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/events/:id — Admin only */
  delete: async (req, res, next) => {
    try {
      const { error } = await supabaseAdmin
        .from('events')
        .delete()
        .eq('id', req.params.id);

      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'Event deleted' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = eventController;
