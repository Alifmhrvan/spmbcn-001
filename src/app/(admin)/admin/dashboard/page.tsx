"use client";

import StatCard from "@/components/admin/StatCard";
import { generateInitials } from "@/lib/utils";
import {
  Download,
  MoreHorizontal,
  TrendingUp,
  Users,
  FileCheck,
  CalendarDays,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Mock data ────────────────────────────────────────────────────────────────

const TREND_DATA: Record<string, { day: string; pendaftar: number }[]> = {
  "7d": [
    { day: "Sel", pendaftar: 24 },
    { day: "Rab", pendaftar: 38 },
    { day: "Kam", pendaftar: 31 },
    { day: "Jum", pendaftar: 55 },
    { day: "Sab", pendaftar: 17 },
    { day: "Min", pendaftar: 8 },
    { day: "Sen", pendaftar: 42 },
  ],
  "30d": [
    { day: "M1", pendaftar: 120 },
    { day: "M2", pendaftar: 185 },
    { day: "M3", pendaftar: 210 },
    { day: "M4", pendaftar: 276 },
  ],
  "3m": [
    { day: "Apr", pendaftar: 312 },
    { day: "Mei", pendaftar: 478 },
    { day: "Jun", pendaftar: 458 },
  ],
};

const ACTIVITIES = [
  {
    id: "1",
    nama: "Ahmad Fauzi R.",
    aksi: "mengunggah berkas Ijazah",
    waktu: "2 menit lalu",
    color: "bg-primary-600",
  },
  {
    id: "2",
    nama: "Siti Nur Aini",
    aksi: "melengkapi formulir pendaftaran",
    waktu: "14 menit lalu",
    color: "bg-amber-500",
  },
  {
    id: "3",
    nama: "Budi Santoso",
    aksi: "mengubah pilihan program studi",
    waktu: "1 jam lalu",
    color: "bg-purple-500",
  },
  {
    id: "4",
    nama: "Rina Maharani",
    aksi: "mengirimkan formulir pendaftaran",
    waktu: "2 jam lalu",
    color: "bg-rose-500",
  },
  {
    id: "5",
    nama: "Dika Pratama",
    aksi: "mendaftar akun baru",
    waktu: "3 jam lalu",
    color: "bg-teal-500",
  },
];

const JALUR_PERFORMANCE = [
  { nama: "Jalur Reguler",  total: 748, max: 900, color: "bg-primary-600",   badge: "bg-primary-100 text-primary-700" },
  { nama: "Jalur Prestasi", total: 312, max: 400, color: "bg-amber-500",     badge: "bg-amber-100 text-amber-700" },
  { nama: "Jalur Beasiswa", total: 188, max: 250, color: "bg-purple-500",    badge: "bg-purple-100 text-purple-700" },
];

const RANGE_OPTIONS = [
  { key: "7d",  label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "3m",  label: "Last 3 Months" },
] as const;

type RangeKey = "7d" | "30d" | "3m";

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Badge "+12% MoM" */
const GrowthBadge = ({ pct }: { pct: string }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
    <TrendingUp className="h-3 w-3" />
    {pct}
  </span>
);

/** Thin progress bar */
const ProgressBar = ({
  value,
  max,
  color = "bg-primary-600",
}: {
  value: number;
  max: number;
  color?: string;
}) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
    <div
      className={`h-full rounded-full ${color} transition-all duration-700`}
      style={{ width: `${Math.min(100, (value / max) * 100).toFixed(1)}%` }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
    />
  </div>
);

/** Card section header */
const SectionHeader = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-100">
    <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);

