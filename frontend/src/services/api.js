import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 - auto logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Normalize error.response.data.error to always be a string
    if (error.response?.data?.error && typeof error.response.data.error !== 'string') {
      error.response.data.error = error.response.data.error.message || 'Something went wrong';
    }

    if (error.response?.status === 401) {
      // Try refresh token
      const refresh = localStorage.getItem('refresh_token');
      if (refresh && !error.config._retry) {
        error.config._retry = true;
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refresh });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return api(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Users
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.patch(`/users/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  updateRole: (id, data) => api.patch(`/users/${id}/role`, data),
  getStats: () => api.get('/users/stats/overview'),
  uploadAvatar: (id, file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return api.post(`/users/${id}/avatar`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// Payments
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getSummary: (params) => api.get('/payments/summary', { params }),
  create: (formData) => api.post('/payments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  verify: (id, data) => api.patch(`/payments/${id}/verify`, data),
};

// Events
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.patch(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// Notifications
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  send: (data) => api.post('/notifications/send', data),
};

// Constitution
export const constitutionAPI = {
  getAll: () => api.get('/constitution'),
  getById: (id) => api.get(`/constitution/${id}`),
  create: (data) => api.post('/constitution', data),
  update: (id, data) => api.patch(`/constitution/${id}`, data),
};

// EXCO
export const excoAPI = {
  getAll: () => api.get('/exco'),
  create: (data) => api.post('/exco', data),
  update: (id, data) => api.patch(`/exco/${id}`, data),
  delete: (id) => api.delete(`/exco/${id}`),
};

// Amendments
export const amendmentsAPI = {
  getAll: () => api.get('/amendments'),
  create: (data) => api.post('/amendments', data),
  vote: (id, data) => api.post(`/amendments/${id}/vote`, data),
  approve: (id) => api.post(`/amendments/${id}/approve`),
  reject: (id) => api.post(`/amendments/${id}/reject`),
};

// Birthdays
export const birthdaysAPI = {
  getAll: () => api.get('/birthdays'),
  getUpcoming: () => api.get('/birthdays/upcoming'),
  sendMessage: (data) => api.post('/birthdays/message', data),
  updateBirthday: (id, data) => api.patch(`/users/${id}/birthday`, data),
};

// Contributions
export const contributionsAPI = {
  getAll: () => api.get('/contributions'),
  getById: (id) => api.get(`/contributions/${id}`),
  create: (data) => api.post('/contributions', data),
  update: (id, data) => api.patch(`/contributions/${id}`, data),
  delete: (id) => api.delete(`/contributions/${id}`),
  pay: (id, data) => api.post(`/contributions/${id}/pay`, data),
  verifyPayment: (cid, pid, data) => api.patch(`/contributions/${cid}/payments/${pid}/verify`, data),
};

// Meetings
export const meetingsAPI = {
  getConfig: () => api.get('/meetings/config'),
  createRoom: (name) => api.post('/meetings/room', { name }),
};

export default api;
