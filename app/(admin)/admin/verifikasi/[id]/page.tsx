
"use client";

import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import api from "@/lib/api";
import { formatDate, formatFileSize, generateInitials } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  File,
  FileImage,
  FileText,
  Info,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

type StatusPendaftaran = "menunggu" | "diverifikasi" | "lulus" | "ditolak";

interface DokumenItem {
  id: string;
  jenis: string;
  namaFile: string;
  format: string;
  ukuran: number;
  uploadedAt: string;
  url: string;
}

interface PendaftarDetail {
  id: string;
  nomorPendaftaran: string;
  namaLengkap: string;
  email: string;
  programStudi: string | { nama: string };
  asalSekolah: string;
  jalur: string | { nama: string };
  status: StatusPendaftaran;
  dokumen: DokumenItem[];
}

interface VerifikasiPayload {
  keputusan: "setujui" | "tolak";
  catatan: string;
}

const JALUR_BADGE: Record<string, string> = {
  Reguler:  "bg-primary-100 text-primary-700",
  Plus:     "bg-amber-100 text-amber-700",
  Prestasi: "bg-amber-100 text-amber-700",
  Mandiri:  "bg-purple-100 text-purple-700",
  Beasiswa: "bg-teal-100 text-teal-700",
};

const AVATAR_COLORS = [
  "bg-primary-600", "bg-amber-500", "bg-purple-500",
  "bg-rose-500",    "bg-teal-500",  "bg-indigo-500",
];
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

function resolveStr(v: string | { nama: string } | undefined): string {
  if (!v) return "-";
  if (typeof v === "string") return v;
  return v.nama;
}

function FileIcon({ format }: { format: string }) {
  const fmt = format.toLowerCase();
  if (fmt === "pdf")
    return <FileText className="h-5 w-5 text-rose-500" aria-hidden="true" />;
  if (["jpg", "jpeg", "png", "webp"].includes(fmt))
    return <FileImage className="h-5 w-5 text-sky-500" aria-hidden="true" />;
  return <File className="h-5 w-5 text-neutral-400" aria-hidden="true" />;
}

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return `${diff} detik lalu`;
  if (diff < 3600)  return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return formatDate(iso);
}

const STATUS_LABEL: Record<StatusPendaftaran, string> = {
  menunggu:     "Menunggu",
  diverifikasi: "Diverifikasi",
  lulus:        "Lulus",
  ditolak:      "Ditolak",
};

const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-card border border-neutral-200 bg-white shadow-card ${className}`}>
    {children}
  </div>
);

const CardHeader = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-2.5 border-b border-neutral-100 px-5 py-4">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
      {icon}
    </div>
    <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
  </div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-neutral-100 ${className}`} />
);

