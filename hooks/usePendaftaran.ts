
"use client";

import api from "@/lib/api";
import type { Pendaftaran } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const usePendaftaran = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["pendaftaran", "me"],
    queryFn: async () => {
      const { data: pendaftaran } = await api.get<Pendaftaran | null>(
        "/api/user/pendaftaran",
      );
      return pendaftaran ?? null;
    },
    retry: false,
  });

  return { pendaftaran: data, isLoading, error, refetch };
};
