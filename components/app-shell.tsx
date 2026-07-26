"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Cat,
  Home,
  Library,
  LogOut,
  Menu,
  NotebookTabs,
  PawPrint,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  clearAuthenticatedClientState,
  hydrateAuthenticatedClientState,
} from "@/lib/client-session";
import { GlobalSearchDialog } from "@/components/global-search-dialog";
import { useAuthStore } from "@/store/use-auth-store";
import { useCatStore, type CatProfile } from "@/store/use-cat-store";
import { useCartStore } from "@/store/use-cart-store";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/chat", label: "Ketty AI", icon: Bot },
  { href: "/timeline", label: "Timeline", icon: NotebookTabs },
  { href: "/breeds", label: "Ras Kucing", icon: PawPrint },
  { href: "/explore", label: "Explore", icon: Library },
];

type InitialUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

export function AppShell({
  children,
  initialUser,
  initialCats = [],
}: {
  children: React.ReactNode;
  initialUser?: InitialUser | null;
  initialCats?: CatProfile[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.userId);
  const userName = useAuthStore((state) => state.userName);
  const login = useAuthStore((state) => state.login);
  const setCats = useCatStore((state) => state.setCats);
  const cartCount = useCartStore((state) => state.totalItems());
  const loadCartForUser = useCartStore((state) => state.loadForUser);
  const [isMounted, setIsMounted] = useState(false);
  const [hasCheckedSession, setHasCheckedSession] = useState(
    Boolean(initialUser),
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const effectiveIsAuthenticated = isAuthenticated || Boolean(initialUser);
  const effectiveUserName = userName || initialUser?.name || "";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!initialUser) return;

    login({
      userId: initialUser.id,
      userName: initialUser.name,
      email: initialUser.email,
      phone: initialUser.phone ?? "",
    });

    if (initialCats.length > 0) {
      setCats(initialCats);
    }

    loadCartForUser(initialUser.id);
  }, [initialCats, initialUser, loadCartForUser, login, setCats]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed", error);
    }
    // Clear cat profiles so the next user starts with a clean slate
    clearAuthenticatedClientState();
    router.push("/login");
    router.refresh();
  }

  // Reload user data whenever authentication state changes.
  useEffect(() => {
    let isCancelled = false;

    async function hydrateUserData() {
      try {
        const result = await hydrateAuthenticatedClientState();

        if (isCancelled || result) return;

        if (!effectiveIsAuthenticated) {
          setCats([]);
        }
      } catch (error) {
        console.error("Failed to fetch current user", error);
      } finally {
        if (!isCancelled) {
          setHasCheckedSession(true);
        }
      }
    }

    hydrateUserData();

    return () => {
      isCancelled = true;
    };
  }, [effectiveIsAuthenticated, pathname, setCats, userId]);

  const isSessionUnknown = !hasCheckedSession && !effectiveIsAuthenticated;
  const visibleCartCount = effectiveIsAuthenticated ? cartCount : 0;
  const shouldShowCartBadge =
    isMounted && (visibleCartCount > 0 || !effectiveIsAuthenticated);

  const filteredNavItems = navItems.filter(
    (item) =>
      effectiveIsAuthenticated ||
      isSessionUnknown ||
      !["Dashboard", "Ketty AI", "Timeline"].includes(item.label),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop Header */}
      <header className="fixed top-0 z-40 hidden h-20 w-full items-center border-b border-white/70 bg-white/82 shadow-[0_1px_18px_hsl(var(--secondary)/0.06)] backdrop-blur-xl md:flex md:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between">
          <div className="flex min-w-0 items-center gap-5 lg:gap-8">
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2.5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-[0_8px_20px_hsl(var(--primary)/0.2)] transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105">
                <Cat className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-headline text-[21px] font-extrabold text-primary">
                Rumah Kucing
              </span>
            </Link>

            <nav
              className="flex min-w-0 items-center gap-1"
              aria-label="Navigasi utama"
            >
              {filteredNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    href={item.href}
                    key={item.href}
                    className={cn(
                      "flex h-11 items-center gap-2 rounded-xl px-3 text-[14px] font-semibold transition-all duration-200 lg:px-4",
                      isActive
                        ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.07)]"
                        : "text-on-surface-variant hover:bg-rose/35 hover:text-primary",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isActive && "scale-110",
                      )}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-border/65 bg-white/75 text-on-surface-variant shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 hover:text-primary md:flex"
              aria-label="Cari di Rumah Kucing"
              title="Cari"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            <Link
              href="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-border/65 bg-white/75 text-on-surface-variant shadow-sm transition-all hover:-translate-y-0.5 hover:border-secondary/25 hover:bg-secondary/5 hover:text-secondary"
              aria-label="Keranjang belanja"
              title="Keranjang"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {shouldShowCartBadge && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {visibleCartCount}
                </span>
              )}
            </Link>

            {isSessionUnknown ? (
              <div
                className="ml-1 h-11 w-[154px] rounded-xl bg-muted/70"
                aria-label="Memuat sesi"
              />
            ) : effectiveIsAuthenticated ? (
              <>
                <Link
                  href="/account"
                  className="ml-1 flex h-11 max-w-[132px] items-center gap-2 rounded-xl px-3 text-[14px] font-semibold text-on-surface-variant transition-colors hover:bg-primary/7 hover:text-primary"
                >
                  <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {effectiveUserName || "Profil"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex h-11 items-center gap-2 rounded-xl px-3 text-[14px] font-semibold text-on-surface-variant transition-colors hover:bg-destructive/8 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[15px] font-semibold text-on-surface-variant hover:text-primary transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/signup"
                  className="text-[15px] font-semibold text-primary hover:text-primary-container transition-colors"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="fixed top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/70 bg-white/88 px-4 shadow-[0_1px_16px_hsl(var(--secondary)/0.06)] backdrop-blur-xl md:hidden">
        <Link
          href="/"
          className="flex items-center gap-2 font-headline text-[18px] font-extrabold text-primary"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm">
            <Cat className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <span>Rumah Kucing</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-white/80 text-primary shadow-sm transition-colors hover:bg-primary/5"
            aria-label="Cari di Rumah Kucing"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-white/80 text-secondary shadow-sm transition-colors hover:bg-secondary/5"
            aria-label="Keranjang belanja"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {shouldShowCartBadge && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {visibleCartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-primary/8"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div
        className={cn(
          "fixed right-0 top-0 z-40 flex h-full w-[min(84vw,320px)] transform flex-col border-l border-white/70 bg-white/95 shadow-floating backdrop-blur-xl transition-transform duration-300 ease-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <span className="font-headline text-[18px] font-bold text-primary">
            Menu
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#f0eee9] transition-colors"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <nav className="flex flex-col py-4">
          {filteredNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                href={item.href}
                key={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "mx-3 flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-all",
                  isActive
                    ? "bg-brand-gradient text-white shadow-[0_8px_20px_hsl(var(--primary)/0.18)]"
                    : "text-foreground hover:bg-rose/35 hover:text-primary",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border px-5 py-4">
          {isSessionUnknown ? (
            <div
              className="h-11 rounded-xl bg-muted/70"
              aria-label="Memuat sesi"
            />
          ) : effectiveIsAuthenticated ? (
            <>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium text-foreground hover:bg-[#f0eee9]"
              >
                <span className="material-symbols-outlined text-[20px]">
                  person
                </span>
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium text-foreground hover:bg-[#f0eee9]"
              >
                <span className="material-symbols-outlined text-[20px]">
                  login
                </span>
                Masuk
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-[14px] font-semibold text-white"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-[68px] w-full items-center justify-around border-t border-white/70 bg-white/90 px-1 shadow-[0_-8px_28px_hsl(var(--secondary)/0.07)] backdrop-blur-xl md:hidden safe-bottom">
        {filteredNavItems.slice(0, 5).map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "relative flex min-w-14 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-all",
                isActive
                  ? "bg-primary/9 text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110",
                )}
              />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="md:pt-0 pt-16 pb-16 md:pb-0">{children}</main>
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