const PreviewModal = ({
  doc,
  onClose,
}: {
  doc: DokumenItem | null;
  onClose: () => void;
}) => (
  <Modal isOpen={!!doc} onClose={onClose} title={doc?.jenis ?? "Preview Berkas"}>
    {doc && (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <FileIcon format={doc.format} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-neutral-800">{doc.namaFile}</p>
            <p className="text-xs text-neutral-400">
              {doc.format} · {formatFileSize(doc.ukuran)} · {relativeTime(doc.uploadedAt)}
            </p>
          </div>
        </div>

        {["jpg", "jpeg", "png", "webp"].includes(doc.format.toLowerCase()) ? (
          <div className="flex h-48 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
            {}
            {doc.url && doc.url !== "#" ? (
              
              <img src={doc.url} alt={doc.namaFile} className="h-full w-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-400">
                <FileImage className="h-10 w-10" />
                <span className="text-xs">Preview gambar</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50">
            <div className="flex flex-col items-center gap-2 text-neutral-400">
              <FileText className="h-10 w-10" />
              <span className="text-xs">Preview tidak tersedia untuk PDF</span>
            </div>
          </div>
        )}

        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-btn border-2 border-primary-600 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50"
        >
          <ExternalLink className="h-4 w-4" />
          Buka di Tab Baru
        </a>
      </div>
    )}
  </Modal>
);

const ConfirmModal = ({
  keputusan,
  onConfirm,
  onCancel,
  isLoading,
}: {
  keputusan: "setujui" | "tolak" | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const isTolak = keputusan === "tolak";
  return (
    <Modal
      isOpen={!!keputusan}
      onClose={onCancel}
      title={isTolak ? "Konfirmasi Penolakan" : "Konfirmasi Persetujuan"}
    >
      <div className="space-y-4">
        <div
          className={`flex items-start gap-3 rounded-lg p-3 ${
            isTolak ? "bg-red-50" : "bg-primary-50"
          }`}
        >
          {isTolak ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
          ) : (
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
          )}
          <p className="text-sm text-neutral-700">
            {isTolak
              ? "Berkas peserta akan ditolak dan peserta akan mendapat notifikasi beserta alasan penolakan."
              : "Berkas peserta akan disetujui. Peserta akan mendapat notifikasi dan dapat melanjutkan proses pendaftaran."}
          </p>
        </div>
        <p className="text-xs text-neutral-400">
          Tindakan ini tidak dapat dibatalkan setelah dikonfirmasi.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-btn border-2 border-neutral-300 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={[
              "flex flex-1 items-center justify-center gap-2 rounded-btn py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50",
              isTolak
                ? "bg-danger hover:bg-red-800"
                : "bg-primary-600 hover:bg-primary-700",
            ].join(" ")}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isTolak ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isLoading ? "Memproses…" : isTolak ? "Ya, Tolak" : "Ya, Setujui"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default function VerifikasiDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [catatan,       setCatatan]       = useState("");
  const [previewDoc,    setPreviewDoc]    = useState<DokumenItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<"setujui" | "tolak" | null>(null);

  
  const { data: pendaftar, isLoading, isError } = useQuery<PendaftarDetail>({
    queryKey: ["admin", "verifikasi", id],
    queryFn: async () => {
      const { data } = await api.get<PendaftarDetail>(`/api/admin/verifikasi/${id}`);
      return data;
    },
    retry: false,
  });

  const totalDok   = 5;
  const uploadedDok = pendaftar?.dokumen.length ?? 0;
  const allComplete = uploadedDok >= totalDok;

  const jalurNama = resolveStr(pendaftar?.jalur);
  const prodiNama = resolveStr(pendaftar?.programStudi);

  
  const { mutate: submitKeputusan, isPending } = useMutation({
    mutationFn: async (payload: VerifikasiPayload) => {
      await api.put(`/api/admin/verifikasi/${id}`, payload);
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.keputusan === "setujui"
          ? "Berkas berhasil diverifikasi! Notifikasi dikirim ke pendaftar."
          : "Berkas ditolak. Notifikasi dikirim ke pendaftar.",
        { duration: 4000 }
      );
      router.push("/admin/peserta");
    },
    onError: () => {
      toast.error("Gagal memproses keputusan. Coba lagi.");
      setConfirmAction(null);
    },
  });

  const handleConfirm = useCallback(() => {
    if (!confirmAction) return;
    submitKeputusan({ keputusan: confirmAction, catatan });
  }, [confirmAction, catatan, submitKeputusan]);

  

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-lg font-semibold text-neutral-700">Data tidak ditemukan</p>
        <p className="text-sm text-neutral-400">
          Pendaftaran dengan ID tersebut tidak ada atau sudah dihapus.
        </p>
        <Link
          href="/admin/peserta"
          className="mt-2 rounded-btn bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          Kembali ke Daftar Peserta
        </Link>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: "inherit", fontSize: "0.875rem" },
          success: { iconTheme: { primary: "#2E7D32", secondary: "#fff" } },
        }}
      />

      <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      <ConfirmModal
        keputusan={confirmAction}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        isLoading={isPending}
      />

      <div className="space-y-5">
        {}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/peserta"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-card transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
            aria-label="Kembali ke Daftar Peserta"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">
              Verifikasi Berkas
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              {isLoading ? "Memuat…" : pendaftar?.nomorPendaftaran}
            </p>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-[76px] space-y-4">

              {}
              <SectionCard>
                <div className="p-5 space-y-4">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ) : pendaftar ? (
                    <>
                      {}
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white ${avatarColor(pendaftar.namaLengkap)}`}
                          aria-label={`Avatar ${pendaftar.namaLengkap}`}
                        >
                          {generateInitials(pendaftar.namaLengkap)}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">
                            {pendaftar.namaLengkap}
                          </p>
                          <p className="font-mono text-xs text-neutral-400">
                            {pendaftar.nomorPendaftaran}
                          </p>
                        </div>
                        {}
                        <div className="flex flex-wrap justify-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              JALUR_BADGE[jalurNama] ?? "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {jalurNama}
                          </span>
                          <Badge
                            status={pendaftar.status}
                            label={STATUS_LABEL[pendaftar.status]}
                          />
                        </div>
                      </div>

                      {}
                      <div className="border-t border-neutral-100" />

                      {}
                      <dl className="space-y-2.5 text-sm">
                        {[
                          { label: "Program Studi", value: prodiNama },
                          { label: "Asal Sekolah",  value: pendaftar.asalSekolah },
                          { label: "Email",          value: pendaftar.email },
                        ].map((row) => (
                          <div key={row.label} className="flex flex-col gap-0.5">
                            <dt className="text-xs font-medium text-neutral-400">
                              {row.label}
                            </dt>
                            <dd className="break-all text-neutral-800">
                              {row.value}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      {}
                      <div className="border-t border-neutral-100" />

                      {}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-neutral-600">
                            Dokumen Diunggah
                          </span>
                          <span
                            className={`font-bold ${
                              allComplete ? "text-primary-600" : "text-amber-600"
                            }`}
                          >
                            {uploadedDok}/{totalDok}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              allComplete ? "bg-primary-600" : "bg-amber-500"
                            }`}
                            style={{ width: `${(uploadedDok / totalDok) * 100}%` }}
                            role="progressbar"
                            aria-valuenow={uploadedDok}
                            aria-valuemax={totalDok}
                          />
                        </div>
                        {allComplete ? (
                          <div className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-600" />
                            <p className="text-xs font-medium text-primary-700">
                              Semua dokumen lengkap
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2">
                            <Info className="h-4 w-4 shrink-0 text-amber-600" />
                            <p className="text-xs font-medium text-amber-700">
                              {totalDok - uploadedDok} dokumen belum diunggah
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </SectionCard>
            </div>
          </div>

          {}
          <div className="space-y-5 lg:col-span-2">

            {}
            <SectionCard>
              <CardHeader
                icon={<FileText className="h-4 w-4 text-primary-600" />}
                title="Daftar Berkas Unggahan"
              />

              <ul role="list" className="divide-y divide-neutral-100">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <li key={i} className="flex items-center gap-4 px-5 py-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-16 rounded-btn" />
                      </li>
                    ))
                  : (pendaftar?.dokumen ?? []).map((doc, idx) => (
                      <li
                        key={doc.id}
                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
                      >
                        {}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                          <FileIcon format={doc.format} />
                        </div>

                        {}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-neutral-800">
                            {doc.jenis}
                          </p>
                          <p className="truncate text-xs text-neutral-400">
                            {doc.namaFile}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                            <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono font-medium">
                              {doc.format}
                            </span>
                            <span>{formatFileSize(doc.ukuran)}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {relativeTime(doc.uploadedAt)}
                            </span>
                          </div>
                        </div>

                        {}
                        <button
                          type="button"
                          id={`btn-lihat-dok-${idx}`}
                          onClick={() => setPreviewDoc(doc)}
                          className="flex shrink-0 items-center gap-1.5 rounded-btn border-2 border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Lihat
                        </button>
                      </li>
                    ))}
              </ul>

              {}
              {!isLoading && (pendaftar?.dokumen.length ?? 0) === 0 && (
                <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-neutral-400">
                  <FileText className="h-8 w-8" />
                  <p>Belum ada berkas yang diunggah</p>
                </div>
              )}
            </SectionCard>

            {}
            <SectionCard>
              <CardHeader
                icon={<ShieldCheck className="h-4 w-4 text-primary-600" />}
                title="Keputusan Verifikasi"
              />

              <div className="p-5 space-y-4">
                {}
                <div>
                  <label
                    htmlFor="catatan-verifikasi"
                    className="mb-1.5 block text-sm font-medium text-neutral-700"
                  >
                    Catatan / Alasan{" "}
                    <span className="font-normal text-neutral-400">(Opsional)</span>
                  </label>
                  <textarea
                    id="catatan-verifikasi"
                    rows={4}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Tuliskan catatan verifikasi atau alasan penolakan di sini. Catatan ini akan dikirimkan kepada pendaftar beserta keputusan verifikasi."
                    className="w-full resize-none rounded-btn border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                {}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {}
                  <button
                    type="button"
                    id="btn-tolak-berkas"
                    disabled={isPending || isLoading}
                    onClick={() => setConfirmAction("tolak")}
                    className="flex items-center justify-center gap-2 rounded-btn border-2 border-danger py-3 text-sm font-semibold text-danger transition-colors hover:bg-danger hover:text-white disabled:pointer-events-none disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Tolak Berkas
                  </button>

                  {}
                  <button
                    type="button"
                    id="btn-setujui-berkas"
                    disabled={isPending || isLoading || !allComplete}
                    onClick={() => setConfirmAction("setujui")}
                    className="flex items-center justify-center gap-2 rounded-btn bg-primary-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-50"
                    title={
                      !allComplete
                        ? "Lengkapi semua dokumen sebelum menyetujui"
                        : undefined
                    }
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Setujui &amp; Verifikasi
                  </button>
                </div>

                {}
                {!allComplete && (
                  <p className="flex items-center gap-1.5 text-xs text-amber-600">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    Tombol &ldquo;Setujui &amp; Verifikasi&rdquo; aktif setelah semua{" "}
                    {totalDok} dokumen diunggah.
                  </p>
                )}

                {}
                <div className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                  <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <p className="text-[11px] leading-relaxed text-neutral-500">
                    Tindakan ini akan mengirimkan notifikasi ke alamat email pendaftar
                    beserta keputusan dan catatan verifikasi yang Anda tuliskan.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}
