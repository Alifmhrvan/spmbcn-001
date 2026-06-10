
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = requireAdmin(request);
    if (authError) return authError;

    const { data, error } = await supabaseAdmin
      .from("pengumuman")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped = (data ?? []).map((r) => ({
      id: r.id,
      judul: r.judul,
      konten: r.konten,
      penting: r.penting,
      tanggalPublish: r.tanggal_publish,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("[GET /api/admin/pengumuman]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error: authError, admin } = requireAdmin(request);
    if (authError) return authError;

    const { judul, konten, penting, tanggalPublish } = await request.json();

    if (!judul || !konten) {
      return NextResponse.json(
        { error: "Judul dan konten wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("pengumuman")
      .insert({
        judul,
        konten,
        penting: penting ?? false,
        tanggal_publish: tanggalPublish ?? new Date().toISOString(),
        dibuat_oleh: admin!.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        id: data.id,
        judul: data.judul,
        konten: data.konten,
        penting: data.penting,
        tanggalPublish: data.tanggal_publish,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/admin/pengumuman]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
