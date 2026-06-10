
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/userAuth";

const ALLOWED_JENIS = ["ktp", "ijazah", "transkrip", "pas_foto", "bukti_pembayaran"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; 

export async function POST(request: NextRequest) {
  try {
    const { error: authError, user } = await requireUser(request);
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const jenis = formData.get("jenis") as string | null;
    const pendaftaranId = formData.get("pendaftaranId") as string | null;

    if (!file || !jenis || !pendaftaranId) {
      return NextResponse.json(
        { error: "File, jenis, dan pendaftaranId wajib diisi" },
        { status: 400 }
      );
    }

    if (!ALLOWED_JENIS.includes(jenis as any)) {
      return NextResponse.json(
        { error: `Jenis dokumen tidak valid. Pilihan: ${ALLOWED_JENIS.join(", ")}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5 MB" },
        { status: 400 }
      );
    }

    
    const { data: pendaftaran } = await supabaseAdmin
      .from("pendaftaran")
      .select("id")
      .eq("id", pendaftaranId)
      .eq("user_id", user!.id)
      .single();

    if (!pendaftaran) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const storagePath = `${user!.id}/${pendaftaranId}/${jenis}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    
    const { error: uploadError } = await supabaseAdmin.storage
      .from("dokumen-pendaftaran")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true, 
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Gagal mengupload file" },
        { status: 500 }
      );
    }

    
    const { data: existing } = await supabaseAdmin
      .from("dokumen")
      .select("id")
      .eq("pendaftaran_id", pendaftaranId)
      .eq("jenis", jenis)
      .maybeSingle();

    let dokumenData;
    if (existing) {
      const { data } = await supabaseAdmin
        .from("dokumen")
        .update({
          nama_file: file.name,
          storage_path: storagePath,
          ukuran: file.size,
          mime_type: file.type,
          status: "pending",
          catatan: null,
          uploaded_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
      dokumenData = data;
    } else {
      const { data } = await supabaseAdmin
        .from("dokumen")
        .insert({
          pendaftaran_id: pendaftaranId,
          jenis,
          nama_file: file.name,
          storage_path: storagePath,
          ukuran: file.size,
          mime_type: file.type,
          status: "pending",
        })
        .select()
        .single();
      dokumenData = data;
    }

    return NextResponse.json(
      {
        id: dokumenData?.id,
        jenis,
        namaFile: file.name,
        ukuran: file.size,
        status: "pending",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/user/dokumen]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
