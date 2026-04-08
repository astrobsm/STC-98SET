const { supabaseAdmin } = require('../config/supabase');
const crypto = require('crypto');

/** Upload a buffer to Supabase Storage and return the public URL */
async function uploadAvatar(fileBuffer, mimetype) {
  const ext = mimetype === 'image/png' ? 'png' : mimetype === 'image/webp' ? 'webp' : 'jpg';
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `avatars/${fileName}`;

  const { error } = await supabaseAdmin.storage
    .from('avatars')
    .upload(filePath, fileBuffer, { contentType: mimetype, upsert: true });

  if (error) throw new Error(`Avatar upload failed: ${error.message}`);

  const { data: urlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(filePath);
  return urlData.publicUrl;
}

const userController = {
  /**
   * GET /api/users/gallery — Any authenticated member: list members for gallery
   */
  getGallery: async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, full_name, avatar_url, state_of_residence, role, phone, email')
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/users — Admin/Exco: list all members
   */
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 20, search, role } = req.query;
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from('users')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('full_name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      if (role) {
        query = query.eq('role', role);
      }

      const { data, error, count } = await query;
      if (error) return res.status(400).json({ error: error.message });

      res.json({
        users: data,
        pagination: { page: Number(page), limit: Number(limit), total: count },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/users/:id
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userRole = req.user.profile.role;
      const userId = req.user.profile.id;

      // Members can only view their own profile
      if (userRole === 'member' && id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: data });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/users/:id — Update profile
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userRole = req.user.profile.role;
      const userId = req.user.profile.id;

      if (userRole === 'member' && id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { full_name, phone, state_of_residence, date_of_birth, wedding_anniversary } = req.body;
      const updates = {};
      if (full_name !== undefined) updates.full_name = full_name;
      if (phone !== undefined) updates.phone = phone;
      if (state_of_residence !== undefined) updates.state_of_residence = state_of_residence;
      if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth || null;
      if (wedding_anniversary !== undefined) updates.wedding_anniversary = wedding_anniversary || null;

      // Handle avatar upload if file is attached
      if (req.file) {
        try {
          updates.avatar_url = await uploadAvatar(req.file.buffer, req.file.mimetype);
        } catch (uploadErr) {
          console.error('Avatar upload error:', uploadErr.message);
        }
      }

      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ user: data, message: 'Profile updated' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/users/:id/role — Admin only: change role
   */
  updateRole: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ user: data, message: 'Role updated' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/users/stats/overview — Admin/Exco: member stats
   */
  getStats: async (req, res, next) => {
    try {
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('role, is_active')
        .eq('is_active', true);

      if (error) return res.status(400).json({ error: error.message });

      const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        exco: users.filter(u => u.role === 'exco').length,
        members: users.filter(u => u.role === 'member').length,
      };

      res.json({ stats });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/users/:id/avatar — Upload/change profile picture
   */
  uploadAvatar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userRole = req.user.profile.role;
      const userId = req.user.profile.id;

      if (userRole === 'member' && id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const avatar_url = await uploadAvatar(req.file.buffer, req.file.mimetype);

      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ avatar_url, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ user: data, message: 'Avatar updated' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = userController;
