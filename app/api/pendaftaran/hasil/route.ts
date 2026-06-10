
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const nomor = request.nextUrl.searchParams.get("nomor");

    if (!nomor) {
      return NextResponse.json(
        { error: "Parameter nomor wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("pendaftaran")
      .select(
        `nomor_pendaftaran,
         nama_lengkap,
         status,
         catatan_admin,
         program_studi:program_studi_id(nama),
         jalur_pendaftaran:jalur_pendaftaran_id(nama),
         tahapan_pendaftaran(label, selesai, tanggal)`
      )
      .eq("nomor_pendaftaran", nomor.toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json(null);
    }

    const row = data as any;

    
    const timeline =
      row.tahapan_pendaftaran && row.tahapan_pendaftaran.length > 0
        ? row.tahapan_pendaftaran.map((t: any) => ({
            label: t.label,
            completed: t.selesai,
            date: t.tanggal ?? undefined,
          }))
        : [
            {
              label: "Pendaftaran Diterima",
              completed: true,
            },
            {
              label: "Verifikasi Dokumen",
              completed: ["diverifikasi", "lulus", "ditolak"].includes(row.status),
            },
            {
              label: "Pengumuman Seleksi",
              completed: ["lulus", "ditolak"].includes(row.status),
            },
            { label: "Daftar Ulang", completed: row.status === "lulus" },
            { label: "Pembayaran UKT", completed: false },
            { label: "Orientasi Mahasiswa Baru", completed: false },
          ];

    return NextResponse.json({
      nomorPendaftaran: row.nomor_pendaftaran,
      namaLengkap: row.nama_lengkap,
      programStudi: row.program_studi?.nama ?? "—",
      jalur: row.jalur_pendaftaran?.nama ?? "—",
      status: row.status,
      catatan: row.catatan_admin ?? undefined,
      timeline,
    });
  } catch (err) {
    console.error("[GET /api/pendaftaran/hasil]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
