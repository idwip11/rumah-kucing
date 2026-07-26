import Link from "next/link";
import { Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="pt-[120px] pb-[80px] px-6 md:px-[80px] max-w-[1440px] mx-auto w-full">
        <p className="text-[15px] text-on-surface-variant">
          Silakan masuk untuk melihat galeri prestasi anabulmu.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-[15px] font-bold text-primary hover:underline"
        >
          Masuk
        </Link>
      </div>
    );
  }

  const cats = await prisma.cat.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  const activeCat = cats[0];
  const achievements = activeCat
    ? await prisma.achievement.findMany({
        where: { catId: activeCat.id },
        orderBy: [
          { rank: { sort: "asc", nulls: "last" } },
          { achievedAt: "desc" },
        ],
      })
    : [];

  return (
    <div className="pt-[120px] pb-[80px] px-6 md:px-[80px] max-w-[1440px] mx-auto w-full">
      <div className="mb-8">
        <p className="eyebrow mb-2">
          Galeri Prestasi
        </p>
        <h1 className="font-headline text-[34px] font-extrabold leading-[1.15] tracking-tight text-gradient-brand md:text-[44px]">
          Prestasi {activeCat?.name ?? "Anabul"}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-on-surface-variant max-w-[95%]">
          Kumpulan pencapaian dan momen membanggakan dari anabul kesayanganmu.
        </p>
      </div>

      {cats.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {cats.map((cat) => (
            <span
              key={cat.id}
              className={
                "rounded-full px-4 py-2 text-[13px] font-bold " +
                (cat.id === activeCat?.id
                  ? "bg-primary text-white"
                  : "bg-surface-container text-on-surface-variant")
              }
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      {achievements.length === 0 ? (
        <div className="premium-card rounded-[24px] p-8">
          <p className="text-[15px] text-on-surface-variant">
            Belum ada prestasi yang tercatat.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {achievements.map((ach) => (
            <li
              key={ach.id}
              className="premium-card card-hover flex items-start gap-4 rounded-[22px] p-6"
            >
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-honey/55 text-secondary">
                <Trophy className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[17px] font-bold text-on-surface">
                  {ach.title}
                </p>
                {ach.description && (
                  <p className="text-[14px] text-on-surface-variant mt-1">
                    {ach.description}
                  </p>
                )}
                <p className="mt-2 text-[13px] font-bold text-primary">
                  {new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(ach.achievedAt))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10">
        <Link
          href="/"
          className="text-[15px] font-bold text-primary hover:underline"
        >
          ← Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
