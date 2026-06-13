import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const nomor = request.nextUrl.searchParams.get("nomor")?.trim();

    if (!nomor) {
      return NextResponse.json(
        { success: false, message: "Nomor pendaftaran wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("pendaftaran")
      .select(
        `nama_lengkap,
         nomor_pendaftaran,
         status,
         program_studi:program_studi_id(nama),
         jalur_pendaftaran:jalur_pendaftaran_id(nama)`
      )
      .eq("nomor_pendaftaran", nomor)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: "Nomor pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    const row = data as any;

    return NextResponse.json({
      success: true,
      data: {
        nama: row.nama_lengkap,
        nomor_pendaftaran: row.nomor_pendaftaran,
        program_studi: row.program_studi?.nama ?? "-",
        jalur: row.jalur_pendaftaran?.nama ?? "-",
        status: row.status,
      },
    });
  } catch (err) {
    console.error("[GET /api/publik/cek-status]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}