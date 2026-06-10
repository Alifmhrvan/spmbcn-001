
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/userAuth";

export async function GET(request: NextRequest) {
  try {
    const { error: authError, user } = await requireUser(request);
    if (authError) return authError;

    const { data, error } = await supabaseAdmin
      .from("pendaftaran")
      .select(
        `id,
         nomor_pendaftaran,
         nama_lengkap,
         nisn,
         tempat_lahir,
         tanggal_lahir,
         jenis_kelamin,
         asal_sekolah,
         alamat,
         no_hp,
         status,
         catatan_admin,
         submitted_at,
         created_at,
         updated_at,
         program_studi:program_studi_id(id, kode, nama, kuota, terisi),
         jalur_pendaftaran:jalur_pendaftaran_id(id, nama, biaya, tanggal_mulai, tanggal_selesai),
         dokumen(id, jenis, nama_file, storage_path, ukuran, mime_type, status, catatan, uploaded_at)`
      )
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        
        return NextResponse.json(null);
      }
      throw error;
    }

    const row = data as any;

    
    const dokumenWithUrls = await Promise.all(
      (row.dokumen ?? []).map(async (dok: any) => {
        const { data: signedData } = await supabaseAdmin.storage
          .from("dokumen-pendaftaran")
          .createSignedUrl(dok.storage_path, 60 * 60);

        return {
          id: dok.id,
          jenis: dok.jenis,
          namaFile: dok.nama_file,
          url: signedData?.signedUrl ?? "#",
          ukuran: dok.ukuran,
          status: dok.status,
          catatan: dok.catatan ?? null,
          uploadedAt: dok.uploaded_at,
        };
      })
    );

    return NextResponse.json({
      id: row.id,
      userId: user!.id,
      nomorPendaftaran: row.nomor_pendaftaran,
      namaLengkap: row.nama_lengkap,
      nisn: row.nisn ?? null,
      tempatLahir: row.tempat_lahir,
      tanggalLahir: row.tanggal_lahir,
      jenisKelamin: row.jenis_kelamin,
      asalSekolah: row.asal_sekolah,
      alamat: row.alamat,
      noHp: row.no_hp ?? null,
      status: row.status,
      catatanAdmin: row.catatan_admin ?? null,
      submittedAt: row.submitted_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      programStudi: row.program_studi,
      jalurPendaftaran: row.jalur_pendaftaran,
      dokumen: dokumenWithUrls,
    });
  } catch (err) {
    console.error("[GET /api/user/pendaftaran]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error: authError, user } = await requireUser(request);
    if (authError) return authError;

    
    const { data: existing } = await supabaseAdmin
      .from("pendaftaran")
      .select("id, status")
      .eq("user_id", user!.id)
      .not("status", "eq", "ditolak")
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Kamu sudah memiliki pendaftaran aktif" },
        { status: 409 }
      );
    }

    const body = await request.json();
    const {
      namaLengkap,
      nisn,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      asalSekolah,
      alamat,
      noHp,
      programStudiId,
      jalurPendaftaranId,
    } = body;

    if (
      !namaLengkap ||
      !tempatLahir ||
      !tanggalLahir ||
      !jenisKelamin ||
      !asalSekolah ||
      !alamat ||
      !programStudiId ||
      !jalurPendaftaranId
    ) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("pendaftaran")
      .insert({
        user_id: user!.id,
        nomor_pendaftaran: "", 
        nama_lengkap: namaLengkap,
        nisn: nisn ?? null,
        tempat_lahir: tempatLahir,
        tanggal_lahir: tanggalLahir,
        jenis_kelamin: jenisKelamin,
        asal_sekolah: asalSekolah,
        alamat,
        no_hp: noHp ?? null,
        program_studi_id: programStudiId,
        jalur_pendaftaran_id: jalurPendaftaranId,
        status: "menunggu",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { id: data.id, nomorPendaftaran: data.nomor_pendaftaran },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/user/pendaftaran]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
