"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Zap, ChevronRight, History, Scale, Coffee, ThermometerSun, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

interface SeasonalAdvice {
  food?: string;
  ritual?: string;
}

interface SeasonalData {
  location?: string;
  temperature?: number | string;
  season?: string;
  advice?: SeasonalAdvice;
}

interface Activity {
  name: string;
  type?: string;
  date: string;
  points: string;
  icon: string;
}

export default function Dashboard() {
  const [dosha, setDosha] = useState("Pitta");
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [seasonalData, setSeasonalData] = useState<SeasonalData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    // 1. Load Dosha
    const savedDosha = localStorage.getItem("aaharai_dosha");
    if (savedDosha) setDosha(savedDosha);

    // 2. Load Real Activities from Scanner
    const savedLogs = localStorage.getItem("aaharai_prana_log");
    const savedSwaps = localStorage.getItem("aaharai_swaps");
    
    let combined: Activity[] = [];
    if (savedLogs) {
      const logs = JSON.parse(savedLogs) as { items?: string[]; category?: string; date?: string; score?: number }[];
      combined = [...combined, ...logs.map((l) => ({
        name: l.items?.[0] || "Ancient Meal",
        type: l.category,
        date: new Date(l.date ?? Date.now()).toLocaleDateString(),
        points: `+${Math.floor((l.score ?? 0) / 5)}`,
        icon: "meal"
      }))];
    }
    if (savedSwaps) {
      const swaps = JSON.parse(savedSwaps) as { name?: string; date?: string }[];
      combined = [...combined, ...swaps.map((s) => ({
        name: s.name ?? "Swap",
        type: "Swap",
        date: new Date(s.date ?? Date.now()).toLocaleDateString(),
        points: "+15",
        icon: "swap"
      }))];
    }

    // Honesty policy: never fabricate activity. Show zeros until the user logs.
    if (combined.length > 0) {
      setRecentActivities(combined.slice(0, 5));
      const activityPoints = combined.reduce((acc, curr) => acc + parseInt(curr.points || "0"), 0);
      setPoints(activityPoints);
      const activeDays = new Set(combined.map((c) => c.date)).size;
      setStreak(activeDays);
    }

    // 3. Fetch Seasonal Wisdom (Ritucharya)
    const fetchRitucharya = async (lat?: number, lon?: number) => {
      try {
        const url = lat ? `/api/ritucharya?lat=${lat}&lon=${lon}` : '/api/ritucharya';
        const res = await fetch(url);
        const data = await res.json();
        setSeasonalData(data);
      } catch (e) {
        console.error("Failed to load seasonal wisdom", e);
      } finally {
        setWeatherLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchRitucharya(pos.coords.latitude, pos.coords.longitude),
        () => fetchRitucharya() // Fallback to default
      );
    } else {
      fetchRitucharya();
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
            <p className="text-white/60 mb-8 max-w-md">Align your gut with your ancestors. Reach 21 days to unlock the &quot;Ancient Warrior&quot; badge.</p>
            
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

          {/* Seasonal Context (Real Data Integration) */}
          <div className="bg-clay/5 p-8 rounded-[2rem] border border-clay/10 relative overflow-hidden group">
            <div className="absolute top-4 right-8 flex items-center gap-2 text-[10px] font-bold text-clay uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full border border-clay/10 shadow-sm">
              <MapPin size={10} /> {weatherLoading ? "Locating..." : seasonalData?.location === "detected" ? "Your Location" : "Vedic Zone"}
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-clay/10 rounded-2xl flex flex-col items-center justify-center text-clay shrink-0">
                {weatherLoading ? (
                  <Sparkles className="animate-spin w-8 h-8" />
                ) : (
                  <>
                    <span className="text-xs font-black leading-none mb-1">{seasonalData?.temperature}°C</span>
                    <ThermometerSun size={24} />
                  </>
                )}
              </div>
              <div>
                <h3 className="font-bold text-charcoal text-lg mb-1 flex items-center gap-2">
                  Seasonal Wisdom ({seasonalData?.season || "Ritucharya"})
                </h3>
                <p className="text-sm text-charcoal/60 leading-relaxed mb-4">
                  {seasonalData?.advice?.food || "Loading ancient seasonal guidance..."}
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-clay bg-clay/10 px-3 py-1.5 rounded-lg w-fit">
                  <Zap size={12} /> {seasonalData?.advice?.ritual}
                </div>
              </div>
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
            {recentActivities.length === 0 && (
              <div className="text-center py-10 border border-dashed border-charcoal/10 rounded-2xl">
                <p className="text-charcoal/50 text-sm mb-1">Your Sacred Log is empty.</p>
                <p className="text-charcoal/30 text-xs">Analyze your first meal below to begin your journey.</p>
              </div>
            )}
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
