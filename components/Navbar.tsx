"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Leaf,
  User,
  LogOut,
  LayoutDashboard,
  Sunrise,
  Camera,
  Stethoscope,
  BookOpen,
  CookingPot,
  BarChart3,
  Search,
  Menu,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { name: "Prakriti Quiz", href: "/prakriti-test", icon: BarChart3 },
  { name: "Daily Rituals", href: "/dinacharya", icon: Sunrise },
  { name: "Satvik Scanner", href: "/scanner", icon: Camera },
  { name: "Junk Swapper", href: "/swapper", icon: Search },
  { name: "Remedies", href: "/nuskhe", icon: Stethoscope },
  { name: "Recipes", href: "/recipes", icon: CookingPot },
  { name: "Ancient Library", href: "/library", icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close on navigation is handled per-link via onClick rather than in an
  // effect, so the menu never triggers a cascading render on route change.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Tabbing past the last item should not leak into the page behind the panel.
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const panel = panelRef.current;
    const onFocus = (e: FocusEvent) => {
      if (!panel.contains(e.target as Node)) {
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, [open]);

  const linkClass = (active: boolean) =>
    clsx(
      "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-clay/10 text-clay"
        : "text-charcoal/70 hover:bg-charcoal/5 hover:text-charcoal",
    );

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="glass-panel flex items-center justify-between gap-3 rounded-full py-2.5 pl-3 pr-3 shadow-xl shadow-charcoal/5 sm:pl-5 sm:pr-5">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-full"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-clay text-white transition-transform group-hover:rotate-12">
              <Leaf className="h-5 w-5" aria-hidden />
            </div>
            <span className="text-lg font-bold tracking-tight text-charcoal sm:text-xl">
              Aahar<span className="text-clay">ai</span>
            </span>
          </Link>

          {/* Desktop links. The row is ~1100px wide with all seven items, so
              it is only shown from xl (1280px) up; below that the panel
              menu is used, which carries the icons and full labels. */}
          <ul className="hidden items-center xl:flex">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={linkClass(pathname === item.href)}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              </li>
            ))}
            {session && (
              <li>
                <Link
                  href="/dashboard"
                  className={linkClass(pathname === "/dashboard")}
                  aria-current={
                    pathname === "/dashboard" ? "page" : undefined
                  }
                >
                  <span className="whitespace-nowrap">Dashboard</span>
                </Link>
              </li>
            )}
          </ul>

          {/* Auth + menu toggle */}
          <div className="flex shrink-0 items-center gap-2">
            {status === "loading" ? (
              <div
                className="h-8 w-8 animate-pulse rounded-full bg-charcoal/5"
                aria-hidden
              />
            ) : session ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="hidden items-center gap-2 rounded-full px-2 py-2 text-sm font-medium text-charcoal/60 transition-colors hover:text-clay sm:flex"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Sign Out
                </button>
                <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-clay p-0.5">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Your profile picture"
                      width={36}
                      height={36}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-sand text-charcoal/40">
                      <User className="h-5 w-5" aria-hidden />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signIn("google")}
                className="flex items-center gap-2 rounded-full bg-charcoal px-3 py-2 text-sm font-medium text-white shadow-lg shadow-charcoal/20 transition-all hover:bg-charcoal/90 active:scale-95 sm:px-5 sm:py-2.5"
              >
                <User className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </button>
            )}

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal/70 transition-colors hover:bg-charcoal/5 xl:hidden"
            >
              {open ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </div>

        {/* Mobile / tablet menu */}
        {open && (
          <div
            id="mobile-menu"
            ref={panelRef}
            className="glass-panel mt-2 overflow-hidden rounded-3xl p-2 shadow-xl shadow-charcoal/5 xl:hidden"
          >
            <ul className="flex flex-col">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      linkClass(pathname === item.href),
                      "min-h-11 px-4 py-2.5 text-[15px]",
                    )}
                    aria-current={
                      pathname === item.href ? "page" : undefined
                    }
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
              {session && (
                <li>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className={clsx(
                      linkClass(pathname === "/dashboard"),
                      "min-h-11 px-4 py-2.5 text-[15px]",
                    )}
                    aria-current={
                      pathname === "/dashboard" ? "page" : undefined
                    }
                  >
                    <LayoutDashboard
                      className="h-[18px] w-[18px] shrink-0"
                      aria-hidden
                    />
                    <span>Dashboard</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
