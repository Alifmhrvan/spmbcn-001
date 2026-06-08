"use client";

import StatusTimeline, {
  type TimelineStep,
} from "@/components/user/StatusTimeline";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getStatusColor } from "@/lib/utils";
import {
  BookOpen,
  CheckCircle2,
  Search,
  XCircle,
  AlertCircle,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";

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
  { label: string; icon: typeof CheckCircle2; color: string; desc: string }
> = {
  lulus: {
    label: "Lulus",
    icon: CheckCircle2,
    color: "text-primary-600",
    desc: "Selamat! Kamu dinyatakan lulus seleksi. Segera lakukan daftar ulang.",
  },
  ditolak: {
    label: "Tidak Lulus",
    icon: XCircle,
    color: "text-danger",
    desc: "Maaf, kamu belum berhasil pada seleksi kali ini. Tetap semangat!",
  },
  menunggu: {
    label: "Menunggu",
    icon: ClipboardList,
    color: "text-neutral-500",
    desc: "Pendaftaranmu sedang dalam antrian verifikasi.",
  },
  diverifikasi: {
    label: "Diverifikasi",
    icon: AlertCircle,
    color: "text-amber-600",
    desc: "Dokumenmu sedang diproses. Pengumuman akan segera keluar.",
  },
};

const HasilPage = () => {
  const [nomor, setNomor] = useState("");
  const [hasil, setHasil] = useState<HasilSeleksi | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleCari = async () => {
    const trimmed = nomor.trim().toUpperCase();
    if (!trimmed) {
      setError("Nomor pendaftaran wajib diisi");
      return;
    }

    setError("");
    setLoading(true);
    setSearched(false);
    setHasil(null);

    try {
      const { data } = await api.get<HasilSeleksi>(
        `/api/pendaftaran/hasil?nomor=${trimmed}`,
      );
      setHasil(data);
    } catch {
      setHasil(null);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const config = hasil ? STATUS_CONFIG[hasil.status] : null;
  const StatusIcon = config?.icon;

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">
          Pengumuman Seleksi
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Masukkan nomor pendaftaran untuk melihat hasil seleksi kamu.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Contoh: SPMB-2025-10042"
            value={nomor}
            onChange={(e) => {
              setNomor(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCari()}
            icon={<Search className="h-4 w-4" />}
            error={error}
          />
        </div>
        <Button onClick={handleCari} loading={loading} className="mt-0 shrink-0">
          Cari
        </Button>
      </div>

      {loading && (
        <div className="mt-10 flex flex-col items-center gap-3 text-neutral-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Mencari data...</p>
        </div>
      )}

      {searched && !loading && !hasil && (
        <div className="mt-10 flex flex-col items-center gap-3 text-center text-neutral-500">
          <AlertCircle className="h-10 w-10 text-neutral-300" />
          <p className="font-medium text-neutral-700">Data tidak ditemukan</p>
          <p className="text-sm">
            Nomor pendaftaran tidak terdaftar. Periksa kembali nomor yang kamu
            masukkan.
          </p>
        </div>
      )}

      {hasil && config && StatusIcon && (
        <div className="mt-6 space-y-4">
          <div className="rounded-card border border-neutral-200 bg-white p-5 shadow-card">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-neutral-400">
                  Nomor Pendaftaran
                </p>
                <p className="font-mono text-sm font-semibold text-neutral-800">
                  {hasil.nomorPendaftaran}
                </p>
              </div>
              <Badge status={hasil.status} label={config.label} />
            </div>

            <div
              className={[
                "mb-4 flex items-start gap-3 rounded-lg p-3",
                hasil.status === "lulus" ? "bg-primary-50" : "bg-neutral-50",
              ].join(" ")}
            >
              <StatusIcon
                className={["h-5 w-5 mt-0.5 shrink-0", config.color].join(" ")}
              />
              <p className="text-sm text-neutral-700">{config.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-neutral-400">Nama</p>
                <p className="font-medium text-neutral-800">
                  {hasil.namaLengkap}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Program Studi</p>
                <p className="font-medium text-neutral-800">
                  {hasil.programStudi}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Jalur</p>
                <p className="font-medium text-neutral-800">{hasil.jalur}</p>
              </div>
            </div>

            {hasil.catatan && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-medium text-amber-700">
                  Catatan dari Admin
                </p>
                <p className="mt-1 text-sm text-amber-800">{hasil.catatan}</p>
              </div>
            )}
          </div>

          <div className="rounded-card border border-neutral-200 bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary-600" />
              <h2 className="text-sm font-semibold text-neutral-800">
                Progres Pendaftaran
              </h2>
            </div>
            <StatusTimeline steps={hasil.timeline} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HasilPage;
