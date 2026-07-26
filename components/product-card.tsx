import { AddToCartButton } from "@/components/add-to-cart-button";
import {
  AlertTriangle,
  CheckCircle2,
  ImageIcon,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type ProductCardProps = {
  id: string;
  name: string;
  category: string;
  reason: string;
  price: string;
  priceIdr: number;
  badge: string;
  imageUrl?: string | null;
  href?: string;
  matchLabel?: string;
  matchCatName?: string;
  matchReasons?: string[];
  matchCautions?: string[];
  safetyWarning?: string;
};

export function ProductCard({
  id,
  name,
  category,
  reason,
  price,
  priceIdr,
  badge,
  imageUrl,
  href,
  matchLabel,
  matchCatName,
  matchReasons,
  matchCautions,
  safetyWarning,
}: ProductCardProps) {
  const isPersonalized = Boolean(matchLabel && matchCatName);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-border/75 bg-card shadow-soft card-hover">
      {href && (
        <Link
          href={href}
          className="absolute inset-0 z-[1]"
          aria-label={`Lihat detail ${name}`}
        />
      )}
      <div className="pointer-events-none relative z-[2] aspect-[16/10] overflow-hidden bg-soft-gradient">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary/40">
            <ImageIcon className="h-9 w-9" aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/65 bg-white/88 px-3 py-1.5 text-[11px] font-bold text-secondary shadow-sm backdrop-blur-md">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          {matchLabel && matchCatName
            ? `${matchLabel} untuk ${matchCatName}`
            : badge}
        </span>
      </div>
      <div className="pointer-events-none relative z-[2] flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              {category ?? "Produk"}
            </p>
            <h3 className="mt-1.5 font-headline text-base font-extrabold leading-snug text-foreground">
              {name}
            </h3>
          </div>
          <p className="shrink-0 text-sm font-extrabold text-primary">{price}</p>
        </div>
        {isPersonalized && matchReasons && matchReasons.length > 0 ? (
          <div className="mt-3 flex-1">
            <p className="text-xs font-bold text-foreground">
              {matchLabel === "Kurang sesuai" ||
              matchLabel === "Tidak direkomendasikan"
                ? "Dasar penilaian"
                : `Mengapa cocok untuk ${matchCatName}?`}
            </p>
            <ul className="mt-2 space-y-1.5">
              {matchReasons.slice(0, 2).map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-xs leading-5 text-muted-foreground"
                >
                  <CheckCircle2
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
            {reason}
          </p>
        )}

        {isPersonalized && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              Perlu diperhatikan
            </p>
            <p className="mt-1 text-[11px] leading-5 text-amber-900/80">
              {matchCautions && matchCautions.length > 0
                ? matchCautions[0]
                : "Tidak ada batasan khusus yang tercatat. Ikuti petunjuk penggunaan pada kemasan."}
            </p>
          </div>
        )}

        {isPersonalized && safetyWarning && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-rose-900">
            <p className="flex items-center gap-1.5 text-[11px] font-bold">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Konsultasikan dengan dokter hewan
            </p>
            <p className="mt-1 text-[11px] leading-5 text-rose-900/80">
              {safetyWarning}
            </p>
          </div>
        )}
        <AddToCartButton
          productId={id}
          name={name}
          price={priceIdr}
          imageUrl={imageUrl}
          className="pointer-events-auto relative z-[3] mt-4 w-full"
        />
      </div>
    </article>
  );
}
