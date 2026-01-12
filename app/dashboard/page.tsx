"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, Leaf, Zap, ChevronRight, History, Search } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  // Mock data for the dashboard - In production, this comes from Prisma/Database
  const stats = {
    currentStreak: 5,
    totalPoints: 1250,
    dosha: "Pitta",
    nextMilestone: 7,
  };

  const recentActivities = [
    { name: "Mung Dal Khichdi", type: "Lunch", date: "Today", points: "+20" },
    { name: "Ragi Pizza Swap", type: "Dinner", date: "Yesterday", points: "+15" },
    { name: "Amla Juice", type: "Breakfast", date: "Yesterday", points: "+10" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-charcoal mb-2">Namaste, Health Seeker</h1>
          <p className="text-charcoal/60">You're on day 5 of your journey to reclaim your ancestral health.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-charcoal/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-clay/10 rounded-full flex items-center justify-center text-clay">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-xs text-charcoal/40 uppercase font-bold tracking-wider">Streak</p>
              <p className="text-xl font-bold text-charcoal">{stats.currentStreak} Days</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-charcoal/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-turmeric/20 rounded-full flex items-center justify-center text-turmeric-700">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-charcoal/40 uppercase font-bold tracking-wider">Points</p>
              <p className="text-xl font-bold text-charcoal">{stats.totalPoints}</p>
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
            <p className="text-white/60 mb-8 max-w-md">Almost there! Complete 2 more days to reach your first weekly milestone and unlock the "Ancient Warrior" badge.</p>
            
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(stats.currentStreak / 21) * 100}%` }}
                className="h-full bg-clay"
              />
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Day {stats.currentStreak}</span>
              <span className="text-white/40">Goal: 21 Days</span>
            </div>
          </div>

          {/* Activity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-sage/10 p-6 rounded-3xl border border-sage/20">
              <div className="w-10 h-10 bg-sage text-white rounded-xl flex items-center justify-center mb-4">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-2">My {stats.dosha} Balance</h3>
              <p className="text-charcoal/60 text-sm mb-4">Your current diet is 85% aligned with your Pitta nature.</p>
              <Link href="/prakriti-test" className="text-sage font-bold text-sm flex items-center gap-1 hover:underline">
                View detailed analysis <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-turmeric/10 p-6 rounded-3xl border border-turmeric/20">
              <div className="w-10 h-10 bg-turmeric text-charcoal rounded-xl flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-2">Swap Master</h3>
              <p className="text-charcoal/60 text-sm mb-4">You've successfully swapped 12 junk items for healthy jewels!</p>
              <Link href="/swapper" className="text-charcoal font-bold text-sm flex items-center gap-1 hover:underline">
                Find new swaps <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="bg-white p-8 rounded-[2rem] border border-charcoal/5 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <History className="w-5 h-5 text-charcoal/40" />
            <h2 className="text-xl font-bold text-charcoal">Recent Activity</h2>
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

          <button className="w-full mt-10 py-4 rounded-xl bg-sand text-charcoal/60 font-bold text-sm hover:bg-charcoal/5 transition-colors">
            View All History
          </button>
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
