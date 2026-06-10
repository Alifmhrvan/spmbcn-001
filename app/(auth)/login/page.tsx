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
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(6, "Minimal 6 karakter"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  token: string;
  role: string;
}

const ROLE_REDIRECT: Record<string, string> = {
  admin: "/admin/dashboard",
  superadmin: "/admin/dashboard",
  peserta: "/beranda",
};

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
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post<LoginResponse>("/api/auth/login", {
        email: data.email,
        password: data.password,
      });

      const { token, role } = response.data;
      Cookies.set(AUTH_TOKEN_KEY, token, { expires: 7 });

      const redirectTo = ROLE_REDIRECT[role] ?? "/beranda";
      router.push(redirectTo);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { error?: string } | undefined)?.error ??
          "Login gagal. Periksa kembali email dan password Anda."
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
              Masuk sebagai peserta atau administrator.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="Masukkan email"
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
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
