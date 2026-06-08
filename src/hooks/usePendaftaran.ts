"use client";

import api from "@/lib/api";
import type { Pendaftaran } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const usePendaftaran = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pendaftaran", "me"],
    queryFn: async () => {
      const { data: pendaftaran } = await api.get<Pendaftaran>(
        "/api/pendaftaran/me",
      );
      return pendaftaran;
    },
    retry: false,
  });

  return { pendaftaran: data, isLoading, error };
};
