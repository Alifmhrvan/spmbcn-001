import {
  ADMIN_LOGIN_PATH,
  ADMIN_TOKEN_KEY,
  AUTH_TOKEN_KEY,
  USER_LOGIN_PATH,
} from "@/lib/auth";
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const isAdminPath =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin");

  const token = isAdminPath
    ? Cookies.get(ADMIN_TOKEN_KEY)
    : Cookies.get(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminPath =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin");

      if (isAdminPath) {
        Cookies.remove(ADMIN_TOKEN_KEY);
      } else {
        Cookies.remove(AUTH_TOKEN_KEY);
      }

      if (typeof window !== "undefined") {
        window.location.href = isAdminPath
          ? ADMIN_LOGIN_PATH
          : USER_LOGIN_PATH;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
