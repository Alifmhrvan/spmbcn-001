"use client";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import StatusTimeline, {
  type TimelineStep,
} from "@/components/user/StatusTimeline";
import { useAuth } from "@/hooks/useAuth";
import { usePendaftaran } from "@/hooks/usePendaftaran";
import api from "@/lib/api";
import type { Pengumuman, Pendaftaran, StatusPendaftaran, User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ClipboardList,
  Download,
  Hash,
  Headphones,
  Loader2,
  Megaphone,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AccountBadge {
  label: string;
  status: string;
}

const getAccountBadge = (
  pendaftaran?: Pendaftaran | null,
): AccountBadge => {
  if (!pendaftaran) {
    return { label: "Akun Aktif", status: "diverifikasi" };
  }

  const statusMap: Record<StatusPendaftaran, AccountBadge> = {
    draft: { label: "Akun Aktif", status: "diverifikasi" },
    menunggu: { label: "Menunggu Verifikasi", status: "menunggu" },
    diverifikasi: { label: "Sedang Diverifikasi", status: "diverifikasi" },
    lulus: { label: "Lulus", status: "lulus" },
    ditolak: { label: "Ditolak", status: "ditolak" },
  };

  return statusMap[pendaftaran.status];
};

const buildTimelineSteps = (
  user: User | undefined,
  pendaftaran: Pendaftaran | null | undefined,
): TimelineStep[] => {
  const dokumenUploaded = (pendaftaran?.dokumen?.length ?? 0) > 0;
  const status = pendaftaran?.status;

  return [
    {
      label: "Akun Dibuat",
      completed: !!user,
      date: user?.createdAt,
    },
    {
      label: "Formulir Diisi",
      completed: !!pendaftaran && status !== "draft",
      date: pendaftaran?.createdAt,
    },
    {
      label: "Dokumen Diupload",
      completed: dokumenUploaded,
      date: dokumenUploaded
        ? pendaftaran?.dokumen[0]?.uploadedAt
        : undefined,
    },
    {
      label: "Diverifikasi",
      completed:
        status === "diverifikasi" ||
        status === "lulus" ||
        status === "ditolak",
      date:
        status === "diverifikasi" ||
        status === "lulus" ||
        status === "ditolak"
          ? pendaftaran?.updatedAt
          : undefined,
    },
    {
      label: "Hasil",
      completed: status === "lulus" || status === "ditolak",
      date:
        status === "lulus" || status === "ditolak"
          ? pendaftaran?.updatedAt
          : undefined,
    },
  ];
};

const BerandaPage = () => {
  const router = useRouter();
  const { user, isLoading: loadingUser } = useAuth();
  const { pendaftaran, isLoading: loadingPendaftaran } = usePendaftaran();

  const { data: pengumumanList, isLoading: loadingPengumuman } = useQuery({
    queryKey: ["pengumuman", "penting"],
    queryFn: async () => {
      const { data } = await api.get<Pengumuman[]>(
        "/api/pengumuman?penting=true",
      );
      return data;
    },
  });

  const isLoading = loadingUser || loadingPendaftaran;
  const accountBadge = getAccountBadge(pendaftaran);
  const timelineSteps = buildTimelineSteps(user, pendaftaran);
  const panduanUrl = `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/panduan-pendaftaran.pdf`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <Card className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar name={user?.nama ?? "Peserta"} size="lg" />
          <h1 className="mt-4 text-lg font-bold text-neutral-900">
            {pendaftaran?.namaLengkap ?? user?.nama ?? "Peserta"}
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
            <Hash className="h-3.5 w-3.5" />
            <span>
              ID Pendaftaran:{" "}
              {pendaftaran?.nomorPendaftaran ?? "Belum tersedia"}
            </span>
          </div>
          <div className="mt-3">
            <Badge
              status={accountBadge.status}
              label={accountBadge.label}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => router.push("/profil")}
          >
            Edit Profil
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary-600" />
          <h2 className="font-semibold text-neutral-900">Status Pendaftaran</h2>
        </div>
        <StatusTimeline steps={timelineSteps} />
      </Card>

      <Card className="overflow-hidden border-0 bg-primary-600 p-5 text-white shadow-card">
        <div className="flex items-start gap-3">
          <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-white" />
          <div className="flex-1">
            <h2 className="font-semibold">Bantuan Teknis</h2>
            <p className="mt-1 text-sm leading-relaxed text-primary-50">
              Butuh bantuan mengisi formulir atau mengunggah dokumen? Tim kami
              siap membantu Anda.
            </p>
            <a
              href="mailto:spmb@smkcitranegara.sch.id"
              className="mt-4 inline-flex h-8 items-center rounded-btn border-2 border-white px-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 bg-primary-600 px-5 py-3 text-white">
          <Bell className="h-5 w-5" />
          <h2 className="font-semibold">Pengumuman Penting</h2>
        </div>
        <div className="p-4">
          {loadingPengumuman ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : pengumumanList && pengumumanList.length > 0 ? (
            <ul className="space-y-3">
              {pengumumanList.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-btn border border-neutral-100 bg-neutral-50 p-3"
                >
                  <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {item.judul}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-neutral-600">
                      {item.konten}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-neutral-500">
              Belum ada pengumuman penting saat ini.
            </p>
          )}
        </div>
      </Card>

      <Button
        variant="outline"
        size="lg"
        fullWidth
        icon={<Download className="h-4 w-4" />}
        onClick={() => window.open(panduanUrl, "_blank", "noopener,noreferrer")}
      >
        Unduh Panduan Pendaftaran (PDF)
      </Button>
    </div>
  );
};

export default BerandaPage;
