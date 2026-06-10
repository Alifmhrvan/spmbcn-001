
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/userAuth";

export async function GET(request: NextRequest) {
  try {
    const { error: authError, user } = await requireUser(request);
    if (authError) return authError;

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, nama, no_hp, role, created_at, updated_at")
      .eq("id", user!.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Profil tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: data.id,
      nama: data.nama,
      email: user!.email,
      noHp: data.no_hp ?? null,
      role: data.role,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    console.error("[GET /api/user/profil]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error: authError, user } = await requireUser(request);
    if (authError) return authError;

    const { nama, noHp } = await request.json();

    if (!nama?.trim()) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        nama: nama.trim(),
        no_hp: noHp ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user!.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      nama: data.nama,
      email: user!.email,
      noHp: data.no_hp ?? null,
      role: data.role,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    console.error("[PUT /api/user/profil]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
