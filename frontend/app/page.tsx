import dynamic from "next/dynamic";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";

// Lazy loaded below-the-fold sections
const DualRoleSection = dynamic(() => import("@/components/landing/DualRoleSection"));
const HowItWorksSection = dynamic(() => import("@/components/landing/HowItWorksSection"));
const OwnerSection = dynamic(() => import("@/components/landing/OwnerSection"));
const TestimoniSection = dynamic(() => import("@/components/landing/TestimoniSection"));
const FaqSection = dynamic(() => import("@/components/landing/FaqSection"));
const CtaSection = dynamic(() => import("@/components/landing/CtaSection"));
const Footer = dynamic(() => import("@/components/landing/Footer"));

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#0b1c30] font-sans">
      <Navbar />
      <HeroSection />
      <DualRoleSection />
      <HowItWorksSection />
      <OwnerSection />
      <TestimoniSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}