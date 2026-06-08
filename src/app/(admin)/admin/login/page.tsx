"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import { ADMIN_TOKEN_KEY } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Cookies from "js-cookie";
import { Eye, EyeOff, GraduationCap, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { z } from "zod";

const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

interface AdminLoginResponse {
  token: string;
}

const AdminLoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    try {
      const response = await api.post<AdminLoginResponse>(
        "/api/auth/admin/login",
        {
          email: data.email,
          password: data.password,
        },
      );

      Cookies.set(ADMIN_TOKEN_KEY, response.data.token, { expires: 7 });
      router.push("/admin/dashboard");
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ??
          "Login gagal. Periksa kembali email dan password Anda."
        : "Terjadi kesalahan. Silakan coba lagi.";

      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      <div className="hidden w-[40%] flex-col items-center justify-center bg-primary-600 px-10 text-white md:flex">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Admin SPMB</h1>
        <p className="mt-3 max-w-xs text-center text-sm leading-relaxed text-primary-50">
          Pusat Kendali Sistem Pendaftaran
        </p>
      </div>

      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 sm:px-12 md:w-[60%] lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 md:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
              <GraduationCap className="h-7 w-7 text-primary-600" />
            </div>
            <p className="mt-3 text-sm font-semibold text-primary-600">
              Admin SPMB Citra Negara
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">
              Masuk sebagai Administrator
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Gunakan akun admin untuk mengelola sistem pendaftaran.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <Input
              label="Email"
              type="email"
              placeholder="admin@smkcitranegara.sch.id"
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="w-full">
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  className={[
                    "w-full rounded-btn border bg-neutral-50 py-2.5 pl-10 pr-10 text-sm text-neutral-900",
                    "placeholder:text-neutral-400 transition-colors",
                    "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600",
                    errors.password
                      ? "border-danger focus:ring-danger"
                      : "border-neutral-300",
                  ].join(" ")}
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={
                    errors.password ? "admin-password-error" : undefined
                  }
                  {...register("password")}
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
                <p
                  id="admin-password-error"
                  className="mt-1.5 text-sm text-danger"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
            >
              Masuk
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
