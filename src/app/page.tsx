import { Suspense } from "react";
import { AuthRedirectMessage } from "@/components/home/AuthRedirectMessage";
import { HeroSection } from "@/components/home/HeroSection";
import { HomePackages } from "@/components/home/HomePackages";
import { ProgramShowcase } from "@/components/home/ProgramShowcase";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-[#F1F3F5] text-black">
      <SiteHeader />
      <Suspense fallback={null}>
        <AuthRedirectMessage />
      </Suspense>
      <HeroSection />
      <ProgramShowcase />
      <HomePackages />
      <SiteFooter />
    </div>
  );
}
