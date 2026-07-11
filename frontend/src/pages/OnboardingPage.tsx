// ─── OnboardingPage ─────────────────────────────────────────────────────────
// Replaces: OnboardingScreen.kt (WelcomeScreen)
// High-end cinematic landing page inspired by modern premium design.

import { SmoothScrollProvider } from "../components/welcome/SmoothScroll";
import { Navbar } from "../components/welcome/Navbar";
import { Hero } from "../components/welcome/sections/Hero";
import { Stats } from "../components/welcome/sections/Stats";
import { Features } from "../components/welcome/sections/Features";
import { StickyShowcase } from "../components/welcome/sections/StickyShowcase";
import { ProductShowcase } from "../components/welcome/sections/ProductShowcase";
import { Testimonials } from "../components/welcome/sections/Testimonials";
import { FinalCTA, Footer } from "../components/welcome/sections/FinalCTA";

export default function OnboardingPage() {
  return (
    <SmoothScrollProvider>
      <main className="relative z-10 bg-black min-h-screen text-white font-['Inter'] antialiased overflow-x-hidden">
        {/* Noise Texture Overlay */}
        <div className="noise" />
        
        <Navbar />
        
        <div className="relative z-10">
          <Hero />
          <Stats />
          <Features />
          <StickyShowcase />
          <ProductShowcase />
          <Testimonials />
          <FinalCTA />
          <Footer />
        </div>
      </main>
    </SmoothScrollProvider>
  );
}
