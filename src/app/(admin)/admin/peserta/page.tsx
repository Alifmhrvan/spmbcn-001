"use client";

import Badge from "@/components/ui/Badge";
import { generateInitials } from "@/lib/utils";
import api from "@/lib/api";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  RotateCcw,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type JalurFilter  = "semua" | "plus" | "reguler" | "mandiri";
type StatusFilter = "semua" | "diverifikasi" | "lulus" | "ditolak" | "menunggu";

interface Peserta {
  id: string;
  nomorPendaftaran: string;
  namaLengkap: string;
  email: string;
  programStudi: string;
  jalur: string;
  status: StatusFilter;
}

interface PesertaResponse {
  data: Peserta[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Mock fallback data (saat API belum siap) ─────────────────────────────────

const MOCK_PESERTA: Peserta[] = Array.from({ length: 10 }, (_, i) => ({
  id:               `peserta-${i + 1}`,
  nomorPendaftaran: `SPMB-2025-${String(10042 + i).padStart(5, "0")}`,
  namaLengkap:      ["Ahmad Fauzi R.", "Siti Nur Aini", "Budi Santoso", "Rina Maharani",
                     "Dika Pratama", "Nadia Kusuma", "Fajar Hidayat", "Lilis Marlina",
                     "Rizal Akbar", "Dewi Anggraini"][i],
  email:            `peserta${i + 1}@email.com`,
  programStudi:     ["Teknik Informatika", "Sistem Informasi", "Manajemen", "Akuntansi",
                     "Hukum", "Teknik Informatika", "Manajemen", "Sistem Informasi",
                     "Akuntansi", "Hukum"][i],
  jalur:            ["Reguler", "Plus", "Reguler", "Mandiri", "Plus",
                     "Reguler", "Mandiri", "Plus", "Reguler", "Plus"][i],
  status:           (["diverifikasi", "lulus", "menunggu", "ditolak", "diverifikasi",
                      "lulus", "menunggu", "diverifikasi", "ditolak", "lulus"] as StatusFilter[])[i],
}));

const MOCK_RESPONSE: PesertaResponse = {
  data: MOCK_PESERTA,
  meta: { total: 1248, page: 1, limit: 10, totalPages: 125 },
};

// ─── Filter config ────────────────────────────────────────────────────────────

const JALUR_OPTS: { value: JalurFilter; label: string }[] = [
  { value: "semua",   label: "Semua"   },
  { value: "plus",    label: "Plus"    },
  { value: "reguler", label: "Reguler" },
  { value: "mandiri", label: "Mandiri" },
];

const STATUS_OPTS: { value: StatusFilter; label: string }[] = [
  { value: "semua",       label: "Semua"       },
  { value: "diverifikasi",label: "Diverifikasi" },
  { value: "lulus",       label: "Lulus"       },
  { value: "ditolak",     label: "Ditolak"     },
  { value: "menunggu",    label: "Menunggu"    },
];

const STATUS_LABEL: Record<StatusFilter, string> = {
  semua:       "Semua",
  diverifikasi:"Diverifikasi",
  lulus:       "Lulus",
  ditolak:     "Ditolak",
  menunggu:    "Menunggu",
};

// ─── Avatar chip ──────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-primary-600", "bg-amber-500", "bg-purple-500",
  "bg-rose-500",    "bg-teal-500",  "bg-indigo-500",
];

const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─── Filter pill button ───────────────────────────────────────────────────────

const FilterPill = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
      active
        ? "bg-primary-600 text-white shadow-sm"
        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
    ].join(" ")}
  >
    {children}
  </button>
);

