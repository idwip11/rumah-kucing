"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Cat, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/use-auth-store";

export default function SignupPage() {
  const router = useRouter();
  const signup = useAuthStore((state) => state.signup);
  const [name, setName] = useState("Pengguna Baru");
  const [email, setEmail] = useState("user@example.com");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    signup({ userName: name, email });
    router.push("/onboarding");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-130px)] max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-accent p-6 text-accent-foreground sm:p-8">
          <Cat className="h-10 w-10" aria-hidden="true" />
          <h1 className="mt-6 text-3xl font-bold leading-tight">Buat akun pet care</h1>
          <p className="mt-4 text-sm leading-6 text-accent-foreground/90">
            Sign up akan membawa kamu ke onboarding profil kucing pertama. Dari situ rekomendasi
            Ketty AI, produk, dan timeline mulai dipersonalisasi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <p className="text-sm font-bold text-primary">Mulai personalisasi</p>
          <h2 className="mt-2 text-2xl font-bold">Daftar akun baru</h2>
          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="text-sm font-bold">Nama</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold">Email</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold">Password</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                defaultValue="password"
                type="password"
              />
            </label>
          </div>
          <Button className="mt-6 w-full" type="submit" variant="warm">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Daftar
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-primary">
              Masuk
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
