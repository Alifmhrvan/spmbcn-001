
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; 

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    
    const { data: admin } = await supabaseAdmin
      .from("admins")
      .select("id, nama, email, password_hash, role")
      .eq("email", email)
      .single();

    if (admin) {
      const passwordValid = await bcrypt.compare(password, admin.password_hash);
      if (!passwordValid) {
        return NextResponse.json(
          { error: "Email atau password salah" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const response = NextResponse.json({
        token,
        role: admin.role, 
        user: {
          id: admin.id,
          nama: admin.nama,
          email: admin.email,
          role: admin.role,
        },
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });

      return response;
    }

    
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, nama, no_hp, role")
      .eq("id", data.user.id)
      .single();

    const userRole = profile?.role ?? "peserta";
    const response = NextResponse.json({
      token: data.session.access_token,
      role: userRole,
      user: {
        id: data.user.id,
        nama: profile?.nama ?? data.user.email?.split("@")[0] ?? "",
        email: data.user.email,
        noHp: profile?.no_hp ?? null,
        role: userRole,
      },
    });

    response.cookies.set("token", data.session.access_token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
