const STATUS_COLORS: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-500",
  menunggu: "bg-neutral-100 text-neutral-600",
  diverifikasi: "bg-primary-50 text-primary-600",
  lulus: "bg-accent/20 text-amber-700",
  ditolak: "bg-danger-light text-danger",
  pending: "bg-neutral-100 text-neutral-600",
  verified: "bg-primary-50 text-primary-600",
  rejected: "bg-danger-light text-danger",
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, index);

  return `${size.toFixed(1)} ${units[index]}`;
};

export const generateInitials = (name: string): string => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status] ?? "bg-neutral-100 text-neutral-600";
};
