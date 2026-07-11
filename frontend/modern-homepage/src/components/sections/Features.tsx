"use client";

import { motion } from "framer-motion";
import { Search, Heart, BarChart3, ShieldCheck, Globe, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <Search className="w-8 h-8" />,
    title: "Ethical Discovery",
    desc: "Find verified causes through our rigorous auditing process and ethical filters.",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  {
    icon: <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>,
    title: "Direct Contribution",
    desc: "Give securely with zero hidden fees. 100% of your gift reaches the ground.",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Impact Ledger",
    desc: "Track your specific dollars in real-time with photographic proof of arrival.",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "Verified Trust",
    desc: "Every campaign is vetted by our global network of humanitarian experts.",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Global Network",
    desc: "Connecting local heroes with global donors across 120+ countries.",
    color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Community Driven",
    desc: "Join a movement of over 450,000 active donors making a real difference.",
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
];

export function Features() {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm font-bold tracking-[0.2em] text-orange-500 uppercase mb-4 block">The AidUp Protocol</span>
            <h2 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight mb-8">
              Transparency by <br />
              <span className="text-white/40 font-manrope">Design.</span>
            </h2>
            <p className="text-lg text-white/50 leading-relaxed">
              We've re-engineered the humanitarian pipeline from the ground up to ensure every cent creates a measurable impact.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-500"
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center border mb-8 transition-transform duration-500 group-hover:scale-110",
                feature.color
              )}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-white/40 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
