const { supabaseAdmin } = require('../config/supabase');

const notificationController = {
  /** GET /api/notifications */
  getAll: async (req, res, next) => {
    try {
      const userId = req.user.profile.id;
      const { unread_only, page = 1, limit = 20 } = req.query;

      let query = supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (unread_only === 'true') {
        query = query.eq('read_status', false);
      }

      const { data, error, count } = await query;
      if (error) return res.status(400).json({ error: error.message });

      res.json({ notifications: data, pagination: { page: Number(page), limit: Number(limit), total: count } });
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /api/notifications/:id/read */
  markRead: async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .update({ read_status: true })
        .eq('id', req.params.id)
        .eq('user_id', req.user.profile.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ notification: data });
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /api/notifications/read-all */
  markAllRead: async (req, res, next) => {
    try {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read_status: true })
        .eq('user_id', req.user.profile.id)
        .eq('read_status', false);

      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/notifications/send — Admin only: send to all or specific user */
  send: async (req, res, next) => {
    try {
      const { message, type = 'reminder', user_id } = req.body;

      if (user_id) {
        const { data, error } = await supabaseAdmin
          .from('notifications')
          .insert({ user_id, message, type })
          .select()
          .single();

        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json({ notification: data, message: 'Notification sent' });
      }

      // Send to all active users
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('is_active', true);

      const notifications = (users || []).map(u => ({
        user_id: u.id,
        message,
        type,
      }));

      if (notifications.length > 0) {
        const { error } = await supabaseAdmin.from('notifications').insert(notifications);
        if (error) return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ message: `Notification sent to ${notifications.length} members` });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/notifications/unread-count */
  getUnreadCount: async (req, res, next) => {
    try {
      const { count, error } = await supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.user.profile.id)
        .eq('read_status', false);

      if (error) return res.status(400).json({ error: error.message });
      res.json({ unread_count: count });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = notificationController;
