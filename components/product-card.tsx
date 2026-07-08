import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProductCardProps = {
  name: string;
  category: string;
  reason: string;
  price: string;
  badge: string;
};

export function ProductCard({ name, category, reason, price, badge }: ProductCardProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">
            {badge}
          </span>
          <h3 className="mt-3 text-base font-bold">{name}</h3>
          <p className="text-sm text-muted-foreground">{category}</p>
        </div>
        <p className="shrink-0 text-sm font-bold text-primary">{price}</p>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{reason}</p>
      <Button className="mt-4 w-full" variant="outline">
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        Simpan rekomendasi
      </Button>
    </article>
  );
}
