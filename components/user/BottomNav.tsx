"use client";

import {
  ClipboardList,
  Home,
  LayoutDashboard,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/beranda", label: "Beranda", icon: Home },
  { href: "/formulir", label: "Formulir", icon: ClipboardList },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profil", label: "Profil", icon: User },
];

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 h-[60px] border-t border-neutral-200 bg-white shadow-lg">
      <div className="mx-auto flex h-full max-w-lg items-center justify-around px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-medium transition-colors",
                isActive ? "text-primary-600" : "text-neutral-500",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-5 w-5",
                  isActive ? "text-primary-600" : "text-neutral-500",
                ].join(" ")}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
