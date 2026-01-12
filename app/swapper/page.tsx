"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ArrowRight, Utensils } from "lucide-react";
import Link from "next/link";

export default function SwapperPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/swap-food", {
        method: "POST",
        body: JSON.stringify({ craving: query }),
      });
      const data = await res.json();
      setResult(data.swap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-turmeric/10 rounded-full blur-[120px]" 
        />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-clay/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-xl relative z-10 text-center">
        
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-clay uppercase tracking-widest mb-6 hover:underline">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
          Junk to <span className="text-clay">Jewel</span>
        </h1>
        <p className="text-lg text-charcoal/70 mb-10">
          Tell us what you crave. We'll tell you what to eat <br/>
          to satisfy the soul, not just the tongue.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSwap} className="relative w-full max-w-lg mx-auto mb-12 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-charcoal/40 group-focus-within:text-clay transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="I am craving... (e.g. Pizza, Maggi, Coke)"
            className="w-full pl-12 pr-4 py-4 rounded-full bg-white border-2 border-transparent shadow-lg shadow-charcoal/5 focus:outline-none focus:border-clay/50 focus:shadow-xl transition-all text-lg placeholder:text-charcoal/30 text-charcoal"
          />
          <button 
            type="submit" 
            disabled={loading || !query}
            className="absolute inset-y-2 right-2 px-6 rounded-full bg-clay text-white font-medium hover:bg-clay-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Sparkles className="w-5 h-5 animate-spin" /> : "Transform"}
          </button>
        </form>

        {/* Result Card */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel p-8 rounded-3xl text-left border-l-4 border-l-sage relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Utensils className="w-24 h-24 text-charcoal" />
              </div>

              <span className="inline-block px-3 py-1 bg-sage/20 text-sage text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                Ancient Alternative
              </span>
              
              <h2 className="text-3xl font-bold text-charcoal mb-2">{result.name}</h2>
              <p className="text-xl text-clay font-serif italic mb-6">"{result.description}"</p>
              
              <div className="space-y-4">
                <div className="bg-white/50 p-4 rounded-xl">
                  <h3 className="font-semibold text-charcoal text-sm mb-1 uppercase tracking-wide">Why this works</h3>
                  <p className="text-charcoal/80">{result.why}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-charcoal text-sm mb-2 uppercase tracking-wide">Key Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.ingredients?.map((ing: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-turmeric/20 text-charcoal/80 rounded-lg text-sm font-medium">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                 <button className="text-sm text-charcoal/40 hover:text-clay underline decoration-dotted">
                   Save this to my recipe book
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
