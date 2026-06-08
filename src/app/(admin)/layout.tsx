"use client";

import AdminHeader from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
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

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-neutral-50">
        {/* ── Sidebar ── */}
        <Sidebar
          adminName="Administrator"
          adminRole="Super Admin"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* ── Topbar ── */}
        <AdminHeader onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

        {/* ── Main content ── */}
        {/*
          pt-[60px]  → clear fixed topbar
          lg:ml-60   → clear fixed sidebar on desktop
        */}
        <main
          id="admin-main-content"
          className="min-h-screen pt-[60px] lg:ml-60"
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </QueryClientProvider>
  );
};

export default AdminLayout;
