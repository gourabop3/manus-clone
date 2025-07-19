import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// Tasks API
export const tasksAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getStats: () => api.get('/tasks/stats'),
};

// Chat API
export const chatAPI = {
  getConversations: (params) => api.get('/chat/conversations', { params }),
  getConversation: (id) => api.get(`/chat/conversations/${id}`),
  createConversation: (data) => api.post('/chat/conversations', data),
  sendMessage: (id, data) => api.post(`/chat/conversations/${id}/messages`, data),
  updateConversation: (id, data) => api.put(`/chat/conversations/${id}`, data),
  deleteConversation: (id) => api.delete(`/chat/conversations/${id}`),
  clearConversation: (id) => api.post(`/chat/conversations/${id}/clear`),
};

// Files API
export const filesAPI = {
  getFiles: (params) => api.get('/files', { params }),
  uploadFile: (formData) => api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteFile: (filename) => api.delete(`/files/${filename}`),
  getFileUrl: (filename) => `${API_BASE_URL}/files/${filename}`,
};

export default api;

