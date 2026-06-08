"use client";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import { AUTH_TOKEN_KEY } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import {
  Edit2,
  GraduationCap,
  Lock,
  LogOut,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";

interface ProfileForm {
  nama: string;
  noHp: string;
}

interface PasswordForm {
  passwordLama: string;
  passwordBaru: string;
  konfirmasi: string;
}

const ProfilPage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    nama: "",
    noHp: "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    passwordLama: "",
    passwordBaru: "",
    konfirmasi: "",
  });

  const [profileErrors, setProfileErrors] = useState<Partial<ProfileForm>>({});
  const [passwordErrors, setPasswordErrors] = useState<
    Partial<PasswordForm>
  >({});

  useEffect(() => {
    if (user) {
      setProfileForm({
        nama: user.nama ?? "",
        noHp: user.noHp ?? "",
      });
    }
  }, [user]);

  const validateProfile = (): boolean => {
    const errors: Partial<ProfileForm> = {};
    if (!profileForm.nama.trim()) errors.nama = "Nama wajib diisi";
    if (profileForm.noHp && !/^[\d+\-\s()]+$/.test(profileForm.noHp)) {
      errors.noHp = "Format no. HP tidak valid";
    }
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = (): boolean => {
    const errors: Partial<PasswordForm> = {};
    if (!passwordForm.passwordLama) errors.passwordLama = "Wajib diisi";
    if (!passwordForm.passwordBaru) errors.passwordBaru = "Wajib diisi";
    else if (passwordForm.passwordBaru.length < 6)
      errors.passwordBaru = "Minimal 6 karakter";
    if (passwordForm.konfirmasi !== passwordForm.passwordBaru)
      errors.konfirmasi = "Password tidak cocok";
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    setSavingProfile(true);
    try {
      await api.put("/api/user/profil", profileForm);
      toast.success("Profil berhasil diperbarui");
      setEditMode(false);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ??
          "Gagal memperbarui profil"
        : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!validatePassword()) return;
    setSavingPassword(true);
    try {
      await api.put("/api/user/password", {
        passwordLama: passwordForm.passwordLama,
        passwordBaru: passwordForm.passwordBaru,
      });
      toast.success("Password berhasil diubah");
      setPasswordForm({ passwordLama: "", passwordBaru: "", konfirmasi: "" });
      setShowPasswordSection(false);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ??
          "Gagal mengubah password"
        : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove(AUTH_TOKEN_KEY);
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-card bg-neutral-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 pt-4">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      {/* ── Avatar card ── */}
      <div className="rounded-card border border-neutral-200 bg-white p-5 shadow-card">
        <div className="flex items-center gap-4">
          <Avatar name={user?.nama ?? "Peserta"} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-neutral-900">
              {user?.nama ?? "—"}
            </p>
            <p className="truncate text-sm text-neutral-500">{user?.email}</p>
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5">
              <GraduationCap className="h-3 w-3 text-primary-600" />
              <span className="text-xs font-medium text-primary-700">
                Peserta SPMB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Data profil ── */}
      <div className="rounded-card border border-neutral-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary-600" />
            <h2 className="text-sm font-semibold text-neutral-800">
              Data Profil
            </h2>
          </div>
          {!editMode ? (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setProfileErrors({});
                if (user) {
                  setProfileForm({ nama: user.nama, noHp: user.noHp ?? "" });
                }
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-700"
            >
              <X className="h-3.5 w-3.5" />
              Batal
            </button>
          )}
        </div>

        <div className="space-y-4 p-5">
          {editMode ? (
            <>
              <Input
                label="Nama Lengkap"
                value={profileForm.nama}
                onChange={(e) => {
                  setProfileForm((prev) => ({ ...prev, nama: e.target.value }));
                  setProfileErrors((prev) => ({ ...prev, nama: undefined }));
                }}
                icon={<User className="h-4 w-4" />}
                error={profileErrors.nama}
              />
              <Input
                label="No. HP"
                value={profileForm.noHp}
                onChange={(e) => {
                  setProfileForm((prev) => ({
                    ...prev,
                    noHp: e.target.value,
                  }));
                  setProfileErrors((prev) => ({ ...prev, noHp: undefined }));
                }}
                icon={<Phone className="h-4 w-4" />}
                error={profileErrors.noHp}
                placeholder="08xxxxxxxxxx"
              />
              <Button
                fullWidth
                loading={savingProfile}
                icon={<Save className="h-4 w-4" />}
                onClick={handleSaveProfile}
              >
                Simpan Perubahan
              </Button>
            </>
          ) : (
            <dl className="space-y-3">
              {[
                { label: "Nama Lengkap", value: user?.nama },
                { label: "Email", value: user?.email },
                { label: "No. HP", value: user?.noHp ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3 text-sm">
                  <dt className="w-32 shrink-0 text-neutral-500">{label}</dt>
                  <dd className="font-medium text-neutral-800">
                    {value ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {/* ── Ganti password ── */}
      <div className="rounded-card border border-neutral-200 bg-white shadow-card">
        <button
          type="button"
          onClick={() => setShowPasswordSection((prev) => !prev)}
          className="flex w-full items-center justify-between border-b border-neutral-100 px-5 py-3.5"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-semibold text-neutral-800">
              Ganti Password
            </span>
          </div>
          <span className="text-xs text-neutral-400">
            {showPasswordSection ? "Tutup" : "Buka"}
          </span>
        </button>

        {showPasswordSection && (
          <div className="space-y-4 p-5">
            <Input
              label="Password Lama"
              type="password"
              value={passwordForm.passwordLama}
              onChange={(e) => {
                setPasswordForm((prev) => ({
                  ...prev,
                  passwordLama: e.target.value,
                }));
                setPasswordErrors((prev) => ({
                  ...prev,
                  passwordLama: undefined,
                }));
              }}
              icon={<Lock className="h-4 w-4" />}
              error={passwordErrors.passwordLama}
            />
            <Input
              label="Password Baru"
              type="password"
              value={passwordForm.passwordBaru}
              onChange={(e) => {
                setPasswordForm((prev) => ({
                  ...prev,
                  passwordBaru: e.target.value,
                }));
                setPasswordErrors((prev) => ({
                  ...prev,
                  passwordBaru: undefined,
                }));
              }}
              icon={<Lock className="h-4 w-4" />}
              error={passwordErrors.passwordBaru}
            />
            <Input
              label="Konfirmasi Password Baru"
              type="password"
              value={passwordForm.konfirmasi}
              onChange={(e) => {
                setPasswordForm((prev) => ({
                  ...prev,
                  konfirmasi: e.target.value,
                }));
                setPasswordErrors((prev) => ({
                  ...prev,
                  konfirmasi: undefined,
                }));
              }}
              icon={<Lock className="h-4 w-4" />}
              error={passwordErrors.konfirmasi}
            />
            <Button
              fullWidth
              loading={savingPassword}
              icon={<Save className="h-4 w-4" />}
              onClick={handleSavePassword}
            >
              Ubah Password
            </Button>
          </div>
        )}
      </div>

      {/* ── Logout ── */}
      <Button
        variant="danger"
        fullWidth
        icon={<LogOut className="h-4 w-4" />}
        onClick={handleLogout}
      >
        Keluar dari Akun
      </Button>
    </div>
  );
};

export default ProfilPage;
