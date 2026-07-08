import Image from "next/image";
import { BadgeDollarSign, CheckCircle2, HeartHandshake, MapPin, Utensils, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";

type BreedCardProps = {
  name: string;
  origin: string;
  imageSrc: string;
  imageAlt: string;
  profile: string;
  characteristics: string[];
  foodType: string;
  kittenPrice: string;
  monthlyCare: string;
  careLevel: string;
  availability: string;
  match: string;
};

export function BreedCard({
  name,
  origin,
  imageSrc,
  imageAlt,
  profile,
  characteristics,
  foodType,
  kittenPrice,
  monthlyCare,
  careLevel,
  availability,
  match
}: BreedCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="relative aspect-[16/9] w-full bg-muted">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1280px) 31vw, (min-width: 1024px) 46vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {origin}
            </p>
            <h2 className="mt-2 text-xl font-bold leading-tight">{name}</h2>
          </div>
          <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-bold text-teal-800">
            {careLevel}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">{profile}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {characteristics.map((item) => (
            <span key={item} className="rounded-md bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">
              {item}
            </span>
          ))}
        </div>

        <div className="mt-5 grid gap-3">
          <InfoRow icon={Utensils} label="Cat food cocok" value={foodType} />
          <InfoRow icon={BadgeDollarSign} label="Estimasi harga" value={kittenPrice} />
          <InfoRow icon={WalletCards} label="Estimasi biaya perawatan bulanan" value={monthlyCare} />
          <InfoRow icon={CheckCircle2} label="Cocok untuk" value={match} />
        </div>

        <div className="mt-5 flex flex-1 flex-col justify-end gap-3 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-primary">Minat {name}?</span>
            <span className="text-xs text-muted-foreground">Estimasi awal</span>
          </div>
          <Button className="w-full" variant="warm">
            <HeartHandshake className="h-4 w-4" aria-hidden="true" />
            Tanya adopt / beli
          </Button>
        </div>
      </div>
    </article>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Utensils;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[32px_1fr] gap-3 rounded-md bg-muted p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-background text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-xs font-bold text-muted-foreground">{label}</span>
        <span className="mt-1 block text-sm font-semibold leading-5">{value}</span>
      </span>
    </div>
  );
}
