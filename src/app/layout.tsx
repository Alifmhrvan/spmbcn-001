import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SPMB Citra Negara",
    template: "%s | SPMB Citra Negara",
  },
  description:
    "Sistem Penerimaan Murid Baru SMK Citra Negara Depok — daftar, unggah berkas, dan pantau status pendaftaran secara online.",
  keywords: [
    "SPMB",
    "SMK Citra Negara",
    "pendaftaran siswa baru",
    "ppdb",
    "Depok",
  ],
  authors: [{ name: "SMK Citra Negara" }],
  openGraph: {
    title: "SPMB Citra Negara",
    description:
      "Sistem Penerimaan Murid Baru SMK Citra Negara Depok",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
