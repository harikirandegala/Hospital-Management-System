import axios from 'axios';
import { useAuthStore } from '../context/authStore.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: { 'Content-Type': 'application/json' }
});

// ─── Attach access token ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Refresh token on 401 ────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { refreshToken, setAuth, clearAuth } = useAuthStore.getState();
      if (!refreshToken) { clearAuth(); window.location.href = '/login'; return; }

      try {
        const { data } = await axios.post('/api/auth/refresh', { refresh_token: refreshToken });
        setAuth(useAuthStore.getState().user, data.access_token, data.refresh_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ─── Named service functions ──────────────────────────────

export const authApi = {
  login:   (data)         => api.post('/auth/login', data),
  register:(data)         => api.post('/auth/register', data),
  logout:  ()             => api.post('/auth/logout'),
  me:      ()             => api.get('/auth/me')
};

export const appointmentApi = {
  list:           (params) => api.get('/appointments', { params }),
  getById:        (id)     => api.get(`/appointments/${id}`),
  slots:          (params) => api.get('/appointments/slots', { params }),
  create:         (data)   => api.post('/appointments', data),
  update:         (id, d)  => api.put(`/appointments/${id}`, d),
  cancel:         (id, d)  => api.delete(`/appointments/${id}`, { data: d })
};

export const patientApi = {
  list:    (params) => api.get('/patients', { params }),
  getById: (id)     => api.get(`/patients/${id}`),
  create:  (data)   => api.post('/patients', data),
  update:  (id, d)  => api.put(`/patients/${id}`, d)
};

export const doctorApi = {
  list:    (params) => api.get('/doctors', { params }),
  getById: (id)     => api.get(`/doctors/${id}`)
};

export const recordApi = {
  byPatient: (pid)    => api.get(`/records/patient/${pid}`),
  create:    (pid, d) => api.post(`/records/patient/${pid}`, d)
};

export const labApi = {
  list:   (params) => api.get('/lab-orders', { params }),
  create: (data)   => api.post('/lab-orders', data),
  update: (id, d)  => api.put(`/lab-orders/${id}`, d)
};

export const invoiceApi = {
  list:    (params) => api.get('/invoices', { params }),
  getById: (id)     => api.get(`/invoices/${id}`),
  create:  (data)   => api.post('/invoices', data)
};

export const medicineApi = {
  list:   (params) => api.get('/medicines', { params }),
  create: (data)   => api.post('/medicines', data),
  update: (id, d)  => api.put(`/medicines/${id}`, d)
};

export default api;
