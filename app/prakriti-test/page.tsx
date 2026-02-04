"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

// --- Data: The Ayurvedic Questions ---
type Option = {
  label: string;
  dosha: "Vata" | "Pitta" | "Kapha";
};

type Question = {
  id: number;
  question: string;
  options: Option[];
};

const questions: Question[] = [
  {
    id: 1,
    question: "How would you describe your natural body frame?",
    options: [
      { label: "Thin, lean, I struggle to gain weight", dosha: "Vata" },
      { label: "Medium build, athletic, easy to gain muscle", dosha: "Pitta" },
      { label: "Broad, solid, I gain weight easily", dosha: "Kapha" },
    ],
  },
  {
    id: 2,
    question: "What is your skin typically like?",
    options: [
      { label: "Dry, rough, or cold to touch", dosha: "Vata" },
      { label: "Sensitive, reddish, or oily T-zone", dosha: "Pitta" },
      { label: "Smooth, thick, soft, and cool", dosha: "Kapha" },
    ],
  },
  {
    id: 3,
    question: "How is your appetite and digestion?",
    options: [
      { label: "Irregular – sometimes hungry, sometimes not", dosha: "Vata" },
      { label: "Strong, sharp – I get 'hangry' if I miss a meal", dosha: "Pitta" },
      { label: "Slow but steady – I can skip meals easily", dosha: "Kapha" },
    ],
  },
  {
    id: 4,
    question: "How do you usually sleep?",
    options: [
      { label: "Light sleeper, I wake up often", dosha: "Vata" },
      { label: "Sound sleep, about 6-7 hours is enough", dosha: "Pitta" },
      { label: "Deep, heavy sleep, I love sleeping in", dosha: "Kapha" },
    ],
  },
  {
    id: 5,
    question: "When under stress, how do you react?",
    options: [
      { label: "I get anxious, worried, or fearful", dosha: "Vata" },
      { label: "I get irritable, angry, or critical", dosha: "Pitta" },
      { label: "I withdraw, get quiet, or stubborn", dosha: "Kapha" },
    ],
  },
];

// --- Component ---
export default function PrakritiTest() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "Vata" | "Pitta" | "Kapha">>(
    {}
  );
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<any>(null);

  // Load result from localStorage on mount
  useEffect(() => {
    const savedResult = localStorage.getItem("aaharai_dosha");
    if (savedResult) {
      setResult(savedResult);
    }
  }, []);

  const handleSelect = (dosha: "Vata" | "Pitta" | "Kapha") => {
    setAnswers((prev) => ({ ...prev, [questions[currentStep].id]: dosha }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const scores = { Vata: 0, Pitta: 0, Kapha: 0 };
    Object.values(answers).forEach((d) => scores[d]++);
    
    // Find the max
    const dominant = Object.entries(scores).reduce((a, b) => 
      b[1] > a[1] ? b : a
    )[0];
    
    setResult(dominant);
    localStorage.setItem("aaharai_dosha", dominant);
  };

  const fetchMealPlan = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        body: JSON.stringify({ dosha: result }),
      });
      const data = await res.json();
      setMealPlan(data.plan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-clay/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-sage/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <Link href="/" className="text-sm font-semibold text-clay tracking-widest uppercase mb-2 block">
            Aaharai Analysis
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
            {result ? "Your Prakriti Blueprint" : "Discover Your Body Type"}
          </h1>
        </div>

        {/* Quiz Area */}
        {!result ? (
          <div className="glass-panel p-8 rounded-3xl shadow-xl shadow-charcoal/5">
            {/* Progress Bar */}
            <div className="w-full h-2 bg-charcoal/10 rounded-full mb-8 overflow-hidden">
              <motion.div 
                className="h-full bg-clay"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-medium text-charcoal mb-8">
                  {questions[currentStep].question}
                </h2>

                <div className="space-y-4">
                  {questions[currentStep].options.map((opt, idx) => {
                    const isSelected = answers[questions[currentStep].id] === opt.dosha;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(opt.dosha)}
                        className={clsx(
                          "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group",
                          isSelected 
                            ? "border-clay bg-clay/5 text-charcoal" 
                            : "border-charcoal/10 hover:border-clay/50 hover:bg-white"
                        )}
                      >
                        <span className="text-lg">{opt.label}</span>
                        {isSelected && <Check className="text-clay w-5 h-5" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!answers[questions[currentStep].id]}
                className="bg-charcoal text-white px-8 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-charcoal/90 transition-colors flex items-center gap-2"
              >
                {currentStep === questions.length - 1 ? "Reveal My Dosha" : "Next Question"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Result Area */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-10 rounded-3xl text-center shadow-xl shadow-charcoal/5 border-t-8 border-clay"
          >
            <p className="text-charcoal/60 mb-4 text-lg">Your dominant energy is</p>
            <h2 className="text-6xl font-bold text-clay mb-6">{result}</h2>
            
            <p className="text-xl text-charcoal/80 mb-8 leading-relaxed">
              {result === "Vata" && "You are creative, energetic, and quick-moving. Like the wind, you change often. You need grounding, warming foods to stay balanced."}
              {result === "Pitta" && "You are fiery, intelligent, and driven. Like the sun, you have high heat. You need cooling, calming foods to prevent burnout."}
              {result === "Kapha" && "You are calm, loving, and steady. Like the earth, you are solid. You need stimulating, light, and spicy foods to keep moving."}
            </p>

            {!mealPlan ? (
              <div className="flex flex-col gap-4 sm:flex-row justify-center">
                 <button 
                  onClick={fetchMealPlan}
                  disabled={loading}
                  className="bg-clay text-white px-8 py-4 rounded-full font-bold hover:bg-clay-hover transition-colors shadow-lg shadow-clay/20 disabled:opacity-70 flex items-center justify-center gap-2 min-w-[200px]"
                 >
                   {loading ? (
                     <RefreshCcw className="w-5 h-5 animate-spin" />
                   ) : (
                     `Get My ${result} Meal Plan`
                   )}
                 </button>
                 <button 
                  onClick={() => {
                    setResult(null);
                    setCurrentStep(0);
                    setAnswers({});
                    setMealPlan(null);
                    localStorage.removeItem("aaharai_dosha");
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-full font-medium text-charcoal border border-charcoal/20 hover:bg-charcoal/5"
                 >
                   <RefreshCcw className="w-4 h-4" /> Retake Quiz
                 </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-left space-y-4"
              >
                <h3 className="text-2xl font-bold text-charcoal text-center mb-6">Your Ancient Satvik Menu</h3>
                
                {["breakfast", "lunch", "dinner"].map((meal) => (
                  <div key={meal} className="bg-white/50 p-6 rounded-2xl border border-charcoal/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full bg-sage/20 text-sage text-xs font-bold uppercase tracking-wider">{meal}</span>
                    </div>
                    <h4 className="text-xl font-semibold text-clay mb-1">{mealPlan[meal]?.name}</h4>
                    <p className="text-charcoal/80 mb-2">{mealPlan[meal]?.description}</p>
                    <p className="text-sm text-charcoal/60 italic">✨ {mealPlan[meal]?.benefits}</p>
                  </div>
                ))}

                 <button 
                  onClick={() => {
                    setResult(null);
                    setCurrentStep(0);
                    setAnswers({});
                    setMealPlan(null);
                    localStorage.removeItem("aaharai_dosha");
                  }}
                  className="w-full mt-6 py-4 rounded-full font-medium text-charcoal border border-charcoal/20 hover:bg-charcoal/5"
                 >
                   Start Over
                 </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
