import axios from "axios";

const API = axios.create({
  baseURL: "https://shopease-backend-5nf5.onrender.com/api"
});

// ✅ Har request mein automatically token add hoga
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
