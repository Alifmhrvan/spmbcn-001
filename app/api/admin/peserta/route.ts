
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
    const search = searchParams.get("search")?.trim() ?? "";
    const jalur = searchParams.get("jalur") ?? "semua";
    const status = searchParams.get("status") ?? "semua";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("pendaftaran")
      .select(
        `id,
         nomor_pendaftaran,
         nama_lengkap,
         status,
         created_at,
         profiles:user_id(nama),
         program_studi:program_studi_id(nama),
         jalur_pendaftaran:jalur_pendaftaran_id(id, nama)`,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(
        `nama_lengkap.ilike.%${search}%,nomor_pendaftaran.ilike.%${search}%`
      );
    }

    if (status !== "semua") {
      query = query.eq("status", status);
    }

    if (jalur !== "semua") {
      
      const { data: jalurData } = await supabaseAdmin
        .from("jalur_pendaftaran")
        .select("id")
        .ilike("nama", `%${jalur}%`);
      const jalurIds = (jalurData ?? []).map((j) => j.id);
      if (jalurIds.length > 0) {
        query = query.in("jalur_pendaftaran_id", jalurIds);
      }
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil((count ?? 0) / limit);

    const mapped = (data ?? []).map((row: any) => ({
      id: row.id,
      nomorPendaftaran: row.nomor_pendaftaran,
      namaLengkap: row.nama_lengkap,
      email: row.profiles?.email ?? "",
      programStudi: row.program_studi?.nama ?? "",
      jalur: row.jalur_pendaftaran?.nama ?? "",
      status: row.status,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      data: mapped,
      meta: {
        total: count ?? 0,
        page,
        limit,
        totalPages,
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/peserta]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
