"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";
import { useAuthStore } from "@/store/use-auth-store";
import { Button } from "@/components/ui/button";

type AddToCartButtonProps = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  className?: string;
  variant?: "default" | "outline";
};

export function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
  className,
  variant = "outline",
}: AddToCartButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  function handleClick() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    addItem({ id: productId, name, price, imageUrl });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      variant={variant}
      className={className}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          Ditambahkan
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          Taruh Keranjang
        </>
      )}
    </Button>
  );
}
