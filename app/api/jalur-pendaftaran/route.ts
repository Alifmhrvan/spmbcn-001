
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("jalur_pendaftaran")
      .select("*")
      .eq("aktif", true)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const mapped = (data ?? []).map((r) => ({
      id: r.id,
      nama: r.nama,
      deskripsi: r.deskripsi ?? null,
      biaya: r.biaya,
      tanggalMulai: r.tanggal_mulai,
      tanggalSelesai: r.tanggal_selesai,
      aktif: r.aktif,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("[GET /api/jalur-pendaftaran]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
