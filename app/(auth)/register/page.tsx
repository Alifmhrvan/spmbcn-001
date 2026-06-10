"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import type { JalurPendaftaran, ProgramStudi } from "@/types";
import axios from "axios";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { z } from "zod";

const STEPS = [1, 2, 3] as const;

const step1Schema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  nik: z
    .string()
    .min(1, "NIK wajib diisi")
    .length(16, "NIK harus 16 digit")
    .regex(/^\d+$/, "NIK hanya boleh angka"),
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenisKelamin: z.enum(["L", "P"], {
    message: "Jenis kelamin wajib dipilih",
  }),
  asalSekolah: z.string().min(1, "Asal sekolah wajib diisi"),
  noHp: z
    .string()
    .min(1, "No. HP wajib diisi")
    .min(10, "No. HP minimal 10 digit")
    .regex(/^[\d+\-\s()]+$/, "Format no. HP tidak valid"),
});

const step2Schema = z.object({
  jalurPendaftaranId: z.string().min(1, "Jalur pendaftaran wajib dipilih"),
  programStudiId: z.string().min(1, "Program studi wajib dipilih"),
});

const step3Schema = z
  .object({
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    password: z
      .string()
      .min(1, "Password wajib diisi")
      .min(6, "Password minimal 6 karakter"),
    konfirmasiPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    setujuSyarat: z.literal(true, {
      message: "Anda harus menyetujui syarat & ketentuan",
    }),
  })
  .refine((data) => data.password === data.konfirmasiPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["konfirmasiPassword"],
  });

interface RegisterFormData {
  namaLengkap: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P" | "";
  asalSekolah: string;
  noHp: string;
  jalurPendaftaranId: string;
  programStudiId: string;
  email: string;
  password: string;
  konfirmasiPassword: string;
  setujuSyarat: boolean;
}

const initialFormData: RegisterFormData = {
  namaLengkap: "",
  nik: "",
  tempatLahir: "",
  tanggalLahir: "",
  jenisKelamin: "",
  asalSekolah: "",
  noHp: "",
  jalurPendaftaranId: "",
  programStudiId: "",
  email: "",
  password: "",
  konfirmasiPassword: "",
  setujuSyarat: false,
};

const formatZodErrors = (error: z.ZodError): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const key = issue.path[0]?.toString();
    if (key && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  });

  return fieldErrors;
};

interface StepperProps {
  currentStep: number;
}

