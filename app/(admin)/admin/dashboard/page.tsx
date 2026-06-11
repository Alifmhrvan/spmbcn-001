"use client";

import StatCard from "@/components/admin/StatCard";
import { generateInitials } from "@/lib/utils";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
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

const RANGE_OPTIONS = [
  { key: "7d",  label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "3m",  label: "Last 3 Months" },
] as const;

type RangeKey = "7d" | "30d" | "3m";

interface DashboardStats {
  totalPendaftar: number;
  growth: string;

  perStatus: Record<string, number>;

  perJalur: {
    id: string;
    nama: string;
    total: number;
  }[];

  programStudi: {
    id: string;
    nama: string;
    kuota: number;
    terisi: number;
  }[];

  trend7d: {
    day: string;
    pendaftar: number;
  }[];

  aktivitasTerbaru: {
    id: string;
    nama: string;
    status: string;
    waktu: string;
  }[];
}

const GrowthBadge = ({ pct }: { pct: string }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
    <TrendingUp className="h-3 w-3" />
    {pct}
  </span>
);

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
      style={{ width: `${Math.min(100, max > 0 ? (value / max) * 100 : 0).toFixed(1)}%` }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
    />
  </div>
);

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

const JALUR_COLORS = [
  { color: "bg-primary-600", badge: "bg-primary-100 text-primary-700" },
  { color: "bg-amber-500",   badge: "bg-amber-100 text-amber-700" },
  { color: "bg-purple-500",  badge: "bg-purple-100 text-purple-700" },
  { color: "bg-rose-500",    badge: "bg-rose-100 text-rose-700" },
];

const SkeletonCard = () => (
  <div className="h-28 w-full animate-pulse rounded-card bg-neutral-100" />
);

export default function AdminDashboardPage() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [activityMenuOpen, setActivityMenuOpen] = useState(false);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.get("/api/admin/dashboard").then((r) => r.data),
    refetchInterval: 30_000,
  });

  const totalPendaftar = stats?.totalPendaftar ?? 0;
  const menunggu = stats?.perStatus?.menunggu ?? 0;
  const perJalur = stats?.perJalur ?? [];

  
  const topJalur = [...perJalur].sort((a, b) => b.total - a.total)[0];
  const topJalurTotal = topJalur?.total ?? 0;
  const topJalurPct = totalPendaftar > 0
    ? ((topJalurTotal / totalPendaftar) * 100).toFixed(1)
    : "0.0";

  
  const trendData = stats?.trend7d ?? [];
  const tahun = new Date().getFullYear();
const tahunAkademik = `${tahun}/${tahun + 1}`;

const topProdi = stats?.programStudi?.[0];

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Ringkasan data penerimaan peserta didik baru TA {tahunAkademik}
        </p>
      </div>

      {}
      <section aria-label="Statistik utama">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              {}
              <StatCard
                title="Total Pendaftar"
                value={totalPendaftar.toLocaleString("id-ID")}
                icon={<Users className="h-4.5 w-4.5 text-primary-600" />}
                meta={
                  <div className="flex items-center gap-2">
                    <GrowthBadge pct={`${stats?.growth ?? 0}%`} />
                    <span className="text-xs text-neutral-400">vs bulan lalu</span>
                  </div>
                }
                description={`Tahun akademik ${tahunAkademik}`}
              />

              {}
              <StatCard
                title="Menunggu Verifikasi"
                value={menunggu.toLocaleString("id-ID")}
                icon={<FileCheck className="h-4.5 w-4.5 text-amber-500" />}
                meta={
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    {menunggu} menunggu verifikasi
                  </span>
                }
                description="Menunggu tinjauan berkas"
              />

              {}
              
              <StatCard
                title={topJalur?.nama ?? "Jalur"}
                value={topJalurTotal.toLocaleString("id-ID")}
                icon={<CalendarDays className="h-4.5 w-4.5 text-purple-500" />}
                meta={
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>{topJalurPct}% dari total</span>
                      <span>{topJalurTotal} / {totalPendaftar}</span>
                    </div>
                    <ProgressBar value={topJalurTotal} max={totalPendaftar} />
                  </div>
                }
              />

              <StatCard
  title="Prodi Terfavorit"
  value={topProdi?.nama ?? "-"}
  icon={<Users className="h-4.5 w-4.5 text-green-600" />}
  meta={
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
      {topProdi?.terisi ?? 0} pendaftar
    </span>
  }
  description={`Kuota ${topProdi?.kuota ?? 0}`}
/>
            </>
          )}
        </div>
      </section>
      

      {}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {}
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

          <div className="mt-5 h-52 min-h-[208px]">
            {isLoading ? (
              <div className="h-full w-full animate-pulse rounded-lg bg-neutral-100" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
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
            )}
          </div>
        </section>

        {}
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
                    {["Tandai semua dibaca"].map((item) => (
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

          {}
          <ul role="list" className="mt-4 space-y-3.5">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-neutral-200" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-200" />
                      <div className="h-2.5 w-1/2 animate-pulse rounded bg-neutral-100" />
                    </div>
                  </li>
                ))
              : (stats?.aktivitasTerbaru ?? []).map((act, i) => {
                  const colors = ["bg-primary-600", "bg-amber-500", "bg-purple-500", "bg-rose-500", "bg-teal-500"];
                  return (
                    <li key={act.id} className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors[i % colors.length]} text-[11px] font-semibold text-white`}
                        aria-hidden="true"
                      >
                        {generateInitials(act.nama)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-neutral-800 leading-snug">
                          <span className="font-semibold">{act.nama}</span>{" "}
                          memperbarui status ke{" "}
                          <span className="font-medium">{act.status}</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-neutral-400">
                          {new Date(act.waktu).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </li>
                  );
                })}
          </ul>


        </section>
      </div>

      {}
      <section
        aria-label="Performa jalur penerimaan"
        className="rounded-card border border-neutral-200 bg-white p-5 shadow-card"
      >
        <SectionHeader title="Performa Jalur Penerimaan" />

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-lg bg-neutral-100" />
              ))
            : perJalur.map((jalur, i) => {
                const clr = JALUR_COLORS[i % JALUR_COLORS.length];
                
                const estimasiMax = Math.max(jalur.total, Math.ceil(jalur.total * 1.2));
                const pct = estimasiMax > 0
                  ? ((jalur.total / estimasiMax) * 100).toFixed(1)
                  : "0.0";
                return (
                  <div
                    key={jalur.id}
                    className="rounded-lg border border-neutral-200 p-4 space-y-3"
                  >
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${clr.badge}`}
                    >
                      {jalur.nama}
                    </span>
                    <div>
                      <p className="text-2xl font-bold text-neutral-900">
                        {jalur.total.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-neutral-400">
                        total pendaftar
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-medium text-neutral-500">
                        <span>dari total</span>
                        <span>
                          {totalPendaftar > 0
                            ? ((jalur.total / totalPendaftar) * 100).toFixed(1)
                            : "0"}
                          %
                        </span>
                      </div>
                      <ProgressBar value={jalur.total} max={totalPendaftar} color={clr.color} />
                    </div>
                  </div>
                );
              })}

          {}
          <div className="rounded-lg bg-primary-600 p-4 text-white space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-200">
              System Status
            </p>
            <div className="space-y-2">
              {[
                { label: "Server",    status: "Online" },
                { label: "Database",  status: "Normal" },
                { label: "Storage",   status: "Active" },
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
                Auto-refresh setiap 30 detik
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}