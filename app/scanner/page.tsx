"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Sparkles, CheckCircle2, Info, Bookmark, Save } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ScannerPage() {
  const { data: session } = useSession();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveToTracker = async () => {
    if (!analysis) return;
    
    // Save to Local Storage first (for immediate feedback/guest users)
    const existing = localStorage.getItem("aaharai_prana_log") || "[]";
    const logs = JSON.parse(existing);
    logs.unshift({
      ...analysis,
      date: new Date().toISOString(),
    });
    localStorage.setItem("aaharai_prana_log", JSON.stringify(logs.slice(0, 50)));

    // If logged in, save to Database
    if (session?.user) {
      setSaving(true);
      try {
        await fetch("/api/log-food", {
          method: "POST",
          body: JSON.stringify({
            userId: (session.user as any).id,
            foodName: analysis.items?.[0] || "Ayurvedic Meal",
            score: analysis.score,
            category: analysis.category
          }),
        });
      } catch (e) {
        console.error("Database save failed", e);
      } finally {
        setSaving(false);
      }
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">Satvik <span className="text-sage">Scanner</span></h1>
        <p className="text-lg text-charcoal/60">Snap a photo of your meal to see its Prana Score and Ayurvedic quality.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        
        {/* Upload Section */}
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square bg-white border-4 border-dashed border-charcoal/5 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-clay/20 hover:bg-clay/5 transition-all overflow-hidden relative group"
          >
            {image ? (
              <img src={image} alt="Food" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-charcoal/40" />
                </div>
                <p className="font-bold text-charcoal/60">Upload or Take Photo</p>
                <p className="text-sm text-charcoal/40 mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

          <button
            onClick={analyzeFood}
            disabled={!image || loading}
            className="w-full bg-clay text-white py-4 rounded-2xl font-bold text-lg hover:bg-clay-hover shadow-xl shadow-clay/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Sparkles className="animate-spin w-6 h-6" /> : "Analyze Meal"}
          </button>
        </div>

        {/* Results Section */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {!analysis && !loading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="h-full flex flex-col items-center justify-center text-center p-8 bg-sand/50 rounded-[3rem] border border-charcoal/5"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-charcoal/20">
                  <Info className="w-6 h-6" />
                </div>
                <p className="text-charcoal/40 font-medium italic">Upload a photo to see the <br/> ancient wisdom within your meal.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-clay/20 border-t-clay rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-clay animate-pulse" />
                </div>
                <p className="mt-6 font-bold text-charcoal">Analyzing Prana...</p>
                <p className="text-sm text-charcoal/40 mt-1">Consulting ancient texts & AI</p>
              </motion.div>
            )}

            {analysis && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Score Header */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-charcoal/5 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs font-bold text-charcoal/40 uppercase tracking-widest mb-1">Prana Score</p>
                      <h2 className="text-6xl font-black text-charcoal">{analysis.score}</h2>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider ${
                      analysis.category === 'Satvik' ? 'bg-sage/10 text-sage' : 
                      analysis.category === 'Rajasic' ? 'bg-turmeric/20 text-turmeric-700' : 
                      'bg-clay/10 text-clay'
                    }`}>
                      {analysis.category}
                    </div>
                  </div>
                  <div className="w-full h-3 bg-sand rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.score}%` }}
                      className={`h-full ${
                        analysis.score > 70 ? 'bg-sage' : analysis.score > 40 ? 'bg-turmeric' : 'bg-clay'
                      }`}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="bg-white p-6 rounded-3xl border border-charcoal/5 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-sage shrink-0" />
                  <div>
                    <h3 className="font-bold text-charcoal mb-1">Ancient Insight</h3>
                    <p className="text-sm text-charcoal/60 leading-relaxed">{analysis.breakdown}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-clay/5 p-6 rounded-3xl border border-clay/10 flex items-start gap-4">
                    <Sparkles className="w-6 h-6 text-clay shrink-0" />
                    <div>
                      <h3 className="font-bold text-charcoal mb-1">Gurukul Advice</h3>
                      <p className="text-sm text-charcoal/60 leading-relaxed">{analysis.advice}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={saveToTracker}
                      disabled={saving}
                      className="py-4 bg-charcoal text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-charcoal/90 transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <Sparkles className="animate-spin w-5 h-5" />
                      ) : isSaved ? (
                        <CheckCircle2 className="w-5 h-5 text-sage" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {saving ? "Saving..." : isSaved ? "Log Saved" : "Add to Tracker"}
                    </button>
                    <button 
                      onClick={() => {
                        const text = `My meal just got a Prana Score of ${analysis.score}/100 on Aaharai! 🌿 It's classified as ${analysis.category}. Join me in making India healthy again: ${window.location.origin}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="py-4 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    >
                      Share
                    </button>
                  </div>
                </div>

                {/* Ingredients Tags */}
                <div className="flex flex-wrap gap-2">
                  {analysis.items?.map((item: string) => (
                    <span key={item} className="px-3 py-1 bg-sand text-charcoal/60 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
