import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import "@/lib/event-cleanup";
import { computeAgeLabel } from "@/lib/age";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import type { CatProfile } from "@/store/use-cat-store";

export const metadata: Metadata = {
  title: "Rumah Kucing - Digital Cat Care",
  description:
    "Dashboard perawatan kucing personal dengan Ketty AI, timeline kesehatan, edukasi, dan rekomendasi produk kontekstual.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const cats = user
    ? await prisma.cat.findMany({
        where: { userId: user.id },
        include: { breed: true },
        orderBy: { createdAt: "asc" },
      })
    : [];
  const initialCats: CatProfile[] = cats.map((cat) => ({
    id: cat.id,
    name: cat.name,
    breed: cat.breed?.name ?? "Campuran",
    age: cat.estimatedDateOfBirth
      ? computeAgeLabel(cat.estimatedDateOfBirth)
      : (cat.ageLabel ?? "-"),
    estimatedDateOfBirth: cat.estimatedDateOfBirth
      ? cat.estimatedDateOfBirth.toISOString().split("T")[0]
      : null,
    weight: cat.weightKg != null ? `${cat.weightKg} kg` : "-",
    gender: cat.gender ?? "",
    sterilized: cat.sterilized ?? false,
    lifestyle: cat.lifestyle ?? "",
    note: cat.notes ?? "",
    photoUrl: cat.photoUrl ?? null,
  }));

  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Nunito:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground">
        <AppShell initialUser={user} initialCats={initialCats}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
