import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "PickleStock — Katalog Raket Pickleball",
  description:
    "Cek ketersediaan stok raket pickleball dan pesan langsung via WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-surface-pure font-body-md text-body-md text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
