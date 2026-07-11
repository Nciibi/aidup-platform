"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <section 
      ref={containerRef}
      className="relative h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Parallax Background */}
      <motion.div 
        style={{ y, scale }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-orange-600/10 via-transparent to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
        <img 
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" 
          alt="Humanitarian Aid"
          className="w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-600/10 border border-orange-500/20 text-xs font-bold tracking-widest text-orange-500 uppercase mb-8">
            The Human Ledger
          </span>
          <h1 className="text-6xl md:text-8xl font-display font-extrabold tracking-tight leading-[0.9] mb-8">
            Giving, with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-orange-400 via-orange-600 to-orange-800">Radical Clarity.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            AidUp is the world's first open-ledger humanitarian platform. Experience a new standard of transparency where every contribution is tracked from your hand to theirs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-orange-600 text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-600/20">
              Start Your Impact
            </button>
            <button className="w-full sm:w-auto px-10 py-5 rounded-2xl glass font-bold text-lg hover:bg-white/10 transition-all">
              See the Ledger
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">Explore the Mission</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
