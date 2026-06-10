"use client";

import StatusTimeline, {
  type TimelineStep,
} from "@/components/user/StatusTimeline";
import { getStatusColor } from "@/lib/utils";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import api from "@/lib/api";
import axios from "axios";
import { useState } from "react";

type StatusPendaftaran = "lulus" | "ditolak" | "menunggu" | "diverifikasi";

interface HasilSeleksi {
  nomorPendaftaran: string;
  namaLengkap: string;
  programStudi: string;
  jalur: string;
  status: StatusPendaftaran;
  catatan?: string;
  timeline: TimelineStep[];
}

const STATUS_CONFIG: Record<
  StatusPendaftaran,
  {
    label: string;
    icon: React.ElementType;
    cardClass: string;
    textClass: string;
    badgeClass: string;
  }
> = {
  lulus: {
    label: "LULUS SELEKSI",
    icon: CheckCircle2,
    cardClass: "bg-accent/10 border-accent/40",
    textClass: "text-amber-700",
    badgeClass: "bg-accent/20 text-amber-800",
  },
  diverifikasi: {
    label: "SEDANG DIVERIFIKASI",
    icon: ClipboardList,
    cardClass: "bg-primary-50 border-primary-200",
    textClass: "text-primary-700",
    badgeClass: "bg-primary-100 text-primary-700",
  },
  menunggu: {
    label: "MENUNGGU VERIFIKASI",
    icon: AlertCircle,
    cardClass: "bg-neutral-50 border-neutral-200",
    textClass: "text-neutral-700",
    badgeClass: "bg-neutral-200 text-neutral-700",
  },
  ditolak: {
    label: "TIDAK LULUS",
    icon: XCircle,
    cardClass: "bg-red-50 border-red-200",
    textClass: "text-danger",
    badgeClass: "bg-red-100 text-danger",
  },
};

const DashboardPage = () => {
  const [inputNomor, setInputNomor] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasil, setHasil] = useState<HasilSeleksi | null | undefined>(
    undefined,
  );

  const handleCek = async () => {
    const trimmed = inputNomor.trim().toUpperCase();
    if (!trimmed) return;
    setIsSearching(true);
    setHasil(undefined);
    try {
      const { data } = await api.get<HasilSeleksi>(`/api/pendaftaran/hasil?nomor=${encodeURIComponent(trimmed)}`);
      setHasil(data ?? null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) setHasil(null);
      else setHasil(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCek();
  };

  const cfg = hasil ? STATUS_CONFIG[hasil.status] : null;

  return (
    <div className="space-y-5 py-4">
      {}
      <div>
        <h1 className="text-lg font-bold text-neutral-900">
          Cek Status Pendaftaran
        </h1>
        <p className="text-sm text-neutral-500">
          Masukkan nomor pendaftaran untuk melihat hasil seleksi
        </p>
      </div>

      {}
      <div className="rounded-card border border-neutral-200 bg-white p-4 shadow-card space-y-3">
        <label
          htmlFor="nomor-peserta"
          className="block text-sm font-medium text-neutral-700"
        >
          Nomor Peserta
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id="nomor-peserta"
              type="text"
              placeholder="Contoh: SPMB-2025-XXXXX"
              value={inputNomor}
              onChange={(e) => setInputNomor(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              className="w-full rounded-btn border border-neutral-300 bg-neutral-50 py-2.5 pl-9 pr-3 text-sm font-mono text-neutral-900 placeholder:font-sans placeholder:text-neutral-400 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <button
            type="button"
            id="btn-cek-status"
            onClick={handleCek}
            disabled={isSearching || !inputNomor.trim()}
            className="flex h-10 items-center gap-2 rounded-btn bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Cek
          </button>
        </div>

      </div>

      {}
      {isSearching && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm text-neutral-500">Mencari data pendaftaran…</p>
        </div>
      )}

      {}
      {!isSearching && hasil === null && (
        <div className="flex flex-col items-center gap-3 rounded-card border border-neutral-200 bg-white px-4 py-10 text-center shadow-card">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
            <AlertCircle className="h-7 w-7 text-neutral-400" />
          </div>
          <div>
            <p className="font-semibold text-neutral-700">
              Nomor Tidak Ditemukan
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              Pastikan nomor pendaftaran sudah benar dan sesuai
            </p>
          </div>
        </div>
      )}

      {}
      {!isSearching && hasil && cfg && (
        <div className="space-y-4">
          {}
          <div
            role="status"
            aria-live="polite"
            className={[
              "rounded-card border-2 p-4 transition-all",
              cfg.cardClass,
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div
                className={[
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                  hasil.status === "lulus"
                    ? "bg-accent/20"
                    : hasil.status === "ditolak"
                      ? "bg-red-100"
                      : "bg-primary-100",
                ].join(" ")}
              >
                <cfg.icon
                  className={["h-6 w-6", cfg.textClass].join(" ")}
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1">
                <span
                  className={[
                    "inline-block rounded-full px-2.5 py-0.5 text-xs font-bold tracking-widest uppercase",
                    cfg.badgeClass,
                  ].join(" ")}
                >
                  {cfg.label}
                </span>
                <p className="mt-1.5 text-base font-bold text-neutral-900">
                  {hasil.namaLengkap}
                </p>
                <p className="text-xs text-neutral-500 font-mono">
                  {hasil.nomorPendaftaran}
                </p>
              </div>
            </div>

            {}
            {hasil.status === "ditolak" && hasil.catatan && (
              <div className="mt-3 rounded-lg bg-red-100 px-3 py-2">
                <p className="text-xs font-medium text-danger">
                  Alasan: {hasil.catatan}
                </p>
              </div>
            )}

            {}
            {hasil.status === "lulus" && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent/20 px-3 py-2">
                <span className="text-lg">🎉</span>
                <p className="text-xs font-semibold text-amber-800">
                  Selamat! Anda dinyatakan LULUS SELEKSI. Segera lakukan daftar ulang.
                </p>
              </div>
            )}
          </div>

          {}
          <div className="rounded-card border border-neutral-200 bg-white shadow-card overflow-hidden">
            <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2.5 border-b border-neutral-200">
              <BookOpen className="h-4 w-4 text-primary-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
                Detail Program
              </h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {[
                { label: "Program Studi", value: hasil.programStudi },
                { label: "Jalur Pendaftaran", value: hasil.jalur },
                {
                  label: "Status",
                  value: (
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        getStatusColor(hasil.status),
                      ].join(" ")}
                    >
                      {hasil.status}
                    </span>
                  ),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm"
                >
                  <span className="w-32 shrink-0 text-neutral-500">
                    {row.label}
                  </span>
                  <span className="font-medium text-neutral-800">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="rounded-card border border-neutral-200 bg-white p-4 shadow-card">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">
              Tahapan Selanjutnya
            </h2>
            <StatusTimeline steps={hasil.timeline} />
          </div>
        </div>
      )}

      {}
      {!isSearching && hasil === undefined && (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-neutral-300 px-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
            <ClipboardList className="h-7 w-7 text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-neutral-600">
              Masukkan nomor pendaftaran
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              Hasil seleksi akan ditampilkan di sini
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
