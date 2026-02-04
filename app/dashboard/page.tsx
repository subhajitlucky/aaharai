"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Leaf, Zap, ChevronRight, History, Search, Scale, Coffee, ThermometerSun } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [dosha, setDosha] = useState("Pitta");
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [points, setPoints] = useState(1250);
  const [streak, setStreak] = useState(5);

  useEffect(() => {
    // 1. Load Dosha
    const savedDosha = localStorage.getItem("aaharai_dosha");
    if (savedDosha) setDosha(savedDosha);

    // 2. Load Real Activities from Scanner
    const savedLogs = localStorage.getItem("aaharai_prana_log");
    const savedSwaps = localStorage.getItem("aaharai_swaps");
    
    let combined: any[] = [];
    if (savedLogs) {
      const logs = JSON.parse(savedLogs);
      combined = [...combined, ...logs.map((l: any) => ({
        name: l.items?.[0] || "Ancient Meal",
        type: l.category,
        date: new Date(l.date).toLocaleDateString(),
        points: `+${Math.floor(l.score / 5)}`,
        icon: "meal"
      }))];
    }
    if (savedSwaps) {
      const swaps = JSON.parse(savedSwaps);
      combined = [...combined, ...swaps.map((s: any) => ({
        name: s.name,
        type: "Swap",
        date: new Date(s.date).toLocaleDateString(),
        points: "+15",
        icon: "swap"
      }))];
    }

    if (combined.length > 0) {
      setRecentActivities(combined.slice(0, 5));
      // Simple points calculation: base 1000 + accumulated
      const activityPoints = combined.reduce((acc, curr) => acc + parseInt(recentActivities[0]?.points || "0"), 0);
      setPoints(1000 + activityPoints);
      setStreak(Math.max(1, combined.length));
    } else {
      // Mock data if empty
      setRecentActivities([
        { name: "Mung Dal Khichdi", type: "Lunch", date: "Today", points: "+20", icon: "meal" },
        { name: "Ragi Pizza Swap", type: "Dinner", date: "Yesterday", points: "+15", icon: "swap" },
      ]);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-charcoal mb-2 text-balance text-left">Namaste, Health Seeker</h1>
          <p className="text-charcoal/60">Your journey to reclaim ancestral health is active.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-charcoal/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-clay/10 rounded-full flex items-center justify-center text-clay">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-xs text-charcoal/40 uppercase font-bold tracking-wider">Streak</p>
              <p className="text-xl font-bold text-charcoal">{streak} Days</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-charcoal/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-turmeric/20 rounded-full flex items-center justify-center text-turmeric-700">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-charcoal/40 uppercase font-bold tracking-wider">Points</p>
              <p className="text-xl font-bold text-charcoal">{points}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Goal */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Progress Card */}
          <div className="bg-charcoal text-white p-8 rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Zap className="w-32 h-32" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4">21-Day Satvik Challenge</h2>
            <p className="text-white/60 mb-8 max-w-md">Align your gut with your ancestors. Reach 21 days to unlock the "Ancient Warrior" badge.</p>
            
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(streak / 21) * 100}%` }}
                className="h-full bg-clay"
              />
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Day {streak}</span>
              <span className="text-white/40">Goal: 21 Days</span>
            </div>
          </div>

          {/* Activity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-sage/10 p-6 rounded-3xl border border-sage/20">
              <div className="w-10 h-10 bg-sage text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-sage/20">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-2">My {dosha} Nature</h3>
              <p className="text-charcoal/60 text-sm mb-4">Your rituals are currently tuned to balance your {dosha} dominance.</p>
              <Link href="/prakriti-test" className="text-sage font-bold text-sm flex items-center gap-1 hover:underline">
                Recalibrate Prakriti <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-turmeric/10 p-6 rounded-3xl border border-turmeric/20">
              <div className="w-10 h-10 bg-turmeric text-charcoal rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-turmeric/20">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-2">Ancient Rituals</h3>
              <p className="text-charcoal/60 text-sm mb-4">Your Daily Dinacharya helps you stay in sync with the cosmic clock.</p>
              <Link href="/dinacharya" className="text-charcoal font-bold text-sm flex items-center gap-1 hover:underline">
                View Daily Schedule <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Seasonal Context (New Feature) */}
          <div className="bg-clay/5 p-8 rounded-[2rem] border border-clay/10 flex items-center gap-6">
            <div className="w-16 h-16 bg-clay/10 rounded-2xl flex items-center justify-center text-clay shrink-0">
              <ThermometerSun size={32} />
            </div>
            <div>
              <h3 className="font-bold text-charcoal text-lg">Seasonal Wisdom (Ritucharya)</h3>
              <p className="text-sm text-charcoal/60 leading-relaxed">It's currently Vata season. Prioritize warm, unctuous (oily) foods and avoid cold salads to maintain digestive fire.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="bg-white p-8 rounded-[2rem] border border-charcoal/5 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <History className="w-5 h-5 text-charcoal/40" />
            <h2 className="text-xl font-bold text-charcoal">Sacred Log</h2>
          </div>
          
          <div className="space-y-6">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-charcoal/40 group-hover:bg-clay/10 group-hover:text-clay transition-colors">
                    <UtensilsIcon size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-charcoal text-sm">{activity.name}</p>
                    <p className="text-xs text-charcoal/40">{activity.type} • {activity.date}</p>
                  </div>
                </div>
                <span className="text-sage font-bold text-sm">{activity.points}</span>
              </div>
            ))}
          </div>

          <Link href="/scanner" className="block w-full mt-10">
            <button className="w-full py-4 rounded-xl bg-charcoal text-white font-bold text-sm hover:bg-charcoal/90 transition-all shadow-lg shadow-charcoal/20">
              Analyze New Meal
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}

// Simple internal icon component for the activity list
function UtensilsIcon({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}
