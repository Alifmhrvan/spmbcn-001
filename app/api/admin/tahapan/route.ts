
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = requireAdmin(request);
    if (authError) return authError;

    const { data: jalurList, error: jalurError } = await supabaseAdmin
      .from("jalur_pendaftaran")
      .select("id, nama, tanggal_mulai, tanggal_selesai, aktif")
      .order("created_at", { ascending: true });

    if (jalurError) throw jalurError;

    
    const { data: pendaftaranRows } = await supabaseAdmin
      .from("pendaftaran")
      .select("jalur_pendaftaran_id, status");

    const statsMap: Record<string, Record<string, number>> = {};
    (pendaftaranRows ?? []).forEach((r: any) => {
      const jid = r.jalur_pendaftaran_id;
      if (!statsMap[jid]) statsMap[jid] = {};
      statsMap[jid][r.status] = (statsMap[jid][r.status] ?? 0) + 1;
    });

    const tahapan = (jalurList ?? []).map((jalur) => {
      const stats = statsMap[jalur.id] ?? {};
      const total = Object.values(stats).reduce((a, b) => a + b, 0);
      return {
        id: jalur.id,
        nama: jalur.nama,
        tanggalMulai: jalur.tanggal_mulai,
        tanggalSelesai: jalur.tanggal_selesai,
        aktif: jalur.aktif,
        totalPendaftar: total,
        perStatus: {
          draft: stats["draft"] ?? 0,
          menunggu: stats["menunggu"] ?? 0,
          diverifikasi: stats["diverifikasi"] ?? 0,
          lulus: stats["lulus"] ?? 0,
          ditolak: stats["ditolak"] ?? 0,
        },
      };
    });

    return NextResponse.json(tahapan);
  } catch (err) {
    console.error("[GET /api/admin/tahapan]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
