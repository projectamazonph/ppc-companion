import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import NavBar from "@/components/landing/NavBar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemStrip from "@/components/landing/ProblemStrip";
import ResultsBanner from "@/components/landing/ResultsBanner";
import PricingSection from "@/components/landing/PricingSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingFooter from "@/components/landing/LandingFooter";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
});

export const metadata = {
  title: "ProjectAmazonPH — Simulan Mo Na",
  description:
    "14 taon ng karanasan sa Amazon Ads. Simulan mo na ang Amazon PPC journey mo ngayon — ₱2,999 lang.",
};

export default function ProjectAmazonPHPage() {
  return (
    <>
      <Script
        src="https://unpkg.com/@phosphor-icons/web@2.1.1/src/index.js"
        strategy="afterInteractive"
      />
      <main className={`${spaceGrotesk.variable} ${plusJakarta.variable}`}>
        <NavBar />
        <HeroSection />
        <ProblemStrip />
        <ResultsBanner />
        <PricingSection />
        <SocialProofSection />
        <FAQSection />
        <FinalCTA />
        <LandingFooter />
      </main>
    </>
  );
}
