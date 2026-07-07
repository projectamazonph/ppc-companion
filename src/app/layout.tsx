import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const BASE_URL = "https://ppc-companion.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "PPC Companion — Amazon PPC Manager Training Platform",
    template: "%s | PPC Companion",
  },
  description: "Interactive training platform for the 8-12 week Amazon PPC Manager program. Learn campaign management, keyword research, and analytics from industry experts.",
  keywords: [
    "Amazon PPC",
    "PPC Manager Training",
    "Amazon Ads",
    "PPC Course",
    "E-commerce Advertising",
    "Campaign Management",
    "ppc-companion",
  ],
  authors: [{ name: "Ryan Dabao", url: "https://projectamazonph.com" }],
  creator: "ProjectAmazonPH",
  publisher: "ProjectAmazonPH",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32" },
      { url: "/icons/icon-192.png", sizes: "192x192" },
      { url: "/icons/icon-512.png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/icon-180.png", sizes: "180x180" },
    ],
    other: [
      { url: "/og/ppc-og.png", rel: "preload", as: "image" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PPC Companion",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "PPC Companion",
    title: "PPC Companion — Amazon PPC Manager Training Platform",
    description: "Interactive training platform for the 8-12 week Amazon PPC Manager program. Built by ProjectAmazonPH.",
    images: [
      {
        url: "/og/ppc-og.png",
        width: 1200,
        height: 630,
        alt: "PPC Companion — Amazon PPC Manager Training Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PPC Companion — Amazon PPC Manager Training",
    description: "Interactive training platform for the Amazon PPC Manager program. Built by ProjectAmazonPH.",
    site: "@ProjectAmazonPH",
    creator: "@ProjectAmazonPH",
    images: [
      {
        url: "/og/ppc-og.png",
        width: 1200,
        height: 630,
        alt: "PPC Companion — Amazon PPC Manager Training Platform",
      },
    ],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PPC Companion",
  description: "Interactive training platform for the Amazon PPC Manager program.",
  url: BASE_URL,
  applicationCategory: "EducationApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/OnlineOnly",
  },
  provider: {
    "@type": "Organization",
    name: "ProjectAmazonPH",
    url: "https://projectamazonph.com",
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/logo.svg`,
    },
  },
  creator: {
    "@type": "Person",
    name: "Ryan Dabao",
    jobTitle: "Amazon PPC Lead Manager",
    url: "https://projectamazonph.com",
  },
  brand: {
    "@type": "Brand",
    name: "PPC Companion",
    color: "#007EFF",
  },
  screenshot: `${BASE_URL}/og/ppc-og.png`,
  softwareVersion: "0.5.0",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "127",
    bestRating: "5",
    worstRating: "1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="grain-overlay" />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
