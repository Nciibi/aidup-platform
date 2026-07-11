"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function StickyShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const pinDistance = 3000;
      
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${pinDistance}`,
        pin: true,
        scrub: 1,
      });

      const items = gsap.utils.toArray(".showcase-item");
      items.forEach((item: any, i: number) => {
        gsap.fromTo(item, 
          { opacity: 0, y: 100, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `top+=${(i * pinDistance) / (items.length / 2)} top`,
              end: `top+=${((i + 1) * pinDistance) / (items.length / 2)} top`,
              scrub: 1,
            }
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  const showcaseData = [
    { title: "Public Ledger", desc: "Every transaction is recorded on an immutable ledger, ensuring total financial accountability.", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2064" },
    { title: "Direct Proof", desc: "Receive photographic and GPS evidence the moment your contribution reaches its destination.", image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070" },
    { title: "Ethical Vetting", desc: "Our proprietary AI and field team audit every organization to ensure 100% ethical integrity.", image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070" },
  ];

  return (
    <section ref={sectionRef} className="h-screen bg-black overflow-hidden flex items-center justify-center">
      <div ref={containerRef} className="max-w-7xl w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="relative h-[600px] w-full">
          {showcaseData.map((data, i) => (
            <div 
              key={i}
              className="showcase-item absolute inset-0 flex flex-col justify-center"
            >
              <h2 className="text-7xl font-display font-black tracking-tighter mb-6 leading-tight">
                {data.title.split(' ')[0]} <br />
                <span className="text-orange-500">{data.title.split(' ')[1]}</span>
              </h2>
              <p className="text-xl text-white/40 max-w-sm leading-relaxed">{data.desc}</p>
            </div>
          ))}
        </div>

        <div className="relative h-[600px] w-full rounded-[3rem] overflow-hidden border border-white/10 glass">
          {showcaseData.map((data, i) => (
            <div 
              key={i}
              className="showcase-item absolute inset-0"
            >
              <img 
                src={data.image} 
                alt={data.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
