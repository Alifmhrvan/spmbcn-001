"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Program", href: "#program" },
  { label: "Jalur", href: "#jalur" },
  { label: "Alur Daftar", href: "#alur" },
  { label: "Kontak", href: "#kontak" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-neutral-200"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/landing" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-700 transition-colors">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-neutral-900 tracking-tight">SMK Citra Negara</p>
            <p className="text-[10px] text-neutral-500 font-medium">Depok, Jawa Barat</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3.5 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-150"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-primary-600 border border-primary-600 rounded-btn hover:bg-primary-50 transition-colors duration-150"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-btn hover:bg-primary-700 transition-colors duration-150"
          >
            Daftar Sekarang
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <div
        className={`md:hidden bg-white border-t border-neutral-100 overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 space-y-2 border-t border-neutral-100 mt-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-primary-600 border border-primary-600 rounded-btn hover:bg-primary-50 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-btn hover:bg-primary-700 transition-colors"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
