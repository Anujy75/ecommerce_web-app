import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api"
  //baseURL: import.meta.env.VITE_API_URL + "/api" 
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