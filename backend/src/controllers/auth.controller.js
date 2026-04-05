const { supabaseAdmin } = require('../config/supabase');

const authController = {
  /**
   * POST /api/auth/register
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

      // Create user profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
          auth_id: authData.user.id,
          full_name,
          email,
          phone: phone || null,
          state_of_residence: state_of_residence || null,
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

      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Fetch user profile
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
