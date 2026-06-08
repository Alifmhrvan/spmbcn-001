import Badge from "@/components/ui/Badge";
import { generateInitials } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type StatusFilter = "semua" | "diverifikasi" | "lulus" | "ditolak" | "menunggu";

interface Peserta {
  id: string;
  nomorPendaftaran: string;
  namaLengkap: string;
  email: string;
  programStudi: string;
  jalur: string;
  status: StatusFilter;
}

interface PesertaTableProps {
  data: Peserta[];
  loading?: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  semua: "Semua",
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

const PesertaTable = ({ data, loading = false }: PesertaTableProps) => {
  if (loading) {
    return (
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-4 px-6 py-4">
            <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-40 rounded bg-neutral-200" />
              <div className="h-3 w-56 rounded bg-neutral-100" />
            </div>
            <div className="h-5 w-20 rounded-full bg-neutral-200" />
            <div className="h-3 w-16 rounded bg-neutral-100" />
            <div className="h-3 w-24 rounded bg-neutral-100" />
            <div className="h-7 w-7 rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-16 text-center text-neutral-400">
        <p className="text-sm">Tidak ada data peserta</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50 text-left">
            <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Peserta
            </th>
            <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
              No. Pendaftaran
            </th>
            <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Jalur
            </th>
            <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Status
            </th>
            <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {data.map((peserta) => (
            <tr
              key={peserta.id}
              className="transition-colors hover:bg-neutral-50"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                      avatarColor(peserta.namaLengkap),
                    ].join(" ")}
                  >
                    {generateInitials(peserta.namaLengkap)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {peserta.namaLengkap}
                    </p>
                    <p className="text-xs text-neutral-500">{peserta.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="font-mono text-xs text-neutral-600">
                  {peserta.nomorPendaftaran}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-neutral-700">{peserta.jalur}</span>
                <p className="text-xs text-neutral-400">{peserta.programStudi}</p>
              </td>
              <td className="px-6 py-4">
                <Badge
                  status={peserta.status}
                  label={STATUS_LABEL[peserta.status] ?? peserta.status}
                />
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/admin/verifikasi/${peserta.id}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-btn text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  title="Lihat Detail"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PesertaTable;
