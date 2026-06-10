
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("program_studi")
      .select("*")
      .order("kode", { ascending: true });

    if (error) throw error;

    const mapped = (data ?? []).map((r) => ({
      id: r.id,
      kode: r.kode,
      nama: r.nama,
      deskripsi: r.deskripsi ?? null,
      kuota: r.kuota,
      terisi: r.terisi,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("[GET /api/program-studi]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
