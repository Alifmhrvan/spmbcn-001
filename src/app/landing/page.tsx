"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Code2, Palette, Briefcase, ShoppingBag,
  Building2, Network, ChevronUp, Search, Loader2,
  Trophy, Clock, XCircle,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface ProgramStudi {
  id: string;
  kode: string;
  nama: string;
  kuota: number;
  terisi: number;
  deskripsi?: string;
}

interface JalurPendaftaran {
  id: string;
  nama: string;
  deskripsi: string;
  biaya: number;
  tanggal_buka: string;
  tanggal_tutup: string;
  aktif: number;
}

interface StatusResult {
  nama: string;
  nomor_pendaftaran: string;
  program_studi: string;
  jalur: string;
  status: "draft" | "menunggu" | "diverifikasi" | "lulus" | "ditolak";
}

const PROGRAM_FALLBACK: ProgramStudi[] = [
  { id: "1", kode: "PPLG", nama: "Pengembangan Perangkat Lunak dan Game", kuota: 72, terisi: 0, deskripsi: "Pelajari pengembangan aplikasi, web, dan game secara profesional." },
  { id: "2", kode: "DKV", nama: "Desain Komunikasi Visual", kuota: 36, terisi: 0, deskripsi: "Kuasai desain grafis, ilustrasi, dan komunikasi visual kreatif." },
  { id: "3", kode: "MPLB", nama: "Manajemen Perkantoran dan Layanan Bisnis", kuota: 36, terisi: 0, deskripsi: "Kelola administrasi dan layanan bisnis dengan profesional." },
  { id: "4", kode: "PEMASARAN", nama: "Pemasaran", kuota: 36, terisi: 0, deskripsi: "Pelajari strategi pemasaran digital dan konvensional." },
  { id: "5", kode: "PERHOTELAN", nama: "Perhotelan", kuota: 36, terisi: 0, deskripsi: "Persiapkan diri untuk karir di industri perhotelan dan pariwisata." },
  { id: "6", kode: "TJKT", nama: "Teknik Jaringan Komputer dan Telekomunikasi", kuota: 36, terisi: 0, deskripsi: "Kuasai jaringan komputer, keamanan siber, dan telekomunikasi." },
];

const JALUR_FALLBACK: JalurPendaftaran[] = [
  { id: "1", nama: "Reguler", deskripsi: "Seleksi berdasarkan nilai rapor dan ujian tertulis. Jalur terbuka untuk semua calon peserta didik.", biaya: 150000, tanggal_buka: "2026-05-01", tanggal_tutup: "2026-06-30", aktif: 1 },
  { id: "2", nama: "Prestasi", deskripsi: "Jalur khusus bagi pemilik prestasi akademik maupun non-akademik tingkat kabupaten hingga nasional.", biaya: 100000, tanggal_buka: "2026-04-15", tanggal_tutup: "2026-05-31", aktif: 0 },
  { id: "3", nama: "Mandiri", deskripsi: "Seleksi mandiri oleh institusi dengan tes khusus. Daya tampung terbatas.", biaya: 200000, tanggal_buka: "2026-06-01", tanggal_tutup: "2026-07-15", aktif: 1 },
];

const PROGRAM_ICONS: Record<string, React.ElementType> = {
  PPLG: Code2, DKV: Palette, MPLB: Briefcase,
  PEMASARAN: ShoppingBag, PERHOTELAN: Building2, TJKT: Network,
};

const ALUR = [
  { no: 1, label: "Buat Akun", desc: "Daftarkan email dan buat password untuk akun SPMB kamu." },
  { no: 2, label: "Isi Formulir", desc: "Lengkapi data diri dan pilih program keahlian yang diinginkan." },
  { no: 3, label: "Upload Dokumen", desc: "Unggah dokumen persyaratan seperti ijazah, foto, dan bukti pembayaran." },
  { no: 4, label: "Verifikasi Admin", desc: "Tim kami akan memverifikasi kelengkapan dan keabsahan dokumen." },
  { no: 5, label: "Pengumuman", desc: "Hasil seleksi diumumkan melalui sistem dan email terdaftar." },
];

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const formatTanggal = (str: string) =>
  new Date(str).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

