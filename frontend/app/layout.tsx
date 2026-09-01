import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lapangin — Cari & Booking Lapangan Olahraga",
  description: "Platform booking lapangan olahraga terpercaya di Indonesia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#ffffff", color: "#0b1c30" }}>
        {children}
      </body>
    </html>
  );
}