"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Cat, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hydrateAuthenticatedClientState } from "@/lib/client-session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login gagal");
      }

      const session = await hydrateAuthenticatedClientState();
      if (!session) {
        throw new Error("Gagal memuat data pengguna setelah login.");
      }

      const requestedNext = new URLSearchParams(window.location.search).get(
        "next",
      );
      const nextPath =
        requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
          ? requestedNext
          : "/";
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login gagal");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 pb-24 pt-24 sm:px-6 md:pb-12 md:pt-28 lg:px-8">
      <section className="premium-card grid w-full overflow-hidden rounded-[28px] lg:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-[linear-gradient(145deg,hsl(var(--primary)),hsl(var(--primary-container))_65%,hsl(var(--secondary))_145%)] p-7 text-primary-foreground sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <Cat className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-7 font-headline text-3xl font-extrabold leading-tight">
            Masuk ke Rumah Kucing
          </h1>
          <p className="mt-4 text-sm leading-6 text-primary-foreground/85">
            Setelah login, kamu bisa memilih profil kucing seperti Mochi atau
            Nori, melihat timeline, bertanya ke Ketty AI, dan mendapat
            rekomendasi yang personal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-7 sm:p-10">
          <p className="eyebrow normal-case tracking-normal">Selamat datang</p>
          <h2 className="mt-2 font-headline text-2xl font-extrabold">Lanjutkan sesi</h2>
          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-900">{error}</p>
            </div>
          )}
          <div className="mt-6 grid gap-4">
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
              />
            </label>
          </div>
          <Button className="mt-6 w-full" type="submit" disabled={isPending}>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Masuk
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/signup" className="font-bold text-primary">
              Daftar
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
