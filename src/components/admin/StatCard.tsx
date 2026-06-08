import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatCardProps {
  /** Judul kartu */
  title: string;
  /** Angka utama (sudah diformat sebagai string, mis. "1.248") */
  value: string;
  /** Node tambahan di bawah value: badge, teks, progress bar, dll. */
  meta?: ReactNode;
  /** Node di sudut kanan atas (ikon, dsb.) */
  icon?: ReactNode;
  /** Teks keterangan kecil di bawah meta */
  description?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, meta, icon, description }: StatCardProps) => (
  <article className="flex flex-col gap-3 rounded-card border border-neutral-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
    {/* ── Header row ── */}
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      {icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50">
          {icon}
        </div>
      )}
    </div>

    {/* ── Value ── */}
    <p className="text-3xl font-bold tracking-tight text-neutral-900">
      {value}
    </p>

    {/* ── Meta slot ── */}
    {meta && <div>{meta}</div>}

    {/* ── Description ── */}
    {description && (
      <p className="text-xs text-neutral-400 leading-snug">{description}</p>
    )}
  </article>
);

export default StatCard;
