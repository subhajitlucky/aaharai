"use client";

import { motion } from "framer-motion";
import { Leaf, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4 py-20">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-turmeric/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sage/20 rounded-full blur-[100px] -z-10" />

      {/* Hero Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-medium text-clay mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Reviving Ancient Indian Health</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-charcoal">
          Aahar<span className="text-clay">ai</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-charcoal/80 max-w-2xl mx-auto leading-relaxed">
          The digital Gurukul for your gut. <br/>
          Discover the food your ancestors knew kept them strong, <br/>
          <span className="font-semibold italic">now powered by AI.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/prakriti-test"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-clay px-8 font-medium text-white transition-all duration-300 hover:bg-clay-hover hover:scale-105 hover:shadow-lg hover:shadow-clay/30"
          >
            <span className="mr-2">Find My Body Type</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link 
            href="/science"
            className="px-8 h-12 rounded-full font-medium text-charcoal border-2 border-charcoal/10 hover:bg-charcoal/5 transition-colors flex items-center justify-center"
          >
            Learn the Science
          </Link>
        </div>
      </motion.div>

      {/* Footer / Trust Badge */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute bottom-8 text-center text-sm text-charcoal/40"
      >
        <p className="flex items-center gap-2">
          <Leaf className="w-4 h-4" />
          <span>100% Satvik & Scientific Principles</span>
        </p>
      </motion.div>

    </main>
  );
}