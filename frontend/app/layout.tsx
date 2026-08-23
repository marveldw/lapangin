import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lapangin - Dashboard Owner",
  description: "Sistem Sewa Lapangan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Wajib ada link ini supaya semua ikon Google Stitch muncul */}
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
        />
      </head>
      <body className="bg-[#f8f9ff] text-[#0b1c30] antialiased">
        {children}
      </body>
    </html>
  );
}