
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;

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
         program_studi:program_studi_id(id, kode, nama),
         jalur_pendaftaran:jalur_pendaftaran_id(id, nama, biaya),
         dokumen(id, jenis, nama_file, storage_path, ukuran, mime_type, status, catatan, uploaded_at)`
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    
    const dokumenWithUrls = await Promise.all(
      ((data as any).dokumen ?? []).map(async (dok: any) => {
        const { data: signedData } = await supabaseAdmin.storage
          .from("dokumen-pendaftaran")
          .createSignedUrl(dok.storage_path, 60 * 60); 

        return {
          id: dok.id,
          jenis: dok.jenis,
          namaFile: dok.nama_file,
          format: dok.mime_type?.split("/")[1]?.toUpperCase() ?? "FILE",
          ukuran: dok.ukuran,
          uploadedAt: dok.uploaded_at,
          url: signedData?.signedUrl ?? "#",
          status: dok.status,
          catatan: dok.catatan ?? null,
        };
      })
    );

    const row = data as any;
    return NextResponse.json({
      id: row.id,
      nomorPendaftaran: row.nomor_pendaftaran,
      namaLengkap: row.nama_lengkap,
      nisn: row.nisn ?? null,
      tempatLahir: row.tempat_lahir,
      tanggalLahir: row.tanggal_lahir,
      jenisKelamin: row.jenis_kelamin,
      asalSekolah: row.asal_sekolah,
      alamat: row.alamat,
      noHp: row.no_hp ?? null,
      email: null,
      status: row.status,
      catatanAdmin: row.catatan_admin ?? null,
      submittedAt: row.submitted_at ?? null,
      createdAt: row.created_at,
      programStudi: row.program_studi,
      jalurPendaftaran: row.jalur_pendaftaran,
      dokumen: dokumenWithUrls,
    });
  } catch (err) {
    console.error("[GET /api/admin/verifikasi/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;
    const { keputusan, catatan } = await request.json();

    if (!keputusan || !["setujui", "tolak"].includes(keputusan)) {
      return NextResponse.json(
        { error: "Keputusan harus 'setujui' atau 'tolak'" },
        { status: 400 }
      );
    }

    const newStatus = keputusan === "setujui" ? "diverifikasi" : "ditolak";

    const { error } = await supabaseAdmin
      .from("pendaftaran")
      .update({
        status: newStatus,
        catatan_admin: catatan ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      message:
        keputusan === "setujui"
          ? "Pendaftaran berhasil diverifikasi"
          : "Pendaftaran ditolak",
    });
  } catch (err) {
    console.error("[PUT /api/admin/verifikasi/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
