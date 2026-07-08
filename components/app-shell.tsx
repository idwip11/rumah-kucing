"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bot, Cat, Home, Library, LogOut, NotebookTabs, PawPrint, Plus, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/use-auth-store";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/chat", label: "Ketty AI", icon: Bot },
  { href: "/timeline", label: "Timeline", icon: NotebookTabs },
  { href: "/breeds", label: "Ras Kucing", icon: PawPrint },
  { href: "/explore", label: "Explore", icon: Library }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userName = useAuthStore((state) => state.userName);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const filteredNavItems = navItems.filter(
    (item) =>
      isAuthenticated || !["Dashboard", "Ketty AI", "Timeline"].includes(item.label)
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/98 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Cat className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-bold leading-tight">Rumah Kucing</span>
              <span className="block text-xs text-muted-foreground">Care, memory, needs</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-foreground/75 transition hover:bg-muted hover:text-foreground",
                    isActive && "bg-muted text-foreground shadow-sm"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/account"
                  className="hidden h-9 items-center gap-2 rounded-md bg-muted px-3 text-sm font-semibold text-foreground transition hover:bg-secondary lg:inline-flex"
                  aria-label="Buka pengaturan akun"
                >
                  <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
                  {userName}
                </Link>
                <Link href="/onboarding">
                  <Button size="sm">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Profil Kucing
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button size="sm" variant="outline">
                    Masuk
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Daftar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
        <nav className="grid grid-cols-5 border-t border-border md:hidden" aria-label="Navigasi mobile">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                href={item.href}
                key={item.href}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-foreground/75",
                  isActive && "bg-muted text-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
