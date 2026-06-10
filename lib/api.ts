import { AUTH_TOKEN_KEY, LOGIN_PATH } from "@/lib/auth";
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginPage =
        typeof window !== "undefined" &&
        window.location.pathname === LOGIN_PATH;

      if (!isLoginPage) {
        Cookies.remove(AUTH_TOKEN_KEY);
        if (typeof window !== "undefined") {
          window.location.href = LOGIN_PATH;
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
