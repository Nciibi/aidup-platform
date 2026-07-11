"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function ProductShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section ref={ref} className="py-32 px-6 bg-black relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-6"
          >
            The Command <br />
            <span className="text-white/40 text-4xl md:text-6xl tracking-tight">Center of Global Good.</span>
          </motion.h2>
        </div>

        <div className="relative perspective-[2000px]">
          <motion.div
            style={{ rotateX, scale, y }}
            className="relative z-10 w-full max-w-6xl mx-auto rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl shadow-orange-600/10"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/5 to-transparent" />
            <img 
              src="https://images.unsplash.com/photo-1576091727342-aa003841897d?q=80&w=2070" 
              alt="AidUp Dashboard"
              className="w-full h-auto object-cover"
            />
            
            {/* Floating UI Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 -left-10 md:left-10 p-6 glass rounded-2xl shadow-2xl hidden md:block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Campaign Status</p>
                  <p className="text-sm font-bold">Funds Delivered</p>
                </div>
              </div>
              <div className="h-1.5 w-40 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  className="h-full bg-emerald-500" 
                />
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 -right-10 md:right-10 p-6 glass rounded-2xl shadow-2xl hidden md:block"
            >
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Live Impact Analytics</p>
              <div className="flex items-end gap-1 h-12">
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    className="flex-1 bg-orange-600/40 rounded-t-sm"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