const Stepper = ({ currentStep }: StepperProps) => {
  return (
    <div className="mb-8 flex items-center justify-center">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step;
        const isCompleted = currentStep > step;

        return (
          <div key={step} className="flex items-center">
            <div
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                isActive || isCompleted
                  ? "bg-primary-600 text-white"
                  : "border-2 border-neutral-300 bg-white text-neutral-400",
              ].join(" ")}
            >
              {step}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={[
                  "mx-2 h-0.5 w-12 sm:w-20 transition-colors",
                  isCompleted ? "bg-primary-600" : "bg-neutral-300",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const selectClassName = (hasError: boolean) =>
  [
    "w-full rounded-btn border bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900",
    "transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600",
    hasError ? "border-danger focus:ring-danger" : "border-neutral-300",
  ].join(" ");

const RegisterPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [jalurList, setJalurList] = useState<JalurPendaftaran[]>([]);
  const [prodiList, setProdiList] = useState<ProgramStudi[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);

      try {
        const [jalurRes, prodiRes] = await Promise.all([
          api.get<JalurPendaftaran[]>("/api/jalur-pendaftaran"),
          api.get<ProgramStudi[]>("/api/program-studi"),
        ]);

        setJalurList(jalurRes.data);
        setProdiList(prodiRes.data);
      } catch {
        toast.error("Gagal memuat data jalur dan program studi.");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const updateField = <K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    let result: z.ZodSafeParseResult<unknown>;

    if (step === 1) {
      result = step1Schema.safeParse({
        namaLengkap: formData.namaLengkap,
        nik: formData.nik,
        tempatLahir: formData.tempatLahir,
        tanggalLahir: formData.tanggalLahir,
        jenisKelamin: formData.jenisKelamin || undefined,
        asalSekolah: formData.asalSekolah,
        noHp: formData.noHp,
      });
    } else if (step === 2) {
      result = step2Schema.safeParse({
        jalurPendaftaranId: formData.jalurPendaftaranId,
        programStudiId: formData.programStudiId,
      });
    } else {
      result = step3Schema.safeParse({
        email: formData.email,
        password: formData.password,
        konfirmasiPassword: formData.konfirmasiPassword,
        setujuSyarat: formData.setujuSyarat,
      });
    }

    if (!result.success) {
      setErrors(formatZodErrors(result.error));
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
  if (!validateStep(3)) return;

  setIsSubmitting(true);

  try {
    await api.post("/api/auth/register", {
      nama: formData.namaLengkap,
      nik: formData.nik,
      tempatLahir: formData.tempatLahir,
      tanggalLahir: formData.tanggalLahir,
      jenisKelamin: formData.jenisKelamin,
      asalSekolah: formData.asalSekolah,
      noHp: formData.noHp,
      jalurPendaftaranId: formData.jalurPendaftaranId,
      programStudiId: formData.programStudiId,
      email: formData.email,
      password: formData.password,
    });

    toast.success("Pendaftaran berhasil! Silakan masuk ke akun Anda.");
    router.push("/login");
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? (error.response?.data as { error?: string; message?: string } | undefined)?.error ??
        (error.response?.data as { error?: string; message?: string } | undefined)?.message ??
        "Pendaftaran gagal. Silakan coba lagi."
      : "Terjadi kesalahan. Silakan coba lagi.";

    toast.error(message);
  } finally {
    setIsSubmitting(false);
  }
};

  const stepTitles = ["Data Diri", "Pilih Program", "Akun"];

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-neutral-50 px-4 py-12">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
            <GraduationCap className="h-7 w-7 text-primary-600" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-neutral-700">
            SPMB Citra Negara
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="mb-2 text-center">
            <h1 className="text-2xl font-bold text-primary-600">Daftar Akun</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Lengkapi formulir pendaftaran dalam {STEPS.length} langkah.
            </p>
          </div>

          <Stepper currentStep={currentStep} />

          <p className="mb-6 text-center text-sm font-medium text-neutral-700">
            Langkah {currentStep}: {stepTitles[currentStep - 1]}
          </p>

          {currentStep === 1 && (
            <div className="space-y-4">
              <Input
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                value={formData.namaLengkap}
                onChange={(e) => updateField("namaLengkap", e.target.value)}
                error={errors.namaLengkap}
              />
              <Input
                label="NIK"
                placeholder="16 digit NIK"
                inputMode="numeric"
                maxLength={16}
                value={formData.nik}
                onChange={(e) => updateField("nik", e.target.value)}
                error={errors.nik}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Tempat Lahir"
                  placeholder="Kota kelahiran"
                  value={formData.tempatLahir}
                  onChange={(e) => updateField("tempatLahir", e.target.value)}
                  error={errors.tempatLahir}
                />
                <Input
                  label="Tanggal Lahir"
                  type="date"
                  value={formData.tanggalLahir}
                  onChange={(e) => updateField("tanggalLahir", e.target.value)}
                  error={errors.tanggalLahir}
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700">
                  Jenis Kelamin
                </p>
                <div className="flex gap-6">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value="L"
                      checked={formData.jenisKelamin === "L"}
                      onChange={() => updateField("jenisKelamin", "L")}
                      className="h-4 w-4 accent-primary-600"
                    />
                    Laki-laki
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value="P"
                      checked={formData.jenisKelamin === "P"}
                      onChange={() => updateField("jenisKelamin", "P")}
                      className="h-4 w-4 accent-primary-600"
                    />
                    Perempuan
                  </label>
                </div>
                {errors.jenisKelamin && (
                  <p className="mt-1.5 text-sm text-danger" role="alert">
                    {errors.jenisKelamin}
                  </p>
                )}
              </div>
              <Input
                label="Asal Sekolah"
                placeholder="Nama sekolah asal"
                value={formData.asalSekolah}
                onChange={(e) => updateField("asalSekolah", e.target.value)}
                error={errors.asalSekolah}
              />
              <Input
                label="No. HP"
                placeholder="08xxxxxxxxxx"
                type="tel"
                value={formData.noHp}
                onChange={(e) => updateField("noHp", e.target.value)}
                error={errors.noHp}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              {loadingOptions ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memuat data program...
                </div>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="jalur-pendaftaran"
                      className="mb-1.5 block text-sm font-medium text-neutral-700"
                    >
                      Jalur Pendaftaran
                    </label>
                    <select
                      id="jalur-pendaftaran"
                      value={formData.jalurPendaftaranId}
                      onChange={(e) =>
                        updateField("jalurPendaftaranId", e.target.value)
                      }
                      className={selectClassName(!!errors.jalurPendaftaranId)}
                    >
                      <option value="">Pilih jalur pendaftaran</option>
                      {jalurList.map((jalur) => (
                        <option key={jalur.id} value={jalur.id}>
                          {jalur.nama}
                        </option>
                      ))}
                    </select>
                    {errors.jalurPendaftaranId && (
                      <p className="mt-1.5 text-sm text-danger" role="alert">
                        {errors.jalurPendaftaranId}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="program-studi"
                      className="mb-1.5 block text-sm font-medium text-neutral-700"
                    >
                      Program Studi
                    </label>
                    <select
                      id="program-studi"
                      value={formData.programStudiId}
                      onChange={(e) =>
                        updateField("programStudiId", e.target.value)
                      }
                      className={selectClassName(!!errors.programStudiId)}
                    >
                      <option value="">Pilih program studi</option>
                      {prodiList.map((prodi) => (
                        <option key={prodi.id} value={prodi.id}>
                          {prodi.kode} — {prodi.nama}
                        </option>
                      ))}
                    </select>
                    {errors.programStudiId && (
                      <p className="mt-1.5 text-sm text-danger" role="alert">
                        {errors.programStudiId}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="nama@email.com"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                error={errors.email}
              />

              <div className="w-full">
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className={[
                      "w-full rounded-btn border bg-neutral-50 px-3 py-2.5 pr-10 text-sm text-neutral-900",
                      "placeholder:text-neutral-400 transition-colors",
                      "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600",
                      errors.password
                        ? "border-danger focus:ring-danger"
                        : "border-neutral-300",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-neutral-700"
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-danger" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label
                  htmlFor="konfirmasi-password"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    id="konfirmasi-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Ulangi password"
                    value={formData.konfirmasiPassword}
                    onChange={(e) =>
                      updateField("konfirmasiPassword", e.target.value)
                    }
                    className={[
                      "w-full rounded-btn border bg-neutral-50 px-3 py-2.5 pr-10 text-sm text-neutral-900",
                      "placeholder:text-neutral-400 transition-colors",
                      "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600",
                      errors.konfirmasiPassword
                        ? "border-danger focus:ring-danger"
                        : "border-neutral-300",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-neutral-700"
                    aria-label={
                      showConfirmPassword
                        ? "Sembunyikan konfirmasi password"
                        : "Tampilkan konfirmasi password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.konfirmasiPassword && (
                  <p className="mt-1.5 text-sm text-danger" role="alert">
                    {errors.konfirmasiPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.setujuSyarat}
                    onChange={(e) =>
                      updateField("setujuSyarat", e.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary-600"
                  />
                  <span className="text-sm text-neutral-600">
                    Saya menyetujui{" "}
                    <span className="font-medium text-primary-600">
                      syarat & ketentuan
                    </span>{" "}
                    pendaftaran SPMB Citra Negara.
                  </span>
                </label>
                {errors.setujuSyarat && (
                  <p className="mt-1.5 text-sm text-danger" role="alert">
                    {errors.setujuSyarat}
                  </p>
                )}
              </div>
            </div>
          )}

          <div
            className={[
              "mt-6 flex gap-3",
              currentStep === 1 ? "flex-col" : "flex-row",
            ].join(" ")}
          >
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Kembali
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type="button"
                variant="primary"
                size="lg"
                className={currentStep === 1 ? "w-full" : "flex-1"}
                onClick={handleNext}
                disabled={currentStep === 2 && loadingOptions}
              >
                Lanjut
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="flex-1"
                loading={isSubmitting}
                onClick={handleSubmit}
              >
                Daftar
              </Button>
            )}
          </div>

          <div className="mt-6 border-t border-neutral-200 pt-6 text-center">
            <p className="text-sm text-neutral-600">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="font-medium text-primary-600 transition-colors hover:text-primary-700"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
