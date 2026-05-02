import axios from "axios";

const api = axios.create({
  baseURL: "https://car-rental-website-nhom8.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token vào request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự xử lý khi token hết hạn / không hợp lệ
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      const publicPaths = ["/", "/home", "/login", "/register", "/search"];
      const currentPath = window.location.pathname;

      const isCarDetail = currentPath.startsWith("/cars/");

      if (!publicPaths.includes(currentPath) && !isCarDetail) {
        window.location.href = "/home";
      } else {
        window.dispatchEvent(new Event("auth-changed"));
      }
    }

    return Promise.reject(error);
  },
);

export default api;