const getJalurStatus = (jalur: JalurPendaftaran) => {
  if (!jalur.aktif) return { label: "Ditutup", color: "bg-danger-light text-danger" };
  const now = new Date();
  const buka = new Date(jalur.tanggal_buka);
  const tutup = new Date(jalur.tanggal_tutup);
  if (now < buka) return { label: "Segera Dibuka", color: "bg-amber-50 text-amber-700" };
  if (now > tutup) return { label: "Ditutup", color: "bg-danger-light text-danger" };
  return { label: "Sedang Dibuka", color: "bg-primary-50 text-primary-700" };
};

const CardSkeleton = () => (
  <div className="rounded-card border border-neutral-200 bg-white p-6 animate-pulse space-y-3">
    <div className="w-10 h-10 rounded-lg bg-neutral-200" />
    <div className="h-4 bg-neutral-200 rounded w-3/4" />
    <div className="h-3 bg-neutral-100 rounded w-full" />
    <div className="h-3 bg-neutral-100 rounded w-2/3" />
  </div>
);

const LandingPage = () => {
  const [programs, setPrograms] = useState<ProgramStudi[]>([]);
  const [jalur, setJalur] = useState<JalurPendaftaran[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingJalur, setLoadingJalur] = useState(true);
  const [showBackTop, setShowBackTop] = useState(false);
  const [nomorCek, setNomorCek] = useState("");
  const [loadingCek, setLoadingCek] = useState(false);
  const [statusResult, setStatusResult] = useState<StatusResult | null>(null);
  const [statusError, setStatusError] = useState("");
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/spmb-api";

  useEffect(() => {
    fetch(`${apiBase}/api/publik/program-studi`)
      .then((r) => r.json())
      .then((j) => setPrograms(j.success && Array.isArray(j.data) ? j.data : PROGRAM_FALLBACK))
      .catch(() => setPrograms(PROGRAM_FALLBACK))
      .finally(() => setLoadingPrograms(false));
  }, [apiBase]);

  useEffect(() => {
    fetch(`${apiBase}/api/publik/jalur`)
      .then((r) => r.json())
      .then((j) => setJalur(j.success && Array.isArray(j.data) ? j.data : JALUR_FALLBACK))
      .catch(() => setJalur(JALUR_FALLBACK))
      .finally(() => setLoadingJalur(false));
  }, [apiBase]);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCekStatus = async () => {
    if (!nomorCek.trim()) return;
    setLoadingCek(true);
    setStatusResult(null);
    setStatusError("");
    try {
      const res = await fetch(`${apiBase}/api/publik/cek-status?nomor=${encodeURIComponent(nomorCek.trim())}`);
      const json = await res.json();
      if (json.success && json.data) setStatusResult(json.data);
      else setStatusError(json.message ?? "Nomor pendaftaran tidak ditemukan.");
    } catch {
      setStatusError("Gagal terhubung ke server. Pastikan XAMPP sudah berjalan.");
    } finally {
      setLoadingCek(false);
    }
  };

  const displayPrograms = programs.length > 0 ? programs : PROGRAM_FALLBACK;
  const displayJalur = jalur.length > 0 ? jalur : JALUR_FALLBACK;

  return (
    <>
      <Navbar />
      <main className="pt-16">

        {/* HERO */}
        <section className="min-h-[92vh] flex items-center justify-center bg-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(#2e7d32 1px, transparent 1px), linear-gradient(90deg, #2e7d32 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute top-20 right-0 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-60 -translate-y-1/4 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-40 translate-y-1/4 -translate-x-1/4" />

          <div className="relative max-w-4xl mx-auto px-5 text-center py-20">
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
              <span className="text-xs font-semibold text-primary-700 tracking-wide">
                SPMB 2026/2027 Resmi Dibuka
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] mb-6 tracking-tight">
              Wujudkan Masa Depanmu{" "}
              <span className="text-primary-600">di SMK Citra Negara</span>
            </h1>

            <p className="text-lg text-neutral-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Pilih program keahlian terbaik dan daftarkan dirimu sekarang.
              Proses pendaftaran 100% online, mudah, dan transparan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-primary-600 rounded-btn hover:bg-primary-700 transition-colors shadow-sm"
              >
                Daftar Sekarang <ArrowRight size={16} />
              </Link>
              <a
                href="#program"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-neutral-700 bg-neutral-100 rounded-btn hover:bg-neutral-200 transition-colors"
              >
                Lihat Program
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {[
                { value: "6", label: "Program Keahlian" },
                { value: "Unggul", label: "Akreditasi" },
                { value: "Online", label: "Pendaftaran" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-bold text-neutral-900">{s.value}</p>
                  <p className="text-xs text-neutral-400 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROGRAM KEAHLIAN */}
        <section id="program" className="py-20 bg-neutral-50">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3">Program Keahlian</p>
              <h2 className="text-3xl font-bold text-neutral-900 mb-3">Pilih Jalur Karirmu</h2>
              <p className="text-neutral-500 max-w-md mx-auto text-sm">
                Enam program keahlian dirancang untuk mempersiapkanmu menghadapi dunia industri.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {loadingPrograms
                ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                : displayPrograms.map((prodi) => {
                    const Icon = PROGRAM_ICONS[prodi.kode] ?? Code2;
                    const sisa = prodi.kuota - prodi.terisi;
                    const persen = prodi.kuota > 0 ? Math.round((prodi.terisi / prodi.kuota) * 100) : 0;
                    return (
                      <div key={prodi.id} className="group rounded-card border border-neutral-200 bg-white p-6 hover:border-primary-300 hover:shadow-card-hover transition-all duration-200">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                          <Icon size={20} className="text-primary-600" />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-900 mb-2 leading-snug">{prodi.nama}</h3>
                        <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                          {prodi.deskripsi ?? "Program keahlian unggulan SMK Citra Negara."}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-neutral-400">
                            <span>Kuota tersisa</span>
                            <span className="font-semibold text-neutral-700">{sisa > 0 ? sisa : "Penuh"}</span>
                          </div>
                          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-600 rounded-full" style={{ width: `${Math.min(persen, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </section>

        {/* JALUR PENDAFTARAN */}
        <section id="jalur" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3">Jalur Pendaftaran</p>
              <h2 className="text-3xl font-bold text-neutral-900 mb-3">Pilih Jalur yang Sesuai</h2>
              <p className="text-neutral-500 max-w-md mx-auto text-sm">
                Tersedia tiga jalur pendaftaran dengan ketentuan dan biaya yang berbeda.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {loadingJalur
                ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                : displayJalur.map((j) => {
                    const isRegular = j.nama.toLowerCase() === "reguler";
                    const status = getJalurStatus(j);
                    return (
                      <div key={j.id} className={`rounded-card border-2 p-6 relative ${isRegular ? "border-primary-600 bg-primary-50/30" : "border-neutral-200 bg-white"}`}>
                        {isRegular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-primary-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Terpopuler</span>
                          </div>
                        )}
                        <div className="mb-4">
                          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-1">Jalur {j.nama}</h3>
                        <p className="text-xs text-neutral-500 mb-4 leading-relaxed">{j.deskripsi}</p>
                        <div className="space-y-2 border-t border-neutral-100 pt-4">
                          <div className="flex justify-between">
                            <span className="text-neutral-400 text-xs">Biaya Pendaftaran</span>
                            <span className="font-semibold text-neutral-800 text-xs">{formatRupiah(j.biaya)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400 text-xs">Dibuka</span>
                            <span className="font-medium text-neutral-700 text-xs">{formatTanggal(j.tanggal_buka)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400 text-xs">Ditutup</span>
                            <span className="font-medium text-neutral-700 text-xs">{formatTanggal(j.tanggal_tutup)}</span>
                          </div>
                        </div>
                        <Link href="/register" className={`mt-5 block w-full text-center py-2.5 text-sm font-semibold rounded-btn transition-colors ${isRegular ? "bg-primary-600 text-white hover:bg-primary-700" : "border border-primary-600 text-primary-600 hover:bg-primary-50"}`}>
                          Daftar via {j.nama}
                        </Link>
                      </div>
                    );
                  })}
            </div>
          </div>
        </section>

        {/* CEK STATUS */}
        <section className="py-20 bg-neutral-50">
          <div className="max-w-xl mx-auto px-5">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3">Cek Status</p>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Cek Status Pendaftaran</h2>
              <p className="text-sm text-neutral-500">Masukkan nomor pendaftaran untuk melihat status seleksi.</p>
            </div>
            <div className="bg-white rounded-card border border-neutral-200 shadow-card p-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={nomorCek}
                    onChange={(e) => setNomorCek(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCekStatus()}
                    placeholder="Contoh: SPMB-2026-00001"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-300 rounded-btn bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleCekStatus}
                  disabled={loadingCek || !nomorCek.trim()}
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-btn hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loadingCek ? <Loader2 size={15} className="animate-spin" /> : "Cek"}
                </button>
              </div>

              {statusError && (
                <div className="mt-4 flex items-center gap-2.5 p-3.5 bg-danger-light rounded-btn">
                  <XCircle size={16} className="text-danger flex-shrink-0" />
                  <p className="text-sm text-danger">{statusError}</p>
                </div>
              )}

              {statusResult && (
                <div className={`mt-4 p-4 rounded-btn border ${statusResult.status === "lulus" ? "bg-primary-50 border-primary-200" : statusResult.status === "ditolak" ? "bg-danger-light border-red-200" : "bg-amber-50 border-amber-200"}`}>
                  <div className="flex items-start gap-3">
                    {statusResult.status === "lulus" ? (
                      <Trophy size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
                    ) : statusResult.status === "ditolak" ? (
                      <XCircle size={20} className="text-danger flex-shrink-0 mt-0.5" />
                    ) : (
                      <Clock size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{statusResult.nama}</p>
                      <p className="text-xs text-neutral-500 mb-2">{statusResult.nomor_pendaftaran}</p>
                      <div className="space-y-1 text-xs text-neutral-600">
                        <p>Program: <span className="font-medium">{statusResult.program_studi}</span></p>
                        <p>Jalur: <span className="font-medium">{statusResult.jalur}</span></p>
                        <p>Status: <span className="font-semibold capitalize">{statusResult.status}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ALUR PENDAFTARAN */}
        <section id="alur" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3">Cara Daftar</p>
              <h2 className="text-3xl font-bold text-neutral-900 mb-3">Alur Pendaftaran</h2>
              <p className="text-neutral-500 max-w-md mx-auto text-sm">
                Proses pendaftaran mudah dan sepenuhnya online dalam 5 langkah sederhana.
              </p>
            </div>

            {/* Desktop horizontal */}
            <div className="hidden md:flex items-start">
              {ALUR.map((step, i) => (
                <div key={step.no} className="flex items-start flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                      {step.no}
                    </div>
                    <div className="mt-4 text-center px-2">
                      <p className="text-sm font-semibold text-neutral-900 mb-1">{step.label}</p>
                      <p className="text-xs text-neutral-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                  {i < ALUR.length - 1 && (
                    <div className="h-0.5 bg-neutral-200 mt-5 w-8 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile vertical */}
            <div className="md:hidden space-y-0">
              {ALUR.map((step, i) => (
                <div key={step.no} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {step.no}
                    </div>
                    {i < ALUR.length - 1 && <div className="w-0.5 flex-1 bg-neutral-200 my-2 min-h-[24px]" />}
                  </div>
                  <div className="pb-6 pt-1.5">
                    <p className="text-sm font-semibold text-neutral-900 mb-1">{step.label}</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary-600">
          <div className="max-w-2xl mx-auto px-5 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Siap Bergabung?</h2>
            <p className="text-primary-100 mb-8 text-sm leading-relaxed">
              Jangan lewatkan kesempatan mendaftar di SMK Citra Negara. Kuota terbatas,
              daftar sekarang sebelum pendaftaran ditutup.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-primary-700 bg-white rounded-btn hover:bg-neutral-50 transition-colors shadow-sm">
                Daftar Sekarang <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-white border border-white/40 rounded-btn hover:bg-white/10 transition-colors">
                Sudah Punya Akun? Masuk
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-5 w-10 h-10 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-all duration-300 z-40 ${showBackTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        aria-label="Kembali ke atas"
      >
        <ChevronUp size={18} />
      </button>
    </>
  );
};

export default LandingPage;
