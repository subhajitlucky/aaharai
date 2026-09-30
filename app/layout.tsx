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
          {/* overflow-x-clip (not hidden) contains transient horizontal
              overflow from slide-in animations without creating a scroll
              container, which would break position: sticky. */}
          <main id="main-content" className="flex-1 overflow-x-clip pt-24">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}