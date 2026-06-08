"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import { AUTH_TOKEN_KEY } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Cookies from "js-cookie";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Nomor/Email wajib diisi")
    .min(3, "Minimal 3 karakter"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(6, "Minimal 6 karakter"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  token: string;
}

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post<LoginResponse>("/api/auth/login", {
        identifier: data.identifier,
        password: data.password,
      });

      Cookies.set(AUTH_TOKEN_KEY, response.data.token, { expires: 7 });
      router.push("/beranda");
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ??
          "Login gagal. Periksa kembali nomor/email dan password Anda."
        : "Terjadi kesalahan. Silakan coba lagi.";

      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-neutral-50 px-4 py-12">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
            <GraduationCap className="h-7 w-7 text-primary-600" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-neutral-700">
            SPMB Citra Negara
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-primary-600">
              Selamat Datang
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Silakan masuk menggunakan akun pendaftaran Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Nomor/Email"
              placeholder="Masukkan nomor atau email"
              autoComplete="username"
              icon={<User className="h-4 w-4" />}
              error={errors.identifier?.message}
              {...register("identifier")}
            />

            <div className="w-full">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-neutral-700"
                >
                  Password
                </label>
                <Link
                  href="/lupa-password"
                  className="text-sm text-primary-600 transition-colors hover:text-primary-700"
                >
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
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
                    errors.password ? "password-error" : undefined
                  }
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-neutral-700"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
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
                  id="password-error"
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
              Masuk Sekarang
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-6 border-t border-neutral-200" />

          <div className="space-y-3 text-center">
            <p className="text-sm text-neutral-600">Belum memiliki akun?</p>
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => router.push("/register")}
            >
              Daftar Akun Baru
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
