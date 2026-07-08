import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Rumah Kucing - Digital Cat Care",
  description:
    "Dashboard perawatan kucing personal dengan Ketty AI, timeline kesehatan, edukasi, dan rekomendasi produk kontekstual."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
