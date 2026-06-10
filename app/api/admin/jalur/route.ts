
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = requireAdmin(request);
    if (authError) return authError;

    const { data, error } = await supabaseAdmin
      .from("jalur_pendaftaran")
      .select("*")
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
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("[GET /api/admin/jalur]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error: authError } = requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { id, nama, deskripsi, biaya, tanggalMulai, tanggalSelesai, aktif } = body;

    if (!id) {
      return NextResponse.json({ error: "ID jalur wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("jalur_pendaftaran")
      .update({
        ...(nama !== undefined && { nama }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(biaya !== undefined && { biaya }),
        ...(tanggalMulai !== undefined && { tanggal_mulai: tanggalMulai }),
        ...(tanggalSelesai !== undefined && { tanggal_selesai: tanggalSelesai }),
        ...(aktif !== undefined && { aktif }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error("[PUT /api/admin/jalur]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
