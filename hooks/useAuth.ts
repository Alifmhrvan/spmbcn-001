"use client";

import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface AuthUser {
  id: string;
  nama: string;
  email: string;
  noHp?: string | null;
  role: string;
  createdAt?: string;
}

export const useAuth = () => {
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get<AuthUser>("/api/auth/me");
      return data;
    },
    retry: false,
  });

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  return { user, isLoading, error, isAdmin };
};
