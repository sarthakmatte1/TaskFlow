import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return api.post('/api/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  me: () => api.get('/api/auth/me'),
  changePassword: (data) => api.post('/api/auth/change-password', data),
};

// ── Users ─────────────────────────────────────────────────────────────
export const usersAPI = {
  list: (skip = 0, limit = 50) => api.get(`/api/users/?skip=${skip}&limit=${limit}`),
  get: (id) => api.get(`/api/users/${id}`),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
};

// ── Projects ──────────────────────────────────────────────────────────
export const projectsAPI = {
  list: () => api.get('/api/projects/'),
  get: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects/', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
};

// ── Tasks ─────────────────────────────────────────────────────────────
export const tasksAPI = {
  list: (params = {}) => api.get('/api/tasks/', { params }),
  myTasks: () => api.get('/api/tasks/my-tasks'),
  get: (id) => api.get(`/api/tasks/${id}`),
  create: (data) => api.post('/api/tasks/', data),
  update: (id, data) => api.patch(`/api/tasks/${id}`, data),
  updateStatus: (id, status) => api.put(`/api/tasks/${id}/status?new_status=${status}`),
  delete: (id) => api.delete(`/api/tasks/${id}`),
};

export default api;
