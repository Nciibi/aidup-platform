import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function FinalCTA() {
  return (
    <section className="py-40 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
      <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-white">
            Be the Change <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-orange-400 to-orange-800">You Can See.</span>
          </h2>
          <p className="text-xl text-white/50 max-w-xl mx-auto mb-12 font-medium leading-relaxed">
            Join the world's most transparent humanitarian movement and start tracking your impact today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-orange-600 text-white font-bold text-xl hover:scale-105 transition-all shadow-2xl shadow-orange-600/20 text-center">
              Create Your Account
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-20 px-6 border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-1">
            <div className="text-2xl font-black tracking-tighter mb-6 flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
              </div>
              <span>AidUp</span>
            </div>
            <p className="text-sm text-white/30 leading-relaxed max-w-[200px]">
              The world's first open-ledger humanitarian platform for radical transparency.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-6">Impact</h4>
            <ul className="space-y-4">
              {["Active Causes", "Success Stories", "The Ledger", "Vetting Process"].map(item => (
                <li key={item}><a href="#" className="text-sm text-white/30 hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-6">Platform</h4>
            <ul className="space-y-4">
              {["Mobile App", "Transparency Lab", "API", "Partnerships"].map(item => (
                <li key={item}><a href="#" className="text-sm text-white/30 hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-6">Support</h4>
            <ul className="space-y-4">
              {["Help Center", "Trust & Safety", "Legal", "Contact"].map(item => (
                <li key={item}><a href="#" className="text-sm text-white/30 hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-6">Newsletter</h4>
            <div className="relative">
              <input 
                type="email" 
                placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/40 transition-all text-white placeholder-white/20"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5">
          <p className="text-xs text-white/20">© 2026 AidUp Foundation. Humanitarian Open Ledger Protocol.</p>
          <div className="flex gap-8">
            {["Twitter", "GitHub", "Instagram", "LinkedIn"].map(item => (
              <a key={item} href="#" className="text-xs text-white/20 hover:text-white transition-colors uppercase tracking-widest font-bold">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
