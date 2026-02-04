"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, Leaf, Sparkles, ChevronRight, X, Bookmark, History, Quote, Stethoscope, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AncientLibraryPage() {
  const [activeTab, setActiveTab] = useState<"library" | "saved">("library");
  const [savedSwaps, setSavedSwaps] = useState<any[]>([]);
  const [savedRemedies, setSavedRemedies] = useState<any[]>([]);
  const [pranaLogs, setPranaLogs] = useState<any[]>([]);

  useEffect(() => {
    const swaps = JSON.parse(localStorage.getItem("aaharai_swaps") || "[]");
    const remedies = JSON.parse(localStorage.getItem("aaharai_remedies") || "[]");
    const logs = JSON.parse(localStorage.getItem("aaharai_prana_log") || "[]");
    
    setSavedSwaps(swaps);
    setSavedRemedies(remedies);
    setPranaLogs(logs);
  }, [activeTab]);

  const clearItem = (key: string, index: number, stateSetter: any) => {
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(existing));
    stateSetter([...existing]);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">The Ancient <span className="text-sage">Library</span></h1>
          <p className="text-lg text-charcoal/60 max-w-xl text-left">Your personal vault of sacred knowledge, healthy swaps, and healing remedies.</p>
        </div>
        
        <div className="flex bg-sand p-1.5 rounded-2xl border border-charcoal/5">
          <button 
            onClick={() => setActiveTab("library")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "library" ? "bg-white text-clay shadow-lg shadow-charcoal/5" : "text-charcoal/40 hover:text-charcoal"}`}
          >
            Universal Knowledge
          </button>
          <button 
            onClick={() => setActiveTab("saved")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "saved" ? "bg-white text-clay shadow-lg shadow-charcoal/5" : "text-charcoal/40 hover:text-charcoal"}`}
          >
            My Sacred Vault
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "library" ? (
          <motion.div 
            key="lib" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Featured Knowledge Cards */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-charcoal/5 shadow-xl shadow-charcoal/5 hover:scale-[1.02] transition-all group">
              <div className="w-12 h-12 bg-turmeric/20 rounded-2xl flex items-center justify-center text-turmeric-700 mb-6 group-hover:rotate-12 transition-transform">
                <Quote className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-4">The Sattvic Path</h3>
              <p className="text-charcoal/60 text-sm leading-relaxed mb-6">Learn why fresh, seasonal, and plant-based foods are considered the highest quality of energy for the human mind.</p>
              <button className="text-clay font-bold text-sm flex items-center gap-2">Read Shloka <ChevronRight className="w-4 h-4" /></button>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-charcoal/5 shadow-xl shadow-charcoal/5 hover:scale-[1.02] transition-all group">
              <div className="w-12 h-12 bg-clay/10 rounded-2xl flex items-center justify-center text-clay mb-6 group-hover:rotate-12 transition-transform">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-4">Spice Alchemy</h3>
              <p className="text-charcoal/60 text-sm leading-relaxed mb-6">Discover how common spices like Cumin, Turmeric, and Cardamom act as powerful medicine in your daily kitchen.</p>
              <button className="text-clay font-bold text-sm flex items-center gap-2">Explore Spices <ChevronRight className="w-4 h-4" /></button>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-charcoal/5 shadow-xl shadow-charcoal/5 hover:scale-[1.02] transition-all group">
              <div className="w-12 h-12 bg-sage/10 rounded-2xl flex items-center justify-center text-sage mb-6 group-hover:rotate-12 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-4">Ojas & Tejas</h3>
              <p className="text-charcoal/60 text-sm leading-relaxed mb-6">Understand the Ayurvedic concept of vitality (Ojas) and how to protect your inner glow through proper digestion.</p>
              <button className="text-clay font-bold text-sm flex items-center gap-2">Deep Dive <ChevronRight className="w-4 h-4" /></button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="saved" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Saved Swaps */}
            {savedSwaps.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Search className="w-5 h-5 text-clay" />
                  <h2 className="text-2xl font-bold text-charcoal text-left">Your Healthy Swaps</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedSwaps.map((swap, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm relative group">
                      <button 
                        onClick={() => clearItem("aaharai_swaps", i, setSavedSwaps)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 hover:bg-sand rounded-full transition-all"
                      >
                        <X className="w-4 h-4 text-charcoal/40" />
                      </button>
                      <p className="text-[10px] font-bold text-clay uppercase mb-2">Craving: {swap.craving}</p>
                      <h3 className="font-bold text-charcoal text-lg mb-1">{swap.name}</h3>
                      <p className="text-charcoal/60 text-sm italic mb-4">"{swap.description}"</p>
                      <div className="flex flex-wrap gap-1.5">
                        {swap.ingredients?.slice(0,3).map((ing: string) => (
                          <span key={ing} className="px-2 py-0.5 bg-sand rounded-md text-[10px] font-bold text-charcoal/40 uppercase">{ing}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Saved Remedies */}
            {savedRemedies.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Stethoscope className="w-5 h-5 text-sage" />
                  <h2 className="text-2xl font-bold text-charcoal text-left">Kitchen Remedies</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedRemedies.map((rem, i) => (
                    <div key={i} className="bg-sage/5 p-6 rounded-3xl border border-sage/10 relative group">
                      <button 
                        onClick={() => clearItem("aaharai_remedies", i, setSavedRemedies)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 hover:bg-white rounded-full transition-all"
                      >
                        <X className="w-4 h-4 text-charcoal/40" />
                      </button>
                      <h3 className="font-bold text-charcoal text-lg mb-2">{rem.title}</h3>
                      <p className="text-charcoal/60 text-sm line-clamp-3 mb-4">{rem.procedure}</p>
                      <div className="flex items-center gap-2 text-xs font-bold text-sage">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Traditional Cure
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Prana Logs */}
            {pranaLogs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <History className="w-5 h-5 text-turmeric-700" />
                  <h2 className="text-2xl font-bold text-charcoal text-left">Sacred Prana Log</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pranaLogs.map((log, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-charcoal/5 shadow-sm relative group">
                      <button 
                        onClick={() => clearItem("aaharai_prana_log", i, setPranaLogs)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 hover:bg-sand rounded-full transition-all"
                      >
                        <X className="w-4 h-4 text-charcoal/40" />
                      </button>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${log.category === 'Satvik' ? 'bg-sage/10 text-sage' : 'bg-clay/10 text-clay'}`}>
                          {log.category}
                        </span>
                        <span className="text-[10px] font-bold text-charcoal/30">{new Date(log.date).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-charcoal text-lg mb-1">{log.items?.[0] || "Ancient Meal"}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-sand rounded-full overflow-hidden">
                          <div className="h-full bg-clay" style={{ width: `${log.score}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-clay">{log.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {savedSwaps.length === 0 && savedRemedies.length === 0 && pranaLogs.length === 0 && (
              <div className="text-center py-20 bg-sand/50 rounded-[3rem] border border-dashed border-charcoal/10">
                <Bookmark className="w-12 h-12 text-charcoal/10 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-charcoal mb-2">Your vault is empty</h3>
                <p className="text-charcoal/40">Start exploring scans, swaps, and remedies to build <br/> your personal library of ancient jewels.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
