"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatFileSize } from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Trash2,
  UploadCloud,
  User,
  BookOpen,
  Send,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type JenisKelamin = "L" | "P" | "";

interface DataPribadi {
  nama: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: JenisKelamin;
  asalSekolah: string;
  noHp: string;
  alamat: string;
}

interface PilihanProgram {
  jalur: string;
  programStudi: string;
}

interface UploadedFile {
  file: File;
  name: string;
  size: number;
}

type DokumenKey =
  | "ktp"
  | "ijazah"
  | "transkrip"
  | "pasFoto"
  | "buktiPembayaran";

type DokumenMap = Partial<Record<DokumenKey, UploadedFile>>;

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Data Pribadi", icon: User },
  { id: 2, label: "Program", icon: BookOpen },
  { id: 3, label: "Dokumen", icon: FileText },
  { id: 4, label: "Review", icon: Send },
];

const JALUR_OPTIONS = [
  {
    id: "reguler",
    nama: "Jalur Reguler",
    deskripsi: "Seleksi berdasarkan nilai rapor dan ujian tertulis",
    icon: "📋",
  },
  {
    id: "prestasi",
    nama: "Jalur Prestasi",
    deskripsi: "Seleksi khusus pemilik prestasi akademik/non-akademik",
    icon: "🏆",
  },
  {
    id: "beasiswa",
    nama: "Jalur Beasiswa",
    deskripsi: "Untuk peserta yang memerlukan bantuan biaya pendidikan",
    icon: "🎓",
  },
];

const PRODI_OPTIONS = [
  { id: "ti", nama: "Teknik Informatika" },
  { id: "si", nama: "Sistem Informasi" },
  { id: "ak", nama: "Akuntansi" },
  { id: "mn", nama: "Manajemen" },
  { id: "hk", nama: "Hukum" },
  { id: "pendi", nama: "Pendidikan Bahasa Inggris" },
];

const DOKUMEN_LIST: { key: DokumenKey; label: string; accept: string }[] = [
  { key: "ktp", label: "KTP / Kartu Pelajar", accept: "image/*,.pdf" },
  { key: "ijazah", label: "Ijazah / SKL", accept: "image/*,.pdf" },
  { key: "transkrip", label: "Transkrip Nilai", accept: "image/*,.pdf" },
  { key: "pasFoto", label: "Pas Foto 3×4", accept: "image/*" },
  {
    key: "buktiPembayaran",
    label: "Bukti Pembayaran",
    accept: "image/*,.pdf",
  },
];

// ─── DropZone Component ───────────────────────────────────────────────────────

interface DropZoneProps {
  dokumenKey: DokumenKey;
  label: string;
  accept: string;
  uploaded?: UploadedFile;
  onUpload: (key: DokumenKey, file: File) => void;
  onRemove: (key: DokumenKey) => void;
}

