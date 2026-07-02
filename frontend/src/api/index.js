import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('sonaUser') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data);
export const sendSignupOtp = (data) => API.post('/auth/send-signup-otp', data);
export const verifySignupOtp = (data) => API.post('/auth/verify-signup-otp', data);
export const completeProfile = (data) => API.post('/auth/complete-profile', data);
export const login = (data) => API.post('/auth/login', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const getMe = () => API.get('/auth/me');

// Clubs
export const getClubs = () => API.get('/clubs');
export const getMyManagedClubs = () => API.get('/clubs/my-managed-clubs');
export const getClub = (id) => API.get(`/clubs/${id}`);
export const createClub = (data) => API.post('/clubs', data);
export const updateClub = (id, data) => API.put(`/clubs/${id}`, data);
export const deleteClub = (id) => API.delete(`/clubs/${id}`);
export const joinClub = (id) => API.post(`/clubs/${id}/join`);
export const addAnnouncement = (id, data) => API.post(`/clubs/${id}/announcements`, data);

// Events
export const getEvents = (params) => API.get('/events', { params });
export const getAllEvents = () => API.get('/events/all');
export const getEvent = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post('/events', data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const approveEvent = (id) => API.put(`/events/${id}/approve`);
export const getEventStats = () => API.get('/events/stats');

// Registrations
export const registerForEvent = (data) => API.post('/registrations', data);
export const getMyEvents = () => API.get('/registrations/my-events');
export const getEventRegistrations = (eventId) => API.get(`/registrations/event/${eventId}`);
export const cancelRegistration = (id) => API.delete(`/registrations/${id}`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');
export const createNotification = (data) => API.post('/notifications', data);

// Users (Admin)
export const getAllUsers = () => API.get('/users');
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role });

export default API;
