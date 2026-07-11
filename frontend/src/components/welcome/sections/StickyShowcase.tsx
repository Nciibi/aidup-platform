import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../../lib/gsap";

export function StickyShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const pinDistance = 3000;
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${pinDistance}`,
          pin: true,
          scrub: 1,
        }
      });

      const leftItems = gsap.utils.toArray(".showcase-left", containerRef.current);
      const rightItems = gsap.utils.toArray(".showcase-right", containerRef.current);

      // Explicitly set initial states
      leftItems.forEach((item: any, i: number) => {
        if (i !== 0) gsap.set(item, { opacity: 0, y: 100 });
      });
      rightItems.forEach((item: any, i: number) => {
        if (i !== 0) gsap.set(item, { opacity: 0, scale: 0.8 });
      });

      // Build sequential timeline
      leftItems.forEach((_, i) => {
        // Hold the current item on screen
        tl.to(leftItems[i], { y: "+=0", duration: 1.5 });

        // If it's not the last item, transition to the next one
        if (i !== leftItems.length - 1) {
          const transitionLabel = `transition_${i}`;
          tl.addLabel(transitionLabel);

          // Fade OUT current items
          tl.to([leftItems[i], rightItems[i]], {
            opacity: 0,
            y: -100,
            scale: 1.1,
            duration: 0.8,
            ease: "none",
          }, transitionLabel);

          // Fade IN next items slightly before the previous one finishes fading out
          tl.to([leftItems[i + 1], rightItems[i + 1]], {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "none",
          }, `${transitionLabel}+=0.4`);
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const showcaseData = [
    { title: "Organizer Verification", desc: "Every organizer must verify their identity and official credentials before operating on the platform.", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070" },
    { title: "Campaign Approval", desc: "Administrators rigorously review and approve every campaign to guarantee authenticity before it goes live.", image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070" },
    { title: "Donation System", desc: "Contributions are securely processed and tracked directly to the campaign, ensuring complete financial transparency.", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2064" },
  ];

  return (
    <section ref={sectionRef} className="h-screen bg-black overflow-hidden flex items-center justify-center">
      <div ref={containerRef} className="max-w-7xl w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="relative h-[600px] w-full">
          {showcaseData.map((data, i) => (
            <div 
              key={i}
              className="showcase-left absolute inset-0 flex flex-col justify-center"
            >
              <h2 className="text-7xl font-black tracking-tighter mb-6 leading-tight text-white">
                {data.title.split(' ')[0]} <br />
                <span className="text-orange-500">{data.title.split(' ')[1]}</span>
              </h2>
              <p className="text-xl text-white/40 max-w-sm leading-relaxed font-medium">{data.desc}</p>
            </div>
          ))}
        </div>

        <div className="relative h-[600px] w-full rounded-[3rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">
          {showcaseData.map((data, i) => (
            <div 
              key={i}
              className="showcase-right absolute inset-0"
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