const DropZone = ({
  dokumenKey,
  label,
  accept,
  uploaded,
  onUpload,
  onRemove,
}: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onUpload(dokumenKey, file);
    },
    [dokumenKey, onUpload],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(dokumenKey, file);
  };

  if (uploaded) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100">
            <FileText className="h-4 w-4 text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-neutral-800">
              {uploaded.name}
            </p>
            <p className="text-xs text-neutral-500">
              {formatFileSize(uploaded.size)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(dokumenKey)}
          aria-label={`Hapus ${label}`}
          className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Upload ${label}`}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={[
        "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors",
        isDragging
          ? "border-primary-500 bg-primary-50"
          : "border-neutral-300 bg-neutral-50 hover:border-primary-400 hover:bg-primary-50/50",
      ].join(" ")}
    >
      <UploadCloud
        className={[
          "h-7 w-7",
          isDragging ? "text-primary-600" : "text-neutral-400",
        ].join(" ")}
      />
      <div>
        <p className="text-sm font-medium text-neutral-700">
          Seret file ke sini atau{" "}
          <span className="text-primary-600">klik untuk memilih</span>
        </p>
        <p className="mt-0.5 text-xs text-neutral-400">
          PDF, JPG, PNG — Maks. 5 MB
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        aria-hidden="true"
      />
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const FormulirPage = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [dataPribadi, setDataPribadi] = useState<DataPribadi>({
    nama: "",
    nik: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    asalSekolah: "",
    noHp: "",
    alamat: "",
  });

  const [pilihanProgram, setPilihanProgram] = useState<PilihanProgram>({
    jalur: "",
    programStudi: "",
  });

  const [dokumen, setDokumen] = useState<DokumenMap>({});

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const handleUpload = useCallback((key: DokumenKey, file: File) => {
    setDokumen((prev) => ({
      ...prev,
      [key]: { file, name: file.name, size: file.size },
    }));
  }, []);

  const handleRemove = useCallback((key: DokumenKey) => {
    setDokumen((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const canProceed = () => {
    if (step === 1) {
      return (
        dataPribadi.nama.trim() !== "" &&
        dataPribadi.nik.trim() !== "" &&
        dataPribadi.tempatLahir.trim() !== "" &&
        dataPribadi.tanggalLahir !== "" &&
        dataPribadi.jenisKelamin !== "" &&
        dataPribadi.asalSekolah.trim() !== "" &&
        dataPribadi.noHp.trim() !== "" &&
        dataPribadi.alamat.trim() !== ""
      );
    }
    if (step === 2) {
      return pilihanProgram.jalur !== "" && pilihanProgram.programStudi !== "";
    }
    if (step === 3) {
      return DOKUMEN_LIST.every((d) => dokumen[d.key]);
    }
    return true;
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
          <Check className="h-10 w-10 text-primary-600" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            Pendaftaran Berhasil!
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Formulir Anda telah dikirim. Tim kami akan memverifikasi dokumen
            dalam 1–3 hari kerja.
          </p>
        </div>
        <div className="w-full rounded-card border border-primary-200 bg-primary-50 px-4 py-3 text-left">
          <p className="text-xs text-neutral-500">Nomor Pendaftaran</p>
          <p className="mt-0.5 font-mono text-lg font-bold text-primary-700">
            SPMB-2025-
            {Math.floor(10000 + Math.random() * 90000)}
          </p>
        </div>
        <p className="text-xs text-neutral-400">
          Pantau status pendaftaran di halaman Dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 py-4">
      {/* ── Header ── */}
      <div>
        <h1 className="text-lg font-bold text-neutral-900">
          Form Pendaftaran
        </h1>
        <p className="text-sm text-neutral-500">
          Lengkapi semua langkah untuk mendaftar
        </p>
      </div>

      {/* ── Stepper ── */}
      <div className="space-y-3">
        {/* Progress bar */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-between">
          {STEPS.map((s) => {
            const isCompleted = step > s.id;
            const isActive = step === s.id;
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="flex flex-col items-center gap-1"
                aria-current={isActive ? "step" : undefined}
              >
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isCompleted
                      ? "border-primary-600 bg-primary-600"
                      : isActive
                        ? "border-primary-600 bg-white"
                        : "border-neutral-300 bg-white",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <Check
                      className="h-4 w-4 text-white"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <Icon
                      className={[
                        "h-4 w-4",
                        isActive ? "text-primary-600" : "text-neutral-400",
                      ].join(" ")}
                    />
                  )}
                </div>
                <span
                  className={[
                    "text-[10px] font-medium leading-tight",
                    isActive ? "text-primary-700" : "text-neutral-400",
                  ].join(" ")}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="rounded-card border border-neutral-200 bg-white p-4 shadow-card">
        {/* Step 1 — Data Pribadi */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-neutral-900">
              Data Pribadi
            </h2>
            <Input
              id="nama-lengkap"
              label="Nama Lengkap"
              placeholder="Sesuai dokumen resmi"
              value={dataPribadi.nama}
              onChange={(e) =>
                setDataPribadi((p) => ({ ...p, nama: e.target.value }))
              }
            />
            <Input
              id="nik"
              label="NIK"
              placeholder="16 digit NIK"
              maxLength={16}
              inputMode="numeric"
              value={dataPribadi.nik}
              onChange={(e) =>
                setDataPribadi((p) => ({ ...p, nik: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="tempat-lahir"
                label="Tempat Lahir"
                placeholder="Kota"
                value={dataPribadi.tempatLahir}
                onChange={(e) =>
                  setDataPribadi((p) => ({
                    ...p,
                    tempatLahir: e.target.value,
                  }))
                }
              />
              <Input
                id="tanggal-lahir"
                label="Tanggal Lahir"
                type="date"
                value={dataPribadi.tanggalLahir}
                onChange={(e) =>
                  setDataPribadi((p) => ({
                    ...p,
                    tanggalLahir: e.target.value,
                  }))
                }
              />
            </div>
            {/* Jenis Kelamin */}
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Jenis Kelamin
              </label>
              <div className="flex gap-3">
                {[
                  { value: "L", label: "Laki-laki" },
                  { value: "P", label: "Perempuan" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setDataPribadi((p) => ({
                        ...p,
                        jenisKelamin: opt.value as JenisKelamin,
                      }))
                    }
                    className={[
                      "flex-1 rounded-btn border-2 py-2.5 text-sm font-medium transition-colors",
                      dataPribadi.jenisKelamin === opt.value
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-neutral-300 bg-white text-neutral-600 hover:border-primary-400",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <Input
              id="asal-sekolah"
              label="Asal Sekolah"
              placeholder="Nama sekolah asal"
              value={dataPribadi.asalSekolah}
              onChange={(e) =>
                setDataPribadi((p) => ({
                  ...p,
                  asalSekolah: e.target.value,
                }))
              }
            />
            <Input
              id="no-hp"
              label="No. HP / WhatsApp"
              placeholder="08xxxxxxxxxx"
              type="tel"
              inputMode="tel"
              value={dataPribadi.noHp}
              onChange={(e) =>
                setDataPribadi((p) => ({ ...p, noHp: e.target.value }))
              }
            />
            <div className="w-full">
              <label
                htmlFor="alamat"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Alamat Lengkap
              </label>
              <textarea
                id="alamat"
                rows={3}
                placeholder="Jl. ..."
                value={dataPribadi.alamat}
                onChange={(e) =>
                  setDataPribadi((p) => ({ ...p, alamat: e.target.value }))
                }
                className="w-full resize-none rounded-btn border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>
        )}

        {/* Step 2 — Pilihan Program */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-neutral-900">
              Pilihan Program
            </h2>

            {/* Jalur Pendaftaran */}
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700">
                Jalur Pendaftaran
              </p>
              <div className="space-y-2">
                {JALUR_OPTIONS.map((jalur) => {
                  const isSelected = pilihanProgram.jalur === jalur.id;
                  return (
                    <button
                      key={jalur.id}
                      type="button"
                      onClick={() =>
                        setPilihanProgram((p) => ({ ...p, jalur: jalur.id }))
                      }
                      className={[
                        "w-full rounded-card border-2 p-3 text-left transition-all duration-200",
                        isSelected
                          ? "border-primary-600 bg-primary-50"
                          : "border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50/40",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 text-xl"
                          role="img"
                          aria-hidden="true"
                        >
                          {jalur.icon}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={[
                                "text-sm font-semibold",
                                isSelected
                                  ? "text-primary-700"
                                  : "text-neutral-800",
                              ].join(" ")}
                            >
                              {jalur.nama}
                            </span>
                            <div
                              className={[
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                                isSelected
                                  ? "border-primary-600 bg-primary-600"
                                  : "border-neutral-300",
                              ].join(" ")}
                            >
                              {isSelected && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {jalur.deskripsi}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Program Studi */}
            <div className="w-full">
              <label
                htmlFor="program-studi"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Program Studi
              </label>
              <select
                id="program-studi"
                value={pilihanProgram.programStudi}
                onChange={(e) =>
                  setPilihanProgram((p) => ({
                    ...p,
                    programStudi: e.target.value,
                  }))
                }
                className="w-full rounded-btn border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600 appearance-none"
              >
                <option value="">-- Pilih Program Studi --</option>
                {PRODI_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 3 — Upload Dokumen */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">
                Upload Dokumen
              </h2>
              <p className="text-xs text-neutral-500">
                Semua dokumen wajib diunggah sebelum melanjutkan
              </p>
            </div>

            {/* Progress dokumen */}
            <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2">
              <div className="flex-1">
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-300">
                  <div
                    className="h-full rounded-full bg-primary-600 transition-all"
                    style={{
                      width: `${(Object.keys(dokumen).length / DOKUMEN_LIST.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-neutral-600">
                {Object.keys(dokumen).length}/{DOKUMEN_LIST.length} dokumen
              </span>
            </div>

            <div className="space-y-3">
              {DOKUMEN_LIST.map((d) => (
                <div key={d.key} className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-neutral-700">
                      {d.label}
                    </span>
                    <span className="text-danger text-xs">*</span>
                    {dokumen[d.key] && (
                      <Check className="ml-auto h-4 w-4 text-primary-600" />
                    )}
                  </div>
                  <DropZone
                    dokumenKey={d.key}
                    label={d.label}
                    accept={d.accept}
                    uploaded={dokumen[d.key]}
                    onUpload={handleUpload}
                    onRemove={handleRemove}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Review & Submit */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-neutral-900">
              Review &amp; Submit
            </h2>

            {/* Data Pribadi summary */}
            <section
              aria-labelledby="review-pribadi"
              className="rounded-lg border border-neutral-200 overflow-hidden"
            >
              <div className="flex items-center gap-2 bg-neutral-50 px-3 py-2 border-b border-neutral-200">
                <User className="h-4 w-4 text-primary-600" />
                <h3
                  id="review-pribadi"
                  className="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                >
                  Data Pribadi
                </h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {[
                  { label: "Nama Lengkap", value: dataPribadi.nama },
                  { label: "NIK", value: dataPribadi.nik },
                  {
                    label: "TTL",
                    value: `${dataPribadi.tempatLahir}, ${dataPribadi.tanggalLahir}`,
                  },
                  {
                    label: "Jenis Kelamin",
                    value:
                      dataPribadi.jenisKelamin === "L"
                        ? "Laki-laki"
                        : "Perempuan",
                  },
                  { label: "Asal Sekolah", value: dataPribadi.asalSekolah },
                  { label: "No. HP", value: dataPribadi.noHp },
                  { label: "Alamat", value: dataPribadi.alamat },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex gap-2 px-3 py-2 text-sm"
                  >
                    <span className="w-28 shrink-0 text-neutral-500">
                      {row.label}
                    </span>
                    <span className="font-medium text-neutral-800 break-all">
                      {row.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Program summary */}
            <section
              aria-labelledby="review-program"
              className="rounded-lg border border-neutral-200 overflow-hidden"
            >
              <div className="flex items-center gap-2 bg-neutral-50 px-3 py-2 border-b border-neutral-200">
                <BookOpen className="h-4 w-4 text-primary-600" />
                <h3
                  id="review-program"
                  className="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                >
                  Pilihan Program
                </h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {[
                  {
                    label: "Jalur",
                    value:
                      JALUR_OPTIONS.find(
                        (j) => j.id === pilihanProgram.jalur,
                      )?.nama || "—",
                  },
                  {
                    label: "Program Studi",
                    value:
                      PRODI_OPTIONS.find(
                        (p) => p.id === pilihanProgram.programStudi,
                      )?.nama || "—",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex gap-2 px-3 py-2 text-sm"
                  >
                    <span className="w-28 shrink-0 text-neutral-500">
                      {row.label}
                    </span>
                    <span className="font-medium text-neutral-800">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Dokumen summary */}
            <section
              aria-labelledby="review-dokumen"
              className="rounded-lg border border-neutral-200 overflow-hidden"
            >
              <div className="flex items-center gap-2 bg-neutral-50 px-3 py-2 border-b border-neutral-200">
                <FileText className="h-4 w-4 text-primary-600" />
                <h3
                  id="review-dokumen"
                  className="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                >
                  Dokumen
                </h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {DOKUMEN_LIST.map((d) => {
                  const file = dokumen[d.key];
                  return (
                    <div
                      key={d.key}
                      className="flex items-center justify-between px-3 py-2 text-sm"
                    >
                      <span className="text-neutral-600">{d.label}</span>
                      {file ? (
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-primary-600" />
                          <span className="max-w-[120px] truncate text-xs font-medium text-primary-700">
                            {file.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-danger">Belum ada</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
              <p className="text-xs text-amber-700">
                ⚠ Pastikan semua data sudah benar sebelum mengirim. Data tidak
                dapat diubah setelah formulir dikirimkan.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation Buttons ── */}
      <div className="flex gap-3">
        {step > 1 && (
          <Button
            variant="outline"
            icon={<ChevronLeft className="h-4 w-4" />}
            onClick={() => setStep((s) => s - 1)}
            className="flex-1"
          >
            Kembali
          </Button>
        )}
        {step < STEPS.length ? (
          <Button
            variant="primary"
            icon={<ChevronRight className="h-4 w-4" />}
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="flex-1"
          >
            Lanjut
          </Button>
        ) : (
          <Button
            variant="primary"
            icon={<Send className="h-4 w-4" />}
            onClick={handleSubmit}
            className="flex-1"
          >
            Kirim Pendaftaran
          </Button>
        )}
      </div>
    </div>
  );
};

export default FormulirPage;
