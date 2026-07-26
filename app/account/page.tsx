"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedBreedsSection } from "@/components/saved-breeds-section";
import { useAuthStore } from "@/store/use-auth-store";

export default function AccountPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userName = useAuthStore((state) => state.userName);
  const email = useAuthStore((state) => state.email);
  const phone = useAuthStore((state) => state.phone);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [form, setForm] = useState({
    userName,
    email,
    phone,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (isAuthenticated) return;

      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });
        const data = await response.json().catch(() => null);
        if (!cancelled && !data?.user) {
          router.replace("/login?next=%2Faccount");
        }
      } catch (error) {
        console.error("Failed to verify account session:", error);
      }
    }

    verifySession();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, router]);

  useEffect(() => {
    setForm({ userName, email, phone });
  }, [email, phone, userName]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateProfile(form);
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-24 sm:px-6 md:pb-16 md:pt-28 lg:px-8">
      <Link href="/">
        <Button variant="ghost" className="mb-4 px-0 text-primary hover:bg-transparent">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke dashboard
        </Button>
      </Link>

      <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="soft-panel rounded-[24px] p-6 shadow-soft">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
            <UserRound className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-headline text-3xl font-extrabold text-gradient-brand">Akun Saya</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Nama di bagian header berasal dari profil akun user. Data ini berbeda dari profil kucing
            seperti Mochi atau Nori.
          </p>
          <div className="mt-5 rounded-2xl border border-white/70 bg-white/65 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Dipakai untuk
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sapaan aplikasi, histori transaksi, konsultasi adopt/beli, dan kontak follow-up
              petshop.
            </p>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="premium-card rounded-[24px] p-6">
          <div>
            <p className="text-sm font-bold text-primary">Profil pengguna</p>
            <h2 className="mt-1 text-2xl font-bold">Edit identitas akun</h2>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="text-sm font-bold">Nama pengguna</span>
              <span className="mt-2 flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                <UserRound className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  value={form.userName}
                  onChange={(event) => updateField("userName", event.target.value)}
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-bold">Email</span>
              <span className="mt-2 flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  type="email"
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-bold">Nomor WhatsApp</span>
              <span className="mt-2 flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </span>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button type="submit">
              <Save className="h-4 w-4" aria-hidden="true" />
              Simpan perubahan
            </Button>
            {saved && <p className="text-sm font-bold text-primary">Perubahan tersimpan.</p>}
          </div>
        </form>
      </section>

      <SavedBreedsSection />
    </div>
  );
}
