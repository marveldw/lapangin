import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import DualRoleSection from "@/components/landing/DualRoleSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import OwnerSection from "@/components/landing/OwnerSection";
import TestimoniSection from "@/components/landing/TestimoniSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

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