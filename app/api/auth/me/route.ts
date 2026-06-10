
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader?.replace("Bearer ", "") ??
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    const adminPayload = verifyAdminToken(request);
    if (adminPayload) {
      const { data: admin } = await supabaseAdmin
        .from("admins")
        .select("id, nama, email, role")
        .eq("id", adminPayload.id)
        .single();

      if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json({
        id: admin.id,
        nama: admin.nama,
        email: admin.email,
        role: admin.role,
      });
    }

    
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, nama, no_hp, role, created_at, updated_at")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      id: user.id,
      nama: profile?.nama ?? "",
      email: user.email,
      noHp: profile?.no_hp ?? null,
      role: profile?.role ?? "peserta",
      createdAt: profile?.created_at ?? user.created_at,
      updatedAt: profile?.updated_at ?? user.updated_at,
    });
  } catch (err) {
    console.error("[GET /api/auth/me]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
