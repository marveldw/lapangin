import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import PartnerHero from "@/components/partner/PartnerHero";
import PartnerFeatures from "@/components/partner/PartnerFeatures";
import PartnerHowItWorks from "@/components/partner/PartnerHowItWorks";
import PartnerPricing from "@/components/partner/PartnerPricing";
import PartnerFaq from "@/components/partner/PartnerFaq";
import PartnerCta from "@/components/partner/PartnerCta";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Partner With Us — Lapangin",
  description: "Platform terpadu untuk pemilik arena futsal, badminton, basket, dan mini soccer. Atur slot jam dan pantau omzet otomatis.",
};

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-white text-[#0b1c30] font-sans">
      <Navbar />
      <main>
        <PartnerHero />
        <PartnerFeatures />
        <PartnerHowItWorks />
        <PartnerPricing />
        <PartnerFaq />
        <PartnerCta />
      </main>
      <Footer />
    </div>
  );
}
