import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Elena Vance",
    role: "Field Director @ Red Cross",
    content: "AidUp has solved the biggest hurdle in humanitarian aid: trust. Being able to show donors exactly where their money goes in real-time is a game changer.",
    avatar: "https://i.pravatar.cc/150?u=elena",
  },
  {
    name: "David Kojo",
    role: "Community Leader, Ghana",
    content: "For the first time, we can connect directly with people who want to help. The transparency ensures that the resources actually reach our families.",
    avatar: "https://i.pravatar.cc/150?u=kojo",
  },
  {
    name: "Michael Chen",
    role: "Philanthropist",
    content: "I've stopped giving elsewhere. With AidUp, I receive a photo and a ledger entry every time my contribution is used. It's giving with radical clarity.",
    avatar: "https://i.pravatar.cc/150?u=chen",
  },
];

export function Testimonials() {
  return (
    <section id="impact" className="py-32 px-6 overflow-hidden bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">Voices of Impact</h2>
          <p className="text-white/40 font-medium italic">Transforming how the world gives, one story at a time.</p>
        </div>

        <div className="flex gap-6 animate-scroll hover:pause">
          {[...testimonials, ...testimonials].map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="flex-shrink-0 w-[400px] p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] relative group transition-all duration-500 hover:border-orange-500/20"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-orange-500 text-orange-500" />
                ))}
              </div>
              <p className="text-lg text-white/80 leading-relaxed mb-8 font-medium italic">
                "{t.content}"
              </p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border border-white/10" />
                <div>
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-400px * 3 - 1.5rem * 3)); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
