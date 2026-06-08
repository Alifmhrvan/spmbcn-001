import { getStatusColor } from "@/lib/utils";

interface BadgeProps {
  status: "menunggu" | "diverifikasi" | "ditolak" | "lulus" | string;
  label: string;
}

const Badge = ({ status, label }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(status)}`}
    >
      {label}
    </span>
  );
};

export default Badge;
