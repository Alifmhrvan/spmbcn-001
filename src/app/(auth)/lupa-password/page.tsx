"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import api from "@/lib/api";

type Step = "form" | "sent";

const LupaPasswordPage = () => {
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("/api/auth/forgot-password", { email });
      setStep("sent");
    } catch {
      setError("Gagal mengirim email. Pastikan email terdaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-card border border-neutral-200 bg-white p-8 shadow-card">
          {step === "form" ? (
            <>
              <Link
                href="/login"
                className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Login
              </Link>

              <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-900">
                  Lupa Password
                </h1>
                <p className="mt-1.5 text-sm text-neutral-500">
                  Masukkan email yang terdaftar. Kami akan mengirim link untuk
                  reset password kamu.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  icon={<Mail className="h-4 w-4" />}
                  error={error}
                />

                <Button
                  fullWidth
                  loading={loading}
                  onClick={handleSubmit}
                >
                  Kirim Link Reset
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                <CheckCircle2 className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                Email Terkirim!
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Link reset password sudah dikirim ke{" "}
                <span className="font-medium text-neutral-800">{email}</span>.
                Cek inbox atau folder spam kamu.
              </p>
              <p className="mt-4 text-xs text-neutral-400">
                Tidak menerima email?{" "}
                <button
                  type="button"
                  className="text-primary-600 underline underline-offset-2"
                  onClick={() => setStep("form")}
                >
                  Kirim ulang
                </button>
              </p>
              <div className="mt-6 w-full">
                <Link href="/login">
                  <Button variant="outline" fullWidth>
                    Kembali ke Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LupaPasswordPage;
