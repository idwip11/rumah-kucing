import Link from "next/link";
import { Star, ArrowLeft, Heart, Repeat, ZoomIn, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_PRODUCTS = [
  { id: 1, title: "Feeding Kit I - Set Botol Dot Susu Kucing & Anjing", price: "Rp43.000", rating: 0 },
  { id: 2, title: "Captain Cat Dry Food Chicken Tuna Repack 800gr", price: "Rp23.000", rating: 0 },
  { id: 3, title: "Top Growth Milk 1 Box - Susu Pertumbuhan Anak Kucing", price: "Rp52.000", rating: 0 },
  { id: 4, title: "Remov Mother & Baby Vitamin 30 Kapsul - Jaga Kesehatan", price: "Rp17.000", rating: 0 },
  { id: 5, title: "Catto Plus Jelly 70gr - Makanan Basah Anak Kucing", price: "Rp10.500", rating: 0 },
  { id: 6, title: "Catto Indoor Dry Food 1.5kg - Kontrol Hairball", price: "Rp75.000", rating: 4 },
  { id: 7, title: "LOLA & CO Healthy Gut 80gr - Pencernaan Sehat", price: "Rp7.000", rating: 0 },
  { id: 8, title: "LOLA & CO Tuna Kanikama 80gr - Snack Basah", price: "Rp7.000", rating: 0 },
  { id: 9, title: "Whiskas Junior Ocean Fish 1.1kg - Nutrisi Lengkap", price: "Rp65.000", rating: 5 },
  { id: 10, title: "Royal Canin Hair & Skin 2kg", price: "Rp250.000", rating: 5 },
  { id: 11, title: "Me-O Creamy Treats Salmon & Tuna", price: "Rp20.000", rating: 4 },
  { id: 12, title: "Catnip Toy Fish 20cm - Mainan Gigit Interaktif", price: "Rp15.000", rating: 0 },
];

const TAGS = [
  "Makanan Kucing", "Dry Food", "perawatan hewan", "Dry Food Premium",
  "Food/Dry Food/Premium Cat Dry", "Wet Food", "dry", "perawatan kandang",
  "Snack", "Medicines/Obat"
];

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb / Back */}
      <div className="mb-6">
        <Link href="/explore" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Explore
        </Link>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full shrink-0 space-y-8 md:w-64">
          <div>
            <h3 className="mb-4 text-lg font-bold">Filter Harga</h3>
            <div className="space-y-4">
              <div className="relative h-1 w-full rounded-full bg-muted">
                <div className="absolute left-0 h-1 w-full rounded-full bg-blue-500"></div>
                <div className="absolute -ml-2 -mt-1.5 left-0 h-4 w-4 rounded-full border-2 border-blue-500 bg-white shadow"></div>
                <div className="absolute -mr-2 -mt-1.5 right-0 h-4 w-4 rounded-full border-2 border-blue-500 bg-white shadow"></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Harga: Rp4.800 — Rp624.500</span>
                <Button size="sm" variant="default" className="h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600">Saring</Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Brands</h3>
            <select className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-primary">
              <option>Pilih Brand</option>
            </select>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Tag Produk</h3>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  className="rounded-full border border-border bg-transparent px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Top Bar */}
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <select className="cursor-pointer bg-transparent py-1 pl-2 pr-8 text-sm outline-none hover:text-foreground focus:ring-0">
                  <option>Urutkan menurut yang terbaru</option>
                  <option>Urutkan dari termurah</option>
                  <option>Urutkan dari termahal</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Menampilkan 1–12 dari 34 hasil
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {MOCK_PRODUCTS.map((product) => (
              <div key={product.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-md">
                {/* Image Placeholder */}
                <div className="relative aspect-square w-full bg-muted/30 p-4">
                  <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-background text-muted-foreground/40">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                  
                  {/* Hover Actions */}
                  <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm hover:bg-blue-50 hover:text-blue-500">
                      <Heart className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm hover:bg-blue-50 hover:text-blue-500">
                      <Repeat className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm hover:bg-blue-50 hover:text-blue-500">
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 text-lg font-bold text-blue-500">{product.price}</div>
                  <h3 className="mb-2 flex-1 text-sm font-medium leading-snug line-clamp-2 hover:text-blue-500 cursor-pointer">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= product.rating ? "fill-current" : "text-muted"}`} />
                      ))}
                    </div>
                    <span className="ml-1">({product.rating} reviews)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
