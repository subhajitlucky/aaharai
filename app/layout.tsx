import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { clsx } from "clsx";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aaharai | Ancient Wisdom, Modern Health",
  description: "Reclaim your health with ancient Indian culinary wisdom personalized by AI.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={clsx(geistSans.variable, geistMono.variable)}>
      <body className="antialiased min-h-screen flex flex-col selection:bg-clay selection:text-white bg-sand text-charcoal">
        <Providers>
          <Navbar />
          <main className="flex-1 pt-24">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}