// ─── Tooltip personalisation ──────────────────────────────────────────────────

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-card-hover text-xs">
      <p className="font-semibold text-neutral-700">{label}</p>
      <p className="text-primary-600 font-bold">{payload[0].value} pendaftar</p>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [activityMenuOpen, setActivityMenuOpen] = useState(false);

  const totalPendaftar = 1_248;
  const jalurPlus = 312;
  const jalurReguler = 748;
  const pctReguler = ((jalurReguler / totalPendaftar) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* ── Page heading ── */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Ringkasan data penerimaan peserta didik baru TA 2025/2026
        </p>
      </div>

      {/* ══════════════════════════════════════════════
          1. STAT CARDS
      ══════════════════════════════════════════════ */}
      <section aria-label="Statistik utama">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total Pendaftar */}
          <StatCard
            title="Total Pendaftar"
            value={totalPendaftar.toLocaleString("id-ID")}
            icon={<Users className="h-4.5 w-4.5 text-primary-600" />}
            meta={
              <div className="flex items-center gap-2">
                <GrowthBadge pct="+12% MoM" />
                <span className="text-xs text-neutral-400">vs bulan lalu</span>
              </div>
            }
            description="Tahun akademik 2025/2026"
          />

          {/* Jalur Plus / Prestasi */}
          <StatCard
            title="Jalur Prestasi"
            value={jalurPlus.toLocaleString("id-ID")}
            icon={<FileCheck className="h-4.5 w-4.5 text-amber-500" />}
            meta={
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                48 menunggu verifikasi
              </span>
            }
            description="Menunggu tinjauan berkas fisik"
          />

          {/* Jalur Reguler */}
          <StatCard
            title="Jalur Reguler"
            value={jalurReguler.toLocaleString("id-ID")}
            icon={<CalendarDays className="h-4.5 w-4.5 text-purple-500" />}
            meta={
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>{pctReguler}% dari total</span>
                  <span>{jalurReguler} / {totalPendaftar}</span>
                </div>
                <ProgressBar value={jalurReguler} max={totalPendaftar} />
              </div>
            }
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          2 & 3. CHART + RECENT ACTIVITY
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── 2. Registration Trends ── */}
        <section
          aria-label="Tren pendaftaran"
          className="rounded-card border border-neutral-200 bg-white p-5 shadow-card lg:col-span-2"
        >
          <SectionHeader title="Tren Pendaftaran">
            <select
              id="trend-range-select"
              value={range}
              onChange={(e) => setRange(e.target.value as RangeKey)}
              className="rounded-btn border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
              aria-label="Rentang waktu"
            >
              {RANGE_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </SectionHeader>

          <div className="mt-5 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={TREND_DATA[range]}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradPendaftar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2E7D32" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#ADB5BD" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#ADB5BD" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#2E7D32", strokeWidth: 1, strokeDasharray: "4 2" }} />
                <Area
                  type="monotone"
                  dataKey="pendaftar"
                  stroke="#2E7D32"
                  strokeWidth={2.5}
                  fill="url(#gradPendaftar)"
                  dot={{ r: 3.5, fill: "#2E7D32", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#2E7D32", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── 3. Recent Activity ── */}
        <section
          aria-label="Aktivitas terbaru"
          className="rounded-card border border-neutral-200 bg-white p-5 shadow-card"
        >
          <SectionHeader title="Aktivitas Terbaru">
            <div className="relative">
              <button
                type="button"
                id="activity-menu-btn"
                aria-haspopup="true"
                aria-expanded={activityMenuOpen}
                onClick={() => setActivityMenuOpen((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {activityMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden="true"
                    onClick={() => setActivityMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 min-w-[130px] rounded-lg border border-neutral-200 bg-white py-1 shadow-card-hover text-sm">
                    {["Tandai semua dibaca", "Export aktivitas"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setActivityMenuOpen(false)}
                        className="w-full px-3 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </SectionHeader>

          {/* Activity list */}
          <ul role="list" className="mt-4 space-y-3.5">
            {ACTIVITIES.map((act) => (
              <li key={act.id} className="flex items-start gap-3">
                {/* Avatar initials */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${act.color} text-[11px] font-semibold text-white`}
                  aria-hidden="true"
                >
                  {generateInitials(act.nama)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-800 leading-snug">
                    <span className="font-semibold">{act.nama}</span>{" "}
                    {act.aksi}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    {act.waktu}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* View all */}
          <button
            type="button"
            id="btn-view-all-activities"
            className="mt-5 w-full rounded-btn border-2 border-neutral-200 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            Lihat Semua Aktivitas
          </button>
        </section>
      </div>

      {/* ══════════════════════════════════════════════
          4. ADMISSION PATH PERFORMANCE
      ══════════════════════════════════════════════ */}
      <section
        aria-label="Performa jalur penerimaan"
        className="rounded-card border border-neutral-200 bg-white p-5 shadow-card"
      >
        <SectionHeader title="Performa Jalur Penerimaan">
          <button
            type="button"
            id="btn-export-report"
            className="flex items-center gap-1.5 rounded-btn bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export Report
          </button>
        </SectionHeader>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Jalur cards */}
          {JALUR_PERFORMANCE.map((jalur) => {
            const pct = ((jalur.total / jalur.max) * 100).toFixed(1);
            return (
              <div
                key={jalur.nama}
                className="rounded-lg border border-neutral-200 p-4 space-y-3"
              >
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${jalur.badge}`}
                >
                  {jalur.nama}
                </span>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {jalur.total.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-neutral-400">
                    dari kuota {jalur.max.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium text-neutral-500">
                    <span>Completion</span>
                    <span>{pct}%</span>
                  </div>
                  <ProgressBar value={jalur.total} max={jalur.max} color={jalur.color} />
                </div>
              </div>
            );
          })}

          {/* System Status card */}
          <div className="rounded-lg bg-primary-600 p-4 text-white space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-200">
              System Status
            </p>
            <div className="space-y-2">
              {[
                { label: "Server",    status: "Online" },
                { label: "Database",  status: "Normal" },
                { label: "Storage",   status: "73% used" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-xs text-primary-200">{row.label}</span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-300" />
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-1 border-t border-primary-500">
              <p className="text-[11px] text-primary-300">
                Terakhir sinkron: 5 mnt lalu
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
