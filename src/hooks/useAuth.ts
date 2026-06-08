"use client";

import api from "@/lib/api";
import type { User } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useAuth = () => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get<User>("/api/auth/me");
      return data;
    },
    retry: false,
  });

  return { user, isLoading, error };
};
