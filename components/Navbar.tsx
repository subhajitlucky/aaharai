"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Leaf, Search, User, BarChart3, LogOut, LayoutDashboard, Sunrise, Camera, Stethoscope, BookOpen } from "lucide-react";
import { clsx } from "clsx";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

const navItems = [
  { name: "Prakriti Quiz", href: "/prakriti-test", icon: BarChart3 },
  { name: "Daily Rituals", href: "/dinacharya", icon: Sunrise },
  { name: "Satvik Scanner", href: "/scanner", icon: Camera },
  { name: "Junk Swapper", href: "/swapper", icon: Search },
  { name: "Remedies", href: "/nuskhe", icon: Stethoscope },
  { name: "Ancient Library", href: "/library", icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 px-4">
      <div className="max-w-5xl mx-auto glass-panel rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-charcoal/5">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-clay rounded-lg flex items-center justify-center text-white transition-transform group-hover:rotate-12">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-charcoal tracking-tight">
            Aahar<span className="text-clay">ai</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm font-medium transition-colors hover:text-clay flex items-center gap-2",
                  isActive ? "text-clay" : "text-charcoal/60"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
          {session && (
            <Link 
              href="/dashboard"
              className={clsx(
                "text-sm font-medium transition-colors hover:text-clay flex items-center gap-2",
                pathname === "/dashboard" ? "text-clay" : "text-charcoal/60"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-charcoal/5 animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => signOut()}
                className="hidden sm:flex items-center gap-2 text-charcoal/40 hover:text-clay text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
              <div className="w-10 h-10 rounded-full border-2 border-clay p-0.5 overflow-hidden">
                {session.user?.image ? (
                  <Image 
                    src={session.user.image} 
                    alt="User" 
                    width={40} 
                    height={40} 
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-sand flex items-center justify-center text-charcoal/40">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button 
              onClick={() => signIn("google")}
              className="flex items-center gap-2 bg-charcoal text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-charcoal/90 transition-all active:scale-95 shadow-lg shadow-charcoal/20"
            >
              <User className="w-4 h-4" />
              <span>Get Started</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
