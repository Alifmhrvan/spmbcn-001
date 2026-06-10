"use client";

import BottomNav from "@/components/user/BottomNav";
import Topbar from "@/components/user/Topbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-neutral-50">
        <Topbar />
        <main className="mx-auto max-w-lg px-4 pt-14 pb-16">{children}</main>
        <BottomNav />
      </div>
    </QueryClientProvider>
  );
};

export default UserLayout;
