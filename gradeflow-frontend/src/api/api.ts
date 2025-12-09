import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:7050",
  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================================
// REQUEST INTERCEPTOR — atașează token-ul automat
// ========================================================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ========================================================
// RESPONSE INTERCEPTOR — token expirat → logout automat
// ========================================================
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      // Token invalid / expirat
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;