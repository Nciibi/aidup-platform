import { useEffect, useRef } from "react";
import { gsap } from "../../../lib/gsap";
import { cn } from "../../../lib/utils";

const stats = [
  { label: "Total Lives Impacted", value: 450, suffix: "K+", color: "from-orange-500 to-amber-600" },
  { label: "Transparency Score", value: 100, suffix: "%", color: "from-emerald-500 to-teal-600" },
  { label: "Verified Campaigns", value: 1.8, suffix: "K", color: "from-blue-500 to-indigo-600" },
  { label: "Direct-to-Recipient", value: 94.5, suffix: "%", color: "from-rose-500 to-pink-600" },
];

export function Stats() {
  const containerRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      stats.forEach((stat, i) => {
        const counter = countersRef.current[i];
        if (counter) {
          gsap.fromTo(counter, 
            { innerHTML: 0 },
            {
              innerHTML: stat.value,
              duration: 2.5,
              ease: "expo.out",
              scrollTrigger: {
                trigger: counter,
                start: "top 85%",
              },
              onUpdate: function() {
                const val = parseFloat(this.targets()[0].innerHTML);
                counter.innerHTML = val % 1 === 0 ? val.toLocaleString() : val.toFixed(1);
              }
            }
          );
        }
      });

      gsap.from(".stat-card", {
        opacity: 0,
        y: 60,
        stagger: 0.2,
        duration: 1.5,
        ease: "power4.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div 
              key={stat.label}
              className="stat-card bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] relative overflow-hidden group"
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-700",
                stat.color
              )} />
              <p className="text-sm font-bold tracking-[0.2em] text-white/40 uppercase mb-4">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span 
                  ref={(el) => { if (el) countersRef.current[i] = el; }}
                  className="text-6xl font-black tracking-tighter text-white"
                >
                  0
                </span>
                <span className="text-2xl font-bold text-white/30">{stat.suffix}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
