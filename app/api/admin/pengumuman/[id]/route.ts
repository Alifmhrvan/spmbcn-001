
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;
    const { judul, konten, penting, tanggalPublish } = await request.json();

    if (!judul || !konten) {
      return NextResponse.json(
        { error: "Judul dan konten wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("pengumuman")
      .update({
        judul,
        konten,
        penting: penting ?? false,
        tanggal_publish: tanggalPublish ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Pengumuman tidak ditemukan" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      id: data.id,
      judul: data.judul,
      konten: data.konten,
      penting: data.penting,
      tanggalPublish: data.tanggal_publish,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    console.error("[PUT /api/admin/pengumuman/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("pengumuman")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Pengumuman berhasil dihapus" });
  } catch (err) {
    console.error("[DELETE /api/admin/pengumuman/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
