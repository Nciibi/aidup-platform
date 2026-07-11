import { useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4 flex justify-center",
        isScrolled ? "py-3" : "py-6"
      )}
    >
      <nav
        className={cn(
          "flex items-center justify-between w-full max-w-5xl px-8 py-2.5 transition-all duration-700 rounded-full border",
          isScrolled 
            ? "bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20" 
            : "bg-transparent border-transparent"
        )}
      >
        <Link to="/" className="text-xl font-bold tracking-tighter flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
          </div>
          <span className="text-white">Aid<span className="text-orange-500">Up</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["How it Works", "Causes", "Impact", "Security"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="px-6 py-2 rounded-full bg-orange-600 text-white text-sm font-bold hover:bg-orange-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-600/20">
            Join AidUp
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
