
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/userAuth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const { error: authError } = await requireUser(request);
    if (authError) return authError;

    const { passwordBaru } = await request.json();

    if (!passwordBaru || passwordBaru.length < 8) {
      return NextResponse.json(
        { error: "Password baru minimal 8 karakter" },
        { status: 400 }
      );
    }

    
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Password berhasil diubah" });
  } catch (err) {
    console.error("[PUT /api/user/password]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
