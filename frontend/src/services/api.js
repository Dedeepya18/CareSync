import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('caresync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('caresync_token');
        localStorage.removeItem('caresync_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Patient endpoints
export const patientService = {
  getProfile: (patientId) => api.get(`/patients/profile${patientId ? `?patientId=${patientId}` : ''}`),
  updateProfile: (data) => api.put('/patients/profile', data),
  getDashboard: () => api.get('/patients/dashboard'),
  getDoctorsList: () => api.get('/patients/doctors'),
};

// Metric endpoints
export const metricService = {
  addMetric: (data) => api.post('/health-metrics', data),
  getMetrics: (params) => api.get('/health-metrics', { params }),
  getSummary: (patientId) => api.get(`/health-metrics/summary${patientId ? `?patientId=${patientId}` : ''}`),
  deleteMetric: (id) => api.delete(`/health-metrics/${id}`),
};

// Symptom endpoints
export const symptomService = {
  addSymptom: (data) => api.post('/symptoms', data),
  getSymptoms: (patientId) => api.get(`/symptoms${patientId ? `?patientId=${patientId}` : ''}`),
  updateSymptom: (id, data) => api.put(`/symptoms/${id}`, data),
  deleteSymptom: (id) => api.delete(`/symptoms/${id}`),
};

// Medication endpoints
export const medicationService = {
  addMedication: (data) => api.post('/medications', data),
  getMedications: (patientId) => api.get(`/medications${patientId ? `?patientId=${patientId}` : ''}`),
  updateMedication: (id, data) => api.put(`/medications/${id}`, data),
  deleteMedication: (id) => api.delete(`/medications/${id}`),
  logAction: (id, data) => api.post(`/medications/${id}/log`, data),
  getAdherence: (params) => api.get('/medications/adherence', { params }),
};

// Medical Records endpoints
export const recordService = {
  uploadRecord: (formData) => api.post('/records/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getRecords: (params) => api.get('/records', { params }),
  deleteRecord: (id) => api.delete(`/records/${id}`),
};

// Alert endpoints
export const alertService = {
  getAlerts: (params) => api.get('/alerts', { params }),
  markAsRead: (id) => api.put(`/alerts/${id}/read`),
  dismissAlert: (id) => api.put(`/alerts/${id}/dismiss`),
  runAnalysis: (patientId) => api.post('/alerts/run-analysis', { patientId }),
};

// Consent endpoints
export const consentService = {
  createConsent: (data) => api.post('/consent', data),
  getConsents: () => api.get('/consent'),
  revokeConsent: (id) => api.put(`/consent/${id}/revoke`),
  updatePermissions: (id, permissions) => api.put(`/consent/${id}/permissions`, { permissions }),
};

// Doctor endpoints
export const doctorService = {
  getDashboard: () => api.get('/doctor/dashboard'),
  getConsentedPatients: () => api.get('/doctor/patients'),
  getPatientDetails: (patientId) => api.get(`/doctor/patients/${patientId}`),
  addNote: (data) => api.post('/doctor/notes', data),
  getProfile: () => api.get('/doctor/profile'),
  updateProfile: (data) => api.put('/doctor/profile', data),
};

// Admin endpoints
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/status`),
};

// AI Summary endpoints
export const aiService = {
  getHealthSummary: (patientId) => api.get(`/ai/health-summary${patientId ? `?patientId=${patientId}` : ''}`),
};

// Notification endpoints
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;

