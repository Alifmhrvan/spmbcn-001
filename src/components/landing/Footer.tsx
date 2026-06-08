import Link from "next/link";
import { GraduationCap, MapPin, Mail, Phone, Clock } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer id="kontak" className="bg-neutral-900 text-white">
      <div className="max-w-6xl mx-auto px-5 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">SMK Citra Negara</p>
                <p className="text-[10px] text-neutral-400">Depok, Jawa Barat</p>
              </div>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Sekolah Menengah Kejuruan terpercaya di Depok dengan akreditasi Unggul.
              Membentuk generasi terampil dan berkarakter.
            </p>
            <div className="flex items-start gap-2 text-sm text-neutral-400">
              <MapPin size={14} className="mt-0.5 flex-shrink-0 text-primary-400" />
              <span>Jl. Citra Negara, Depok, Jawa Barat 16411</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Navigasi</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Beranda", href: "/landing" },
                { label: "Program Keahlian", href: "#program" },
                { label: "Jalur Pendaftaran", href: "#jalur" },
                { label: "Alur Pendaftaran", href: "#alur" },
                { label: "Masuk / Daftar", href: "/login" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-neutral-400 hover:text-primary-400 transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-neutral-400">
                <Mail size={14} className="flex-shrink-0 text-primary-400" />
                <span>admin@citranegara.sch.id</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-neutral-400">
                <Phone size={14} className="flex-shrink-0 text-primary-400" />
                <span>(021) 1234-5678</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-neutral-400">
                <Clock size={14} className="flex-shrink-0 text-primary-400 mt-0.5" />
                <div>
                  <p>Senin – Jumat</p>
                  <p>07.00 – 16.00 WIB</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            © {year} SMK Citra Negara. Seluruh Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
