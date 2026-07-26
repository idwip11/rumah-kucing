"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";
import { useAuthStore } from "@/store/use-auth-store";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/app/actions/orders";

const WHATSAPP_NUMBER = "62895418179797";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function buildWhatsAppMessage(
  items: { name: string; price: number; quantity: number }[],
  totalPrice: number,
) {
  const lines = items.map(
    (item, i) =>
      `${i + 1}. ${item.name}\n   ${item.quantity} x ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}`,
  );
  return (
    "Halo, saya ingin memesan produk berikut:\n\n" +
    lines.join("\n") +
    `\n\nTotal: ${formatPrice(totalPrice)}\n\nTerima kasih.`
  );
}

export default function CartPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const items = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalPrice = useCartStore((state) => state.totalPrice());
  const totalItems = useCartStore((state) => state.totalItems());

  async function handleCheckout() {
    if (items.length === 0) return;
    // 1. Persist the order in the database (linked to the user) BEFORE
    //    redirecting, so no transaction is lost even if WhatsApp is abandoned.
    try {
      await createOrder(
        items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      );
    } catch (error) {
      console.error("Gagal menyimpan pesanan:", error);
    }
    // 2. Open the pre-filled WhatsApp message.
    const message = buildWhatsAppMessage(items, totalPrice);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 md:pb-16 md:pt-28 lg:px-8">
      <h1 className="mb-5 font-headline text-2xl font-extrabold text-gradient-brand sm:mb-6 sm:text-3xl">
        Keranjang
      </h1>

      {!isAuthenticated || items.length === 0 ? (
        <div className="premium-card rounded-[24px] p-7 text-center sm:p-10">
          <div className="mx-auto mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Keranjang belanja masih kosong.
          </p>
          <Link
            href="/explore/products"
            className="mt-4 inline-block text-sm font-bold text-primary hover:underline touch-target-min"
          >
            Lihat produk →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-[1fr_300px]">
          {/* Items */}
          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="premium-card card-hover grid grid-cols-[56px_minmax(0,1fr)] gap-3 rounded-[20px] p-3 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-4 sm:p-4"
              >
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/30 text-muted-foreground/40">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </div>

                <div className="min-w-0">
                  <Link
                    href={`/explore/products/${item.id}`}
                    className="block whitespace-normal break-words text-sm font-bold leading-5 text-foreground hover:text-primary sm:text-[15px]"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm font-bold text-secondary sm:mt-1.5">
                    {formatPrice(item.price)}
                  </p>

                  <div className="mt-3 flex items-center justify-end gap-3 sm:mt-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border hover:bg-muted touch-target-min sm:h-9 sm:w-9"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      <span className="w-6 shrink-0 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border hover:bg-muted touch-target-min sm:h-9 sm:w-9"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="shrink-0 p-1 text-muted-foreground hover:text-red-500 touch-target-min"
                      aria-label="Hapus dari keranjang"
                    >
                      <Trash2 className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary - full width on mobile, sidebar on desktop */}
          <div className="md:order-first order-last rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6">
            <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold">
              Ringkasan
            </h2>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total item</span>
              <span>{totalItems}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-3 sm:pt-4 text-base font-bold">
              <span>Total</span>
              <span className="text-secondary">{formatPrice(totalPrice)}</span>
            </div>
            <Button
              className="mt-5 sm:mt-6 w-full touch-target-min"
              variant="default"
              onClick={handleCheckout}
            >
              Lanjut ke Pembayaran
            </Button>
            <Link
              href="/explore/products"
              className="mt-3 block text-center text-sm font-bold text-primary hover:underline touch-target-min"
            >
              Lanjut belanja
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
