const { supabaseAdmin, supabase } = require('../config/supabase');
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

const authController = {
  /**
   * POST /api/auth/register  (multipart/form-data when avatar attached)
   */
  register: async (req, res, next) => {
    try {
      const { full_name, email, password, phone, state_of_residence } = req.body;

      // Create auth user in Supabase
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      // If a photo was uploaded, store it in Supabase Storage
      let avatar_url = null;
      if (req.file) {
        try {
          avatar_url = await uploadAvatar(req.file.buffer, req.file.mimetype);
        } catch (uploadErr) {
          console.error('Avatar upload error:', uploadErr.message);
          // Non-fatal: continue registration without avatar
        }
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
          auth_id: authData.user.id,
          full_name,
          email,
          phone: phone || null,
          state_of_residence: state_of_residence || null,
          avatar_url,
          role: 'member',
        })
        .select()
        .single();

      if (profileError) {
        // Rollback: delete auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return res.status(400).json({ error: profileError.message });
      }

      res.status(201).json({
        message: 'Registration successful',
        user: profile,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/login
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Use the anon client for sign-in to avoid polluting the admin client's session
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Fetch user profile using admin client (bypasses RLS)
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('auth_id', data.user.id)
        .single();

      if (profileError) {
        return res.status(401).json({ error: 'User profile not found' });
      }

      res.json({
        message: 'Login successful',
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
        user: profile,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/logout
   */
  logout: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await supabaseAdmin.auth.admin.signOut(token);
      }
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/me
   */
  getMe: async (req, res) => {
    res.json({ user: req.user.profile });
  },

  /**
   * POST /api/auth/refresh
   */
  refreshToken: async (req, res, next) => {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });
      if (error) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      res.json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
