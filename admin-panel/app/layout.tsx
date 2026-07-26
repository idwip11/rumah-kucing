import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rumah Kucing — Admin Panel",
  description: "Admin panel for Rumah Kucing pet care platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
