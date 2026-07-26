import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gauge, MapPin, Scale, Scissors } from "lucide-react";
import { BreedListPicker } from "@/components/breed-list-picker";
import type { BreedFavoriteListType } from "@/lib/catpedia/favorites";

type BreedCardProps = {
  id: string;
  name: string;
  origin?: string | null;
  imageSrc?: string | null;
  shortDescription?: string | null;
  characteristics: string[];
  careLevel?: string | null;
  activityLevel?: string | null;
  activityScore?: number | null;
  groomingScore?: number | null;
  profileHref: string;
  isCompareSelected?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: () => void;
  isAuthenticated?: boolean;
  favoriteListTypes?: BreedFavoriteListType[];
  onFavoriteChange?: (listTypes: BreedFavoriteListType[]) => void;
};

function scoreLabel(score?: number | null) {
  if (score == null) return null;
  if (score >= 8) return "Tinggi";
  if (score >= 5) return "Sedang";
  return "Rendah";
}

function inferActivity(
  level: string | null | undefined,
  score: number | null | undefined,
  characteristics: string[],
) {
  if (level?.trim()) return level;

  const fromScore = scoreLabel(score);
  if (fromScore) return fromScore;

  const text = characteristics.join(" ").toLowerCase();
  if (
    ["sangat aktif", "aktif", "atletis", "enerjik", "playful"].some((term) =>
      text.includes(term),
    )
  ) {
    return "Tinggi";
  }
  if (["tenang", "santai", "kalem"].some((term) => text.includes(term))) {
    return "Rendah";
  }
  return "Sedang";
}

function inferCare(
  level: string | null | undefined,
  score: number | null | undefined,
) {
  if (level?.trim()) return level;
  return scoreLabel(score) ?? "Sedang";
}

export function BreedCard({
  id,
  name,
  origin,
  imageSrc,
  shortDescription,
  characteristics,
  careLevel,
  activityLevel,
  activityScore,
  groomingScore,
  profileHref,
  isCompareSelected = false,
  compareDisabled = false,
  onToggleCompare,
  isAuthenticated = false,
  favoriteListTypes = [],
  onFavoriteChange,
}: BreedCardProps) {
  const activity = inferActivity(
    activityLevel,
    activityScore,
    characteristics,
  );
  const care = inferCare(careLevel, groomingScore);

  return (
    <article className="group flex min-h-[500px] flex-col overflow-hidden rounded-[20px] border border-border/75 bg-surface-card shadow-soft card-hover">
      <div className="relative h-56 shrink-0 overflow-hidden bg-soft-gradient">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`Foto ras ${name}`}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px]">pets</span>
            <span className="text-[12px] font-medium">Foto {name}</span>
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col p-5">
        {origin && (
          <div className="mb-2 flex items-center gap-1.5 text-on-surface-variant">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase">{origin}</span>
          </div>
        )}

        <h3 className="font-headline text-[23px] font-bold leading-tight text-ink">
          {name}
        </h3>
        <p className="mt-3 line-clamp-3 min-h-[63px] text-[14px] leading-relaxed text-on-surface-variant">
          {shortDescription || "Informasi karakter sedang dilengkapi."}
        </p>

        <div className="mt-4 flex min-h-[29px] flex-wrap gap-2">
          {characteristics.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-full border border-border/65 bg-muted/55 px-2.5 py-1 text-[10px] font-bold text-on-surface-variant"
            >
              {item}
            </span>
          ))}
        </div>

        <dl className="mt-5 grid grid-cols-2 border-y border-border/65 py-4">
          <div className="border-r border-border/65 pr-4">
            <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-on-surface-variant">
              <Gauge className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
              Aktivitas
            </dt>
            <dd className="mt-1 text-[13px] font-bold text-ink">{activity}</dd>
          </div>
          <div className="pl-4">
            <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-on-surface-variant">
              <Scissors className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Perawatan
            </dt>
            <dd className="mt-1 text-[13px] font-bold text-ink">{care}</dd>
          </div>
        </dl>

        <div className="mt-auto grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <BreedListPicker
              breedId={id}
              breedName={name}
              isAuthenticated={isAuthenticated}
              initialListTypes={favoriteListTypes}
              onChange={onFavoriteChange}
            />
            {onToggleCompare && (
              <button
                type="button"
                onClick={onToggleCompare}
                disabled={compareDisabled && !isCompareSelected}
                aria-pressed={isCompareSelected}
                className={
                  "btn-bounce flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 text-[13px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-55 " +
                  (isCompareSelected
                    ? "border-primary bg-primary/8 text-primary"
                    : "border-border/75 bg-white text-on-surface-variant hover:border-primary/30 hover:text-primary")
                }
              >
                <Scale className="h-4 w-4" aria-hidden="true" />
                {isCompareSelected ? "Dipilih" : "Bandingkan"}
              </button>
            )}
          </div>
          <Link
            href={profileHref}
            className="btn-bounce flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-bold text-white shadow-[0_8px_20px_hsl(var(--primary)/0.18)] hover:bg-primary-container"
            aria-label={`Lihat profil ras ${name}`}
          >
            Lihat Profil Ras
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
