"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sunrise, Moon, Clock, Sparkles, Layout, ChevronRight, CheckCircle2 } from "lucide-react";

export default function DinacharyaPage() {
  const [wakeUpTime, setWakeUpTime] = useState("06:00");
  const [dosha, setDosha] = useState("Pitta");
  const [loading, setLoading] = useState(false);
  const [rituals, setRituals] = useState<any[] | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Sync with localStorage on mount
  useEffect(() => {
    const savedDosha = localStorage.getItem("aaharai_dosha");
    if (savedDosha) setDosha(savedDosha);

    const savedRoutine = localStorage.getItem("aaharai_routine");
    if (savedRoutine) {
      try {
        setRituals(JSON.parse(savedRoutine));
      } catch (e) {
        console.error("Failed to parse saved routine", e);
      }
    }
  }, []);

  const generateRoutine = async () => {
    setLoading(true);
    setIsSaved(false);
    try {
      const res = await fetch("/api/dinacharya", {
        method: "POST",
        body: JSON.stringify({ wakeUpTime, dosha }),
      });
      const data = await res.json();
      setRituals(data.rituals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveRoutine = () => {
    if (!rituals) return;
    localStorage.setItem("aaharai_routine", JSON.stringify(rituals));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">Daily <span className="text-turmeric-700">Rituals</span></h1>
        <p className="text-lg text-charcoal/60 italic">"He who follows Dinacharya lives for 100 years, free from disease." — Charaka Samhita</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-12">
        
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-charcoal/5 border border-charcoal/5">
            <h2 className="text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
              <Layout className="w-5 h-5 text-clay" />
              Your Parameters
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-charcoal/40 uppercase tracking-widest mb-3">Wake-up Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30" />
                  <input 
                    type="time" 
                    className="w-full pl-12 pr-4 py-4 bg-sand/50 rounded-2xl outline-none focus:ring-2 focus:ring-clay/20 transition-all font-medium text-charcoal"
                    value={wakeUpTime}
                    onChange={(e) => setWakeUpTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/40 uppercase tracking-widest mb-3">Dominant Dosha</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Vata", "Pitta", "Kapha"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDosha(d)}
                      className={`py-3 rounded-xl text-sm font-bold transition-all ${
                        dosha === d 
                        ? "bg-clay text-white shadow-lg shadow-clay/20" 
                        : "bg-sand text-charcoal/40 hover:bg-charcoal/5"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateRoutine}
                disabled={loading}
                className="w-full bg-charcoal text-white py-4 rounded-2xl font-bold hover:bg-charcoal/90 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Sparkles className="animate-spin w-5 h-5" /> : "Architect My Day"}
              </button>
            </div>
          </div>

          <div className="bg-turmeric/10 p-6 rounded-3xl border border-turmeric/20">
            <h3 className="font-bold text-charcoal mb-2 flex items-center gap-2">
              <Sunrise className="w-4 h-4 text-turmeric-700" />
              Brahma Muhurta
            </h3>
            <p className="text-sm text-charcoal/60 leading-relaxed">
              The period 1.5 hours before sunrise is when the air is charged with 'Prana'. Waking then balances all three Doshas instantly.
            </p>
          </div>
        </div>

        {/* Timeline Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {!rituals && !loading && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border border-dashed border-charcoal/10"
              >
                <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mb-6 text-charcoal/20">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-2">Ready to align?</h3>
                <p className="text-charcoal/40">Enter your wake-up time to generate <br/> your sacred daily schedule.</p>
              </motion.div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-clay border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-charcoal animate-pulse">Aligning with Nature...</p>
              </div>
            )}

            {rituals && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {rituals.map((ritual, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group flex gap-6"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-white border border-charcoal/5 flex flex-col items-center justify-center shadow-sm group-hover:border-clay/30 transition-colors">
                        <span className="text-[10px] font-bold text-charcoal/30 uppercase leading-none">Time</span>
                        <span className="text-[11px] font-black text-charcoal">{ritual.time.split(' ')[0]}</span>
                      </div>
                      <div className="w-0.5 h-full bg-charcoal/5 my-2 group-last:hidden" />
                    </div>
                    
                    <div className="flex-1 bg-white p-6 rounded-3xl border border-charcoal/5 group-hover:shadow-xl group-hover:shadow-charcoal/5 transition-all mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-charcoal group-hover:text-clay transition-colors">{ritual.activity}</h3>
                        {idx === 0 && <Sunrise className="w-4 h-4 text-turmeric-700" />}
                        {idx === rituals.length - 1 && <Moon className="w-4 h-4 text-clay" />}
                      </div>
                      <p className="text-sm text-charcoal/60 leading-relaxed">{ritual.description}</p>
                    </div>
                  </motion.div>
                ))}
                
                <div className="mt-8 text-center">
                   <button 
                    onClick={saveRoutine}
                    className="text-sm font-bold text-clay flex items-center gap-2 mx-auto hover:underline"
                   >
                     {isSaved ? (
                       <span className="flex items-center gap-2 text-sage"><CheckCircle2 className="w-4 h-4" /> Routine Saved!</span>
                     ) : (
                       <span className="flex items-center gap-2">Save Routine to My Dashboard <ChevronRight className="w-4 h-4" /></span>
                     )}
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
