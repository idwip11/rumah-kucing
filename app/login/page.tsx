"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Cat, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/use-auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login();
    router.push("/");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-130px)] max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-primary p-6 text-primary-foreground sm:p-8">
          <Cat className="h-10 w-10" aria-hidden="true" />
          <h1 className="mt-6 text-3xl font-bold leading-tight">Masuk ke Rumah Kucing</h1>
          <p className="mt-4 text-sm leading-6 text-primary-foreground/85">
            Setelah login, kamu bisa memilih profil kucing seperti Mochi atau Nori, melihat timeline,
            bertanya ke Ketty AI, dan mendapat rekomendasi yang personal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <p className="text-sm font-bold text-primary">Akun demo</p>
          <h2 className="mt-2 text-2xl font-bold">Lanjutkan sesi</h2>
          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="text-sm font-bold">Email</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                defaultValue="imam@example.com"
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
          <Button className="mt-6 w-full" type="submit">
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
