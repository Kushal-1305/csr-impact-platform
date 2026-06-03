// api/axios.js — Central configuration for all backend API calls.
//
// We use "axios" instead of the built-in "fetch" because axios:
//   - Automatically parses JSON responses
//   - Makes it easy to attach auth tokens to every request
//   - Has cleaner error handling
//
// Think of this file as a pre-configured messenger between the frontend and backend.

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Our backend server address
});

// "Interceptor" = code that runs automatically before EVERY request.
// Here we attach the JWT token from localStorage to every request's header.
// This is how the backend knows who you are on every API call.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
