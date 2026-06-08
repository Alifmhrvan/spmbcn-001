export type UserRole = "peserta";

export type AdminRole = "admin" | "superadmin";

export type StatusPendaftaran =
  | "draft"
  | "menunggu"
  | "diverifikasi"
  | "lulus"
  | "ditolak";

export type StatusDokumen = "pending" | "verified" | "rejected";

export interface User {
  id: string;
  nama: string;
  email: string;
  noHp?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  nama: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramStudi {
  id: string;
  kode: string;
  nama: string;
  deskripsi?: string;
  kuota: number;
  terisi: number;
}

export interface JalurPendaftaran {
  id: string;
  nama: string;
  deskripsi?: string;
  biaya: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  aktif: boolean;
}

export interface Dokumen {
  id: string;
  pendaftaranId: string;
  jenis: string;
  namaFile: string;
  url: string;
  ukuran: number;
  status: StatusDokumen;
  catatan?: string;
  uploadedAt: string;
}

export interface Pendaftaran {
  id: string;
  userId: string;
  nomorPendaftaran: string;
  namaLengkap: string;
  nisn?: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  alamat: string;
  programStudiId: string;
  programStudi?: ProgramStudi;
  jalurPendaftaranId: string;
  jalurPendaftaran?: JalurPendaftaran;
  status: StatusPendaftaran;
  dokumen: Dokumen[];
  createdAt: string;
  updatedAt: string;
}

export interface Pengumuman {
  id: string;
  judul: string;
  konten: string;
  tanggalPublish: string;
  penting: boolean;
  createdAt: string;
  updatedAt: string;
}