// ─── Skeleton row ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 rounded bg-neutral-100" style={{ width: `${60 + (i * 13) % 35}%` }} />
      </td>
    ))}
  </tr>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PesertaPage() {
  const [search,     setSearch]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [jalur,      setJalur]      = useState<JalurFilter>("semua");
  const [status,     setStatus]     = useState<StatusFilter>("semua");
  const [page,       setPage]       = useState(1);
  const LIMIT = 10;

  // Debounce search — reset to page 1 on new query
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [jalur, status]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setJalur("semua");
    setStatus("semua");
    setPage(1);
  }, []);

  const isFiltered =
    debouncedSearch !== "" || jalur !== "semua" || status !== "semua";

  // ── Data fetching ──
  const { data, isLoading, isError, isFetching } = useQuery<PesertaResponse>({
    queryKey: ["admin", "peserta", { page, search: debouncedSearch, jalur, status }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page:   String(page),
        limit:  String(LIMIT),
        ...(debouncedSearch             && { search: debouncedSearch }),
        ...(jalur   !== "semua"         && { jalur }),
        ...(status  !== "semua"         && { status }),
      });
      const { data } = await api.get<PesertaResponse>(`/api/admin/peserta?${params}`);
      return data;
    },
    placeholderData: keepPreviousData,
    // Fall back to mock if API not available (dev convenience)
    // Remove this in production
  });

  // Use mock when no real data yet
  const resolved = data ?? MOCK_RESPONSE;
  const pesertaList = isError ? MOCK_PESERTA : (resolved.data ?? MOCK_PESERTA);
  const meta        = isError ? MOCK_RESPONSE.meta : (resolved.meta ?? MOCK_RESPONSE.meta);

  const { total, totalPages } = meta;
  const from = (page - 1) * LIMIT + 1;
  const to   = Math.min(page * LIMIT, total);

  // ── Pagination helpers ──
  const pages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)       return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3) return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  })();

  return (
    <div className="space-y-5">

      {/* ── 1. Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Daftar Peserta</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Kelola dan pantau data seluruh peserta pendaftaran
          </p>
        </div>
      </div>

      {/* ── 2. Search bar ── */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden="true"
        />
        <input
          id="peserta-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan nama atau ID pendaftaran..."
          className="w-full rounded-card border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-card transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
        {isFetching && (
          <Loader2
            className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400"
            aria-hidden="true"
          />
        )}
      </div>

      {/* ── 3. Stat card + Filters row ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">

        {/* Total Pendaftar card */}
        <div className="flex flex-col justify-between rounded-card bg-primary-600 p-5 text-white shadow-card lg:col-span-1">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-200">
              Total Pendaftar
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <Users className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
          </div>
          <div>
            <p className="mt-3 text-4xl font-bold tracking-tight">
              {total.toLocaleString("id-ID")}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-full bg-primary-500 px-2 py-0.5 text-[11px] font-semibold text-green-300">
                <TrendingUp className="h-3 w-3" />
                +87 minggu ini
              </span>
            </div>
            <p className="mt-1.5 text-xs text-primary-300">
              dibanding minggu lalu (+7.5%)
            </p>
          </div>
        </div>

        {/* ── 4. Filter panel ── */}
        <div className="rounded-card border border-neutral-200 bg-white p-4 shadow-card lg:col-span-3">
          <div className="space-y-3">
            {/* Jalur filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-28 shrink-0 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Jalur Masuk
              </span>
              <div className="flex flex-wrap gap-1.5">
                {JALUR_OPTS.map((opt) => (
                  <FilterPill
                    key={opt.value}
                    active={jalur === opt.value}
                    onClick={() => setJalur(opt.value)}
                  >
                    {opt.label}
                  </FilterPill>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-100" />

            {/* Status filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-28 shrink-0 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Status Verifikasi
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTS.map((opt) => (
                  <FilterPill
                    key={opt.value}
                    active={status === opt.value}
                    onClick={() => setStatus(opt.value)}
                  >
                    {opt.label}
                  </FilterPill>
                ))}
              </div>
            </div>

            {/* Reset */}
            {isFiltered && (
              <div className="flex justify-end border-t border-neutral-100 pt-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Semua Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 5. Table ── */}
      <div className="rounded-card border border-neutral-200 bg-white shadow-card overflow-hidden">

        {/* Table wrapper — horizontal scroll on small screens */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                {["Nama Lengkap", "ID Pendaftaran", "Program Studi", "Jalur", "Status", "Aksi"].map(
                  (col) => (
                    <th
                      key={col}
                      scope="col"
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {isLoading
                ? Array.from({ length: LIMIT }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                : pesertaList.map((p) => (
                    <tr
                      key={p.id}
                      className="group transition-colors hover:bg-neutral-50"
                    >
                      {/* Nama + email + avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${avatarColor(p.namaLengkap)}`}
                            aria-hidden="true"
                          >
                            {generateInitials(p.namaLengkap)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-neutral-900">
                              {p.namaLengkap}
                            </p>
                            <p className="truncate text-xs text-neutral-400">
                              {p.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium text-neutral-700">
                          {p.nomorPendaftaran}
                        </span>
                      </td>

                      {/* Prodi */}
                      <td className="px-4 py-3">
                        <span className="text-neutral-700">{p.programStudi}</span>
                      </td>

                      {/* Jalur */}
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                          {p.jalur}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <Badge
                          status={p.status}
                          label={STATUS_LABEL[p.status] ?? p.status}
                        />
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/verifikasi/${p.id}`}
                          className="inline-flex items-center gap-1.5 rounded-btn border-2 border-neutral-300 px-2.5 py-1 text-xs font-semibold text-neutral-700 transition-colors hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700"
                          aria-label={`Detail peserta ${p.namaLengkap}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {!isLoading && pesertaList.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
              <Users className="h-7 w-7 text-neutral-400" />
            </div>
            <p className="font-semibold text-neutral-600">Tidak ada peserta ditemukan</p>
            <p className="text-sm text-neutral-400">Coba ubah filter atau kata kunci pencarian</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
            >
              <RotateCcw className="h-4 w-4" />
              Reset filter
            </button>
          </div>
        )}

        {/* ── Pagination ── */}
        {pesertaList.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex-row">
            {/* Info */}
            <p className="text-xs text-neutral-500">
              Menampilkan{" "}
              <span className="font-semibold text-neutral-800">
                {from}–{to}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-neutral-800">
                {total.toLocaleString("id-ID")}
              </span>{" "}
              peserta
            </p>

            {/* Controls */}
            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                type="button"
                aria-label="Halaman sebelumnya"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page numbers */}
              {pages.map((p, idx) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex h-8 w-8 items-center justify-center text-xs text-neutral-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    aria-label={`Halaman ${p}`}
                    aria-current={page === p ? "page" : undefined}
                    onClick={() => setPage(p as number)}
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-colors",
                      page === p
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                type="button"
                aria-label="Halaman berikutnya"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
