

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = requireAdmin(request);
    if (authError) return authError;

    
    
    

    const { count: totalPendaftar } = await supabaseAdmin
      .from("pendaftaran")
      .select("*", { count: "exact", head: true });

    
    
    

    const { data: statusRows } = await supabaseAdmin
      .from("pendaftaran")
      .select("status");

    const perStatus: Record<string, number> = {
      draft: 0,
      menunggu: 0,
      diverifikasi: 0,
      lulus: 0,
      ditolak: 0,
    };

    (statusRows ?? []).forEach((r) => {
      if (r.status in perStatus) {
        perStatus[r.status]++;
      }
    });

    
    
    

    const { data: jalurRows } = await supabaseAdmin
      .from("pendaftaran")
      .select(
        "jalur_pendaftaran_id, jalur_pendaftaran:jalur_pendaftaran_id(nama)"
      );

    const jalurMap: Record<
      string,
      {
        id: string;
        nama: string;
        total: number;
      }
    > = {};

    (jalurRows ?? []).forEach((r: any) => {
      const id = r.jalur_pendaftaran_id;
      const nama = r.jalur_pendaftaran?.nama ?? id;

      if (!jalurMap[id]) {
        jalurMap[id] = {
          id,
          nama,
          total: 0,
        };
      }

      jalurMap[id].total++;
    });

    const perJalur = Object.values(jalurMap).sort(
      (a, b) => b.total - a.total
    );

    
    
    

    const { data: programStudiRows } = await supabaseAdmin
      .from("program_studi")
      .select("id, nama, kuota, terisi")
      .order("terisi", { ascending: false });

    
    
    

    const now = new Date();

    const awalBulanIni = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const awalBulanLalu = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const { count: bulanIni } = await supabaseAdmin
      .from("pendaftaran")
      .select("*", { count: "exact", head: true })
      .gte("created_at", awalBulanIni.toISOString());

    const { count: bulanLalu } = await supabaseAdmin
      .from("pendaftaran")
      .select("*", { count: "exact", head: true })
      .gte("created_at", awalBulanLalu.toISOString())
      .lt("created_at", awalBulanIni.toISOString());

    const growth =
      (bulanLalu ?? 0) > 0
        ? (
            (((bulanIni ?? 0) - (bulanLalu ?? 0)) /
              (bulanLalu ?? 0)) *
            100
          ).toFixed(1)
        : "0";

    
    
    

    const { data: trendRows } = await supabaseAdmin
      .from("pendaftaran")
      .select("created_at")
      .gte(
        "created_at",
        new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString()
      );

    const trendMap: Record<string, number> = {};

    (trendRows ?? []).forEach((r) => {
      const day = new Date(r.created_at).toLocaleDateString(
        "id-ID",
        {
          weekday: "short",
        }
      );

      trendMap[day] = (trendMap[day] ?? 0) + 1;
    });

    const trend7d = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();

      d.setDate(d.getDate() - (6 - i));

      const day = d.toLocaleDateString("id-ID", {
        weekday: "short",
      });

      return {
        day,
        pendaftar: trendMap[day] ?? 0,
      };
    });

    
    
    

    const { data: aktivitasRows } = await supabaseAdmin
      .from("pendaftaran")
      .select(
        `
          id,
          nama_lengkap,
          status,
          updated_at
        `
      )
      .order("updated_at", {
        ascending: false,
      })
      .limit(5);

    const aktivitasTerbaru = (aktivitasRows ?? []).map(
      (r: any) => ({
        id: r.id,
        nama: r.nama_lengkap,
        status: r.status,
        waktu: r.updated_at,
      })
    );

    
    
    

    return NextResponse.json({
      totalPendaftar: totalPendaftar ?? 0,
      growth,
      perStatus,
      perJalur,
      programStudi: programStudiRows ?? [],
      trend7d,
      aktivitasTerbaru,
    });
  } catch (err) {
    console.error("[GET /api/admin/dashboard]", err);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}