"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Sparkles, AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function ScannerPage() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
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
            className="aspect-square bg-white border-4 border-dashed border-charcoal/5 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-clay/20 hover:bg-clay/5 transition-all overflow-hidden relative"
          >
            {image ? (
              <img src={image} alt="Food" className="w-full h-full object-cover" />
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
                    <h3 className="font-bold text-charcoal mb-1">What we found</h3>
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

                  <button 
                    onClick={() => {
                      const text = `My meal just got a Prana Score of ${analysis.score}/100 on Aaharai! 🌿 It's classified as ${analysis.category}. Join me in making India healthy again: ${window.location.origin}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.481 2.245 2.245 3.481 5.23 3.481 8.407 0 6.557-5.332 11.89-11.888 11.89-1.996 0-3.961-.504-5.701-1.458l-6.283 1.647zm6.75-3.133c1.558.924 3.037 1.413 4.582 1.413 5.4 0 9.794-4.394 9.794-9.794 0-5.399-4.394-9.793-9.794-9.793-5.399 0-9.794 4.394-9.794 9.794 0 2.112.671 4.113 1.94 5.772l-.999 3.645 3.754-.984zm11.234-7.07c-.121-.202-.444-.323-.928-.564-.484-.241-2.863-1.413-3.307-1.574-.444-.161-.766-.241-1.09.241-.323.483-1.251 1.574-1.533 1.9-.283.322-.565.362-1.049.121-.484-.241-2.043-.752-3.89-2.403-1.436-1.282-2.405-2.865-2.687-3.348-.283-.483-.03-.744.212-.984.217-.217.484-.564.726-.846.242-.283.323-.483.484-.805.161-.322.081-.604-.04-.846-.121-.242-1.09-2.622-1.493-3.589-.393-.943-.787-.813-1.09-.828-.282-.015-.605-.018-.928-.018s-.847.121-1.291.604c-.444.483-1.694 1.654-1.694 4.03s1.735 4.673 1.977 5.014c.242.342 3.414 5.211 8.27 7.309 1.155.498 2.057.795 2.756.1.7 1.254.341 1.687.1 2.13-.242.443-1.09 1.533-1.493 2.13-.362.483-.726.564-1.21.322-.484-.242-2.057-1.008-3.911-2.658-1.444-1.282-2.42-2.865-2.703-3.348-.283-.483-.03-.744.212-.984.217-.217.484-.564.726-.846.242-.283.323-.483.484-.805.161-.322.081-.604-.04-.846-.121-.242-1.09-2.622-1.493-3.589-.393-.943-.787-.813-1.09-.828-.282-.015-.605-.018-.928-.018s-.847.121-1.291.604c-.444.483-1.694 1.654-1.694 4.03s1.735 4.673 1.977 5.014c.242.342 3.414 5.211 8.27 7.309 1.155.498 2.057.795 2.756.996.699.201 2.379.927 3.468 1.087 1.089.16 2.419.08 3.064-.483.645-.563.645-1.653.444-2.137-.202-.483-.726-.766-1.21-1.007z"/></svg>
                    Share on WhatsApp
                  </button>
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
