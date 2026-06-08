"use client";

import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { GraduationCap } from "lucide-react";

const Topbar = () => {
  const { user, isLoading } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-0 z-40 h-14 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-full max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 shrink-0 text-primary-600" />
          <span className="text-xs font-semibold text-neutral-700">
            SPMB Citra Negara
          </span>
        </div>

        {isLoading ? (
          <div
            className="h-8 w-8 animate-pulse rounded-full bg-neutral-200"
            aria-hidden="true"
          />
        ) : (
          <Avatar name={user?.nama ?? "Peserta"} size="sm" />
        )}
      </div>
    </header>
  );
};

export default Topbar;
