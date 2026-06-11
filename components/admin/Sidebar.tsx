"use client";

import Avatar from "@/components/ui/Avatar";
import { FileCheck, GraduationCap, LayoutDashboard, Settings, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard",  label: "Dashboard",          icon: LayoutDashboard },
  { href: "/admin/peserta",    label: "Daftar Peserta",     icon: Users }, 
  { href: "/admin/pengaturan", label: "Pengaturan Jadwal",  icon: Settings },
];

interface SidebarProps {
  
  adminName?: string;
  
  adminRole?: string;
  
  isOpen: boolean;
  
  onClose: () => void;
}

const Sidebar = ({
  adminName = "Administrator",
  adminRole = "Super Admin",
  isOpen,
  onClose,
}: SidebarProps) => {
  const pathname = usePathname();

  const sidebarContent = (
    <aside
      aria-label="Navigasi Admin"
      className="flex h-full w-60 flex-col bg-white shadow-sidebar"
    >
      {}
      <div className="flex h-[60px] shrink-0 items-center gap-2.5 border-b border-neutral-100 px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600">
          <GraduationCap className="h-4.5 w-4.5 text-white" aria-hidden="true" />
        </div>
        <span className="text-sm font-bold text-neutral-900 leading-tight">
          Admin SPMB
        </span>

        {}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup menu"
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {}
      <div className="flex shrink-0 items-center gap-3 border-b border-neutral-100 px-5 py-4">
        <Avatar name={adminName} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {adminName}
          </p>
          <p className="truncate text-xs text-neutral-500">{adminRole}</p>
        </div>
      </div>

      {}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menu utama">
        <ul role="list" className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
                    isActive
                      ? "border-l-[3px] border-primary-600 bg-primary-50 pl-[9px] font-semibold text-primary-600"
                      : "border-l-[3px] border-transparent font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-4.5 w-4.5 shrink-0",
                      isActive
                        ? "text-primary-600"
                        : "text-neutral-500 group-hover:text-neutral-700",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {}
      <div className="shrink-0 border-t border-neutral-100 px-5 py-3">
        <p className="text-[11px] text-neutral-400">
          SPMB Citra Negara &mdash; v1.0.0
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {}
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        {sidebarContent}
      </div>

      {}
      {isOpen && (
        <>
          {}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
            onClick={onClose}
          />
          {}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
