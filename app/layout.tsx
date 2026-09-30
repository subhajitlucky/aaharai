import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { clsx } from "clsx";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: "Aaharai | Ancient Wisdom, Modern Health",
    template: "%s | Aaharai",
  },
  description:
    "Reclaim your health with ancient Indian culinary wisdom personalized by AI.",
  manifest: "/manifest.json",
  applicationName: "Aaharai",
  openGraph: {
    type: "website",
    siteName: "Aaharai",
    title: "Aaharai | Ancient Wisdom, Modern Health",
    description:
      "An Ayurvedic AI assistant pairing classical principles with a curated, source-cited atlas of regional Indian food.",
    url: siteUrl,
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Aaharai" }],
  },
  twitter: {
    card: "summary",
    title: "Aaharai | Ancient Wisdom, Modern Health",
    description:
      "An Ayurvedic AI assistant pairing classical principles with a curated, source-cited atlas of regional Indian food.",
    images: ["/icon-512.png"],
  },
  robots: { index: true, follow: true },
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
          <Footer />
        </Providers>
      </body>
    </html>
  );
}