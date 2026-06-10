
"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import { formatFileSize } from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Trash2,
  UploadCloud,
  User,
  BookOpen,
  Send,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

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

interface JalurOption {
  id: string;
  nama: string;
  deskripsi?: string;
}

interface ProdiOption {
  id: string;
  kode: string;
  nama: string;
}

const STEPS = [
  { id: 1, label: "Data Pribadi", icon: User },
  { id: 2, label: "Program", icon: BookOpen },
  { id: 3, label: "Dokumen", icon: FileText },
  { id: 4, label: "Review", icon: Send },
];

const DOKUMEN_LIST: { key: DokumenKey; label: string; accept: string; jenis: string }[] = [
  { key: "ktp", label: "KTP / Kartu Pelajar", accept: "image/*,.pdf", jenis: "ktp" },
  { key: "ijazah", label: "Ijazah / SKL", accept: "image/*,.pdf", jenis: "ijazah" },
  { key: "transkrip", label: "Transkrip Nilai", accept: "image/*,.pdf", jenis: "transkrip" },
  { key: "pasFoto", label: "Pas Foto 3×4", accept: "image/*", jenis: "pas_foto" },
  { key: "buktiPembayaran", label: "Bukti Pembayaran", accept: "image/*,.pdf", jenis: "bukti_pembayaran" },
];

