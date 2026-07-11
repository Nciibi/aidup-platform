import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { Features } from "@/components/sections/Features";
import { StickyShowcase } from "@/components/sections/StickyShowcase";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { Testimonials } from "@/components/sections/Testimonials";
import { FinalCTA, Footer } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <main className="relative bg-black">
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
  );
}
