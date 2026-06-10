"use client";

import { AUTH_TOKEN_KEY, LOGIN_PATH } from "@/lib/auth";
import { LogOut, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard":  "Dashboard",
  "/admin/peserta":    "Daftar Peserta",
  "/admin/verifikasi": "Verifikasi Berkas",
  "/admin/pengaturan": "Pengaturan Jadwal",
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [key, value] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(`${key}/`)) return value;
  }
  return "Admin Panel";
}

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

const AdminHeader = ({ onMenuToggle }: AdminHeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const title = resolveTitle(pathname);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      Cookies.remove(AUTH_TOKEN_KEY);
      router.push(LOGIN_PATH);
    }
  };

  return (
    <header
      className={[
        "fixed right-0 top-0 z-20 flex h-[60px] items-center justify-between",
        "border-b border-neutral-200 bg-white px-4",
        "left-0 lg:left-60",
      ].join(" ")}
    >
      {}
      <div className="flex items-center gap-3">
        <button
          type="button"
          id="admin-menu-toggle"
          aria-label="Toggle menu navigasi"
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <h1 className="text-base font-semibold text-neutral-900">{title}</h1>
      </div>

      {}
      <button
        type="button"
        id="admin-logout-btn"
        onClick={handleLogout}
        className={[
          "flex h-8 items-center gap-1.5 rounded-btn border-2 border-danger px-3",
          "text-xs font-semibold text-danger transition-colors",
          "hover:bg-danger hover:text-white",
        ].join(" ")}
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        Logout
      </button>
    </header>
  );
};

export default AdminHeader;
