import Badge from "@/components/ui/Badge";
import { generateInitials, formatDate } from "@/lib/utils";
import { ExternalLink, Clock } from "lucide-react";
import Link from "next/link";

type StatusPendaftaran = "menunggu" | "diverifikasi" | "lulus" | "ditolak";

interface VerifikasiCardProps {
  id: string;
  nomorPendaftaran: string;
  namaLengkap: string;
  programStudi: string;
  jalur: string;
  status: StatusPendaftaran;
  jumlahDokumen: number;
  createdAt: string;
}

const STATUS_LABEL: Record<StatusPendaftaran, string> = {
  menunggu: "Menunggu",
  diverifikasi: "Diverifikasi",
  lulus: "Lulus",
  ditolak: "Ditolak",
};

const AVATAR_COLORS = [
  "bg-primary-600",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
];

const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const VerifikasiCard = ({
  id,
  nomorPendaftaran,
  namaLengkap,
  programStudi,
  jalur,
  status,
  jumlahDokumen,
  createdAt,
}: VerifikasiCardProps) => {
  return (
    <div className="rounded-card border border-neutral-200 bg-white p-4 shadow-card transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
              avatarColor(namaLengkap),
            ].join(" ")}
          >
            {generateInitials(namaLengkap)}
          </div>
          <div>
            <p className="font-medium text-neutral-900">{namaLengkap}</p>
            <p className="font-mono text-xs text-neutral-400">
              {nomorPendaftaran}
            </p>
          </div>
        </div>
        <Badge status={status} label={STATUS_LABEL[status]} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-600">
        <div>
          <span className="text-neutral-400">Prodi: </span>
          {programStudi}
        </div>
        <div>
          <span className="text-neutral-400">Jalur: </span>
          {jalur}
        </div>
        <div>
          <span className="text-neutral-400">Dokumen: </span>
          {jumlahDokumen} berkas
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-neutral-400" />
          {formatDate(createdAt)}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href={`/admin/verifikasi/${id}`}
          className="inline-flex items-center gap-1.5 rounded-btn border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-primary-600 hover:text-primary-600"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Periksa Berkas
        </Link>
      </div>
    </div>
  );
};

export default VerifikasiCard;
