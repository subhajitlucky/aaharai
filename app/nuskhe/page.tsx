"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Sparkles, AlertCircle, Coffee, Thermometer, Wind } from "lucide-react";

const quickSymptoms = [
  { name: "Bloated Stomach", icon: Wind },
  { name: "Common Cold", icon: Thermometer },
  { name: "Low Energy", icon: Sparkles },
  { name: "Poor Sleep", icon: Coffee },
];

export default function NuskhePage() {
  const [symptom, setSymptom] = useState("");
  const [loading, setLoading] = useState(false);
  const [remedy, setRemedy] = useState<any>(null);

  const fetchRemedy = async (query: string) => {
    const finalQuery = query || symptom;
    if (!finalQuery) return;

    setLoading(true);
    setRemedy(null);
    try {
      const res = await fetch("/api/nuskhe", {
        method: "POST",
        body: JSON.stringify({ symptom: finalQuery }),
      });
      const data = await res.json();
      setRemedy(data.remedy);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">Ancient <span className="text-clay">Nuskhe</span></h1>
        <p className="text-lg text-charcoal/60">Natural remedies from grandmother's kitchen, backed by AI wisdom.</p>
      </div>

      {/* Input Section */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-charcoal/5 border border-charcoal/5 mb-12">
        <label className="block text-sm font-bold text-charcoal/40 uppercase tracking-widest mb-4">How are you feeling?</label>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="e.g. I have a headache, My throat is sore..."
            className="flex-1 bg-sand/50 border-2 border-transparent focus:border-clay/20 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all text-lg"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
          />
          <button 
            onClick={() => fetchRemedy(symptom)}
            disabled={loading || !symptom}
            className="bg-charcoal text-white px-8 py-4 rounded-2xl font-bold hover:bg-charcoal/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Sparkles className="animate-spin w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
            Find Remedy
          </button>
        </div>

        {/* Quick Tags */}
        <div className="mt-8">
          <p className="text-xs font-bold text-charcoal/30 uppercase mb-4">Common Issues</p>
          <div className="flex flex-wrap gap-3">
            {quickSymptoms.map((s) => (
              <button
                key={s.name}
                onClick={() => { setSymptom(s.name); fetchRemedy(s.name); }}
                className="flex items-center gap-2 px-4 py-2 bg-sand rounded-full text-sm font-medium text-charcoal/60 hover:bg-clay/10 hover:text-clay transition-all border border-transparent hover:border-clay/20"
              >
                <s.icon className="w-4 h-4" />
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Remedy Result */}
      <AnimatePresence>
        {remedy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border-t-8 border-clay p-10 shadow-2xl shadow-charcoal/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-clay/10 rounded-full flex items-center justify-center text-clay">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-charcoal">{remedy.title}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-charcoal/30 uppercase tracking-widest mb-3">The Procedure</h3>
                  <p className="text-charcoal/80 leading-relaxed text-lg">{remedy.procedure}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-charcoal/30 uppercase tracking-widest mb-3">Why it works</h3>
                  <p className="text-charcoal/60 italic">{remedy.why}</p>
                </div>
              </div>

              <div className="bg-sand/50 rounded-3xl p-6 self-start">
                <div className="flex items-center gap-2 text-clay mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-bold text-sm uppercase">Safety Note</span>
                </div>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  {remedy.warning}
                </p>
                <p className="mt-4 text-[10px] text-charcoal/30 leading-tight">
                  Disclaimer: This is for educational purposes based on traditional knowledge. Please consult a qualified doctor for serious conditions.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
