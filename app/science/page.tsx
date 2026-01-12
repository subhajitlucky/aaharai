"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Microscope, History, Zap, Heart, Brain } from "lucide-react";

const pillars = [
  {
    title: "Gut-Brain Axis",
    desc: "Ancient 'Agni' (Digestive Fire) is what modern science calls the Gut Microbiome. 90% of your Serotonin is produced in your gut.",
    icon: Brain
  },
  {
    title: "Circadian Rhythm",
    desc: "Our 'Dinacharya' follows the solar cycle, which regulates Cortisol and Melatonin levels, proven by the 2017 Nobel Prize in Medicine.",
    icon: Zap
  },
  {
    title: "Epigenetics",
    desc: "Traditional Indian food processing (soaking, fermenting, slow cooking) reduces anti-nutrients like Lectins and Phytates.",
    icon: Microscope
  }
];

export default function SciencePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      
      {/* Hero */}
      <div className="text-center mb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage/10 text-sage text-sm font-bold uppercase tracking-widest mb-6"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Evidence Based Wisdom</span>
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-bold text-charcoal mb-6">Ancient Wisdom, <br/> <span className="text-clay">Proven Science.</span></h1>
        <p className="text-xl text-charcoal/60 max-w-2xl mx-auto leading-relaxed">
          Aaharai isn't just about tradition. It's about reconnecting with the biological laws that governed human health for millennia.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-24">
        {pillars.map((p, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-charcoal/5 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 bg-sand rounded-2xl flex items-center justify-center text-clay mb-6">
              <p.icon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-4">{p.title}</h3>
            <p className="text-charcoal/60 leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Comparison Section */}
      <div className="bg-charcoal text-white rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-clay/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8">Why "Make India Healthy Again"?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-clay shrink-0 mt-1 flex items-center justify-center text-[10px] font-bold">1</div>
                <p className="text-white/70"><span className="text-white font-bold">The Problem:</span> Refined oils and processed sugar have caused a 400% spike in lifestyle diseases in India since 1990.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-clay shrink-0 mt-1 flex items-center justify-center text-[10px] font-bold">2</div>
                <p className="text-white/70"><span className="text-white font-bold">The Solution:</span> Reverting to local, seasonal, and whole grains (Millets, Hand-pounded Rice) restores the gut-metabolic balance.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-clay shrink-0 mt-1 flex items-center justify-center text-[10px] font-bold">3</div>
                <p className="text-white/70"><span className="text-white font-bold">The Mission:</span> To build a digital bridge that makes this ancient wisdom accessible to every smartphone user in India.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
              <History className="w-5 h-5" />
              Historical Longevity
            </h4>
            <div className="space-y-4 text-sm text-white/60 italic leading-relaxed">
              <p>"Let food be thy medicine, and medicine be thy food." — Ancient Proverb</p>
              <p>Indian civilizations thrived for thousands of years without modern hospitals by mastering the art of 'Aahar' (Nutrition) and 'Vihar' (Lifestyle).</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