const UploadZone = ({
  label,
  accept,
  uploaded,
  onUpload,
  onRemove,
}: {
  label: string;
  accept: string;
  uploaded?: UploadedFile;
  onUpload: (key: DokumenKey, file: File) => void;
  onRemove: (key: DokumenKey) => void;
}) => {
  const key = DOKUMEN_LIST.find((d) => d.label === label)?.key ?? ("ktp" as DokumenKey);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(key, file);
  };

  if (uploaded) {
    return (
      <div className="flex items-center gap-3 rounded-btn border border-primary-200 bg-primary-50 p-3">
        <FileText className="h-5 w-5 shrink-0 text-primary-600" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-primary-800">
            {uploaded.name}
          </p>
          <p className="text-xs text-primary-500">{formatFileSize(uploaded.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(key)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-red-50 hover:text-danger"
          aria-label="Hapus file"
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
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      className="flex cursor-pointer flex-col items-center gap-2 rounded-btn border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 transition-colors hover:border-primary-400 hover:bg-primary-50"
    >
      <UploadCloud className="h-8 w-8 text-neutral-400" />
      <p className="text-sm font-medium text-neutral-600">
        Klik untuk unggah <span className="text-primary-600">{label}</span>
      </p>
      <p className="mt-0.5 text-xs text-neutral-400">
        PDF, JPG, PNG — Maks. 5 MB
      </p>
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

const FormulirPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nomorPendaftaran, setNomorPendaftaran] = useState<string | null>(null);

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

  
  const { data: jalurList = [] } = useQuery<JalurOption[]>({
    queryKey: ["jalur-pendaftaran"],
    queryFn: async () => {
      const { data } = await api.get<JalurOption[]>("/api/jalur-pendaftaran");
      return data;
    },
  });

  const { data: prodiList = [] } = useQuery<ProdiOption[]>({
    queryKey: ["program-studi"],
    queryFn: async () => {
      const { data } = await api.get<ProdiOption[]>("/api/program-studi");
      return data;
    },
  });

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      
      const { data: pendaftaranData } = await api.post<{
        id: string;
        nomorPendaftaran: string;
      }>("/api/user/pendaftaran", {
        namaLengkap: dataPribadi.nama,
        nisn: dataPribadi.nik,
        tempatLahir: dataPribadi.tempatLahir,
        tanggalLahir: dataPribadi.tanggalLahir,
        jenisKelamin: dataPribadi.jenisKelamin,
        asalSekolah: dataPribadi.asalSekolah,
        alamat: dataPribadi.alamat,
        noHp: dataPribadi.noHp,
        programStudiId: pilihanProgram.programStudi,
        jalurPendaftaranId: pilihanProgram.jalur,
      });

      const pendaftaranId = pendaftaranData.id;

      
      await Promise.all(
        DOKUMEN_LIST.map(async (d) => {
          const uploaded = dokumen[d.key];
          if (!uploaded) return;

          const formData = new FormData();
          formData.append("file", uploaded.file);
          formData.append("jenis", d.jenis);
          formData.append("pendaftaranId", pendaftaranId);

          await api.post("/api/user/dokumen", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        })
      );

      setNomorPendaftaran(pendaftaranData.nomorPendaftaran);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ?? "Terjadi kesalahan, coba lagi.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  
  if (nomorPendaftaran) {
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
            {nomorPendaftaran}
          </p>
        </div>
        <p className="text-xs text-neutral-400">
          Pantau status pendaftaran di halaman Dashboard
        </p>
        <Button
          variant="primary"
          onClick={() => router.push("/beranda")}
        >
          Ke Beranda
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 py-4">
      <Toaster position="top-right" />

      {}
      <div>
        <h1 className="text-lg font-bold text-neutral-900">
          Formulir Pendaftaran
        </h1>
        <p className="text-sm text-neutral-500">
          Isi semua data dengan lengkap dan benar
        </p>
      </div>

      {}
      <div className="space-y-2">
        <div className="flex justify-between">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div
                key={s.id}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    isDone
                      ? "bg-primary-600 text-white"
                      : isActive
                        ? "border-2 border-primary-600 bg-white text-primary-600"
                        : "border-2 border-neutral-200 bg-white text-neutral-400",
                  ].join(" ")}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={[
                    "hidden text-[10px] font-medium sm:block",
                    isActive
                      ? "text-primary-600"
                      : isDone
                        ? "text-primary-500"
                        : "text-neutral-400",
                  ].join(" ")}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {}
      <div className="rounded-card border border-neutral-200 bg-white p-5 shadow-card">

        {}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-neutral-900">
              Data Pribadi
            </h2>
            <Input
              label="Nama Lengkap"
              placeholder="Sesuai KTP / Kartu Pelajar"
              value={dataPribadi.nama}
              onChange={(e) =>
                setDataPribadi((p) => ({ ...p, nama: e.target.value }))
              }
            />
            <Input
              label="NIK / NISN"
              placeholder="16 digit NIK atau 10 digit NISN"
              value={dataPribadi.nik}
              onChange={(e) =>
                setDataPribadi((p) => ({ ...p, nik: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Tempat Lahir"
                placeholder="Kota lahir"
                value={dataPribadi.tempatLahir}
                onChange={(e) =>
                  setDataPribadi((p) => ({ ...p, tempatLahir: e.target.value }))
                }
              />
              <Input
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
            <div>
              <p className="mb-1.5 block text-sm font-medium text-neutral-700">
                Jenis Kelamin
              </p>
              <div className="flex gap-3">
                {(
                  [
                    { val: "L", label: "Laki-laki" },
                    { val: "P", label: "Perempuan" },
                  ] as const
                ).map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setDataPribadi((p) => ({ ...p, jenisKelamin: val }))
                    }
                    className={[
                      "flex-1 rounded-btn border-2 py-2.5 text-sm font-medium transition-colors",
                      dataPribadi.jenisKelamin === val
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-neutral-200 text-neutral-600 hover:border-neutral-300",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="Asal Sekolah"
              placeholder="Nama SMA/SMK/MA"
              value={dataPribadi.asalSekolah}
              onChange={(e) =>
                setDataPribadi((p) => ({ ...p, asalSekolah: e.target.value }))
              }
            />
            <Input
              label="No. HP / WhatsApp"
              placeholder="08xxxxxxxxxx"
              value={dataPribadi.noHp}
              onChange={(e) =>
                setDataPribadi((p) => ({ ...p, noHp: e.target.value }))
              }
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Alamat Lengkap
              </label>
              <textarea
                rows={3}
                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota"
                value={dataPribadi.alamat}
                onChange={(e) =>
                  setDataPribadi((p) => ({ ...p, alamat: e.target.value }))
                }
                className="w-full resize-none rounded-btn border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>
        )}

        {}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-neutral-900">
              Pilihan Program
            </h2>

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700">
                Jalur Pendaftaran
              </p>
              {jalurList.length === 0 ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
              ) : (
                <div className="space-y-2">
                  {jalurList.map((jalur) => (
                    <button
                      key={jalur.id}
                      type="button"
                      onClick={() =>
                        setPilihanProgram((p) => ({ ...p, jalur: jalur.id }))
                      }
                      className={[
                        "w-full rounded-btn border-2 px-4 py-3 text-left transition-colors",
                        pilihanProgram.jalur === jalur.id
                          ? "border-primary-600 bg-primary-50"
                          : "border-neutral-200 hover:border-neutral-300",
                      ].join(" ")}
                    >
                      <p className="font-medium text-neutral-900">{jalur.nama}</p>
                      {jalur.deskripsi && (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {jalur.deskripsi}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700">
                Program Studi
              </p>
              {prodiList.length === 0 ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {prodiList.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setPilihanProgram((prev) => ({
                          ...prev,
                          programStudi: p.id,
                        }))
                      }
                      className={[
                        "rounded-btn border-2 px-3 py-2.5 text-left text-sm transition-colors",
                        pilihanProgram.programStudi === p.id
                          ? "border-primary-600 bg-primary-50 font-semibold text-primary-700"
                          : "border-neutral-200 text-neutral-700 hover:border-neutral-300",
                      ].join(" ")}
                    >
                      {p.nama}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">
                Upload Dokumen
              </h2>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-primary-600 transition-all"
                  style={{
                    width: `${(Object.keys(dokumen).length / DOKUMEN_LIST.length) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {Object.keys(dokumen).length}/{DOKUMEN_LIST.length} dokumen
                terunggah
              </p>
            </div>
            {DOKUMEN_LIST.map((d) => (
              <div key={d.key}>
                <p className="mb-1.5 text-sm font-medium text-neutral-700">
                  {d.label}
                </p>
                <UploadZone
                  label={d.label}
                  accept={d.accept}
                  uploaded={dokumen[d.key]}
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                />
              </div>
            ))}
          </div>
        )}

        {}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-neutral-900">
              Review &amp; Submit
            </h2>

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
                  { label: "NIK / NISN", value: dataPribadi.nik },
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
                      jalurList.find((j) => j.id === pilihanProgram.jalur)
                        ?.nama || "—",
                  },
                  {
                    label: "Program Studi",
                    value:
                      prodiList.find(
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

      {}
      <div className="flex gap-3">
        {step > 1 && (
          <Button
            variant="outline"
            icon={<ChevronLeft className="h-4 w-4" />}
            onClick={() => setStep((s) => s - 1)}
            className="flex-1"
            disabled={isSubmitting}
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
            icon={
              isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )
            }
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Pendaftaran"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FormulirPage;
