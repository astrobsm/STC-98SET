import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }
    try {
      const { data } = await authAPI.getMe();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.clear();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('access_token', data.session.access_token);
    localStorage.setItem('refresh_token', data.session.refresh_token);
    set({ user: data.user, isAuthenticated: true });
    return data;
  },

  register: async (formData) => {
    const { data } = await authAPI.register(formData);
    return data;
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch { /* ignore */ }
    localStorage.clear();
    set({ user: null, isAuthenticated: false });
  },

  isAdmin: () => get().user?.role === 'admin',
  isExco: () => get().user?.role === 'exco',
  isAdminOrExco: () => ['admin', 'exco'].includes(get().user?.role),
}));

export default useAuthStore;
