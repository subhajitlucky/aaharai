"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen, Leaf, Zap, Droplets } from "lucide-react";

const categories = ["All", "Grains", "Herbs", "Fruits", "Dairy"];

const libraryItems = [
  {
    name: "Jowar (Sorghum)",
    category: "Grains",
    dosha: "Vata & Kapha",
    benefit: "Gluten-free, rich in fiber, and great for heart health.",
    desc: "An ancient grain used for thousands of years in India to make rotis and porridges.",
    color: "bg-turmeric/20",
    icon: Leaf
  },
  {
    name: "Amla (Indian Gooseberry)",
    category: "Fruits",
    dosha: "All (Tridoshic)",
    benefit: "Highest natural source of Vitamin C. Boosts immunity.",
    desc: "Revered as a 'Rasayana' or rejuvenator in Ayurveda for skin and hair.",
    color: "bg-sage/20",
    icon: Zap
  },
  {
    name: "Ashwagandha",
    category: "Herbs",
    dosha: "Vata & Kapha",
    benefit: "Reduces stress and anxiety. Improves strength.",
    desc: "Known as 'Indian Ginseng', it helps the body adapt to stress.",
    color: "bg-clay/10",
    icon: BookOpen
  },
  {
    name: "A2 Gir Cow Ghee",
    category: "Dairy",
    dosha: "Vata & Pitta",
    benefit: "Enhances Ojas (vitality). Good for brain health.",
    desc: "Pure clarified butter made using the traditional Bilona method.",
    color: "bg-turmeric/10",
    icon: Droplets
  },
  {
    name: "Bajra (Pearl Millet)",
    category: "Grains",
    dosha: "Kapha",
    benefit: "Heating quality, perfect for winters. High in iron.",
    desc: "A hardy grain that grows in arid regions of Rajasthan and Gujarat.",
    color: "bg-clay/5",
    icon: Leaf
  },
  {
    name: "Brahmi",
    category: "Herbs",
    dosha: "All (Tridoshic)",
    benefit: "Sharpens memory and concentration.",
    desc: "A creeping herb used to balance the nervous system and mind.",
    color: "bg-sage/10",
    icon: Zap
  }
];

export default function LibraryPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredItems = libraryItems.filter(item => {
    const matchesFilter = filter === "All" || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-5xl font-bold text-charcoal mb-4">Ancient <span className="text-sage">Library</span></h1>
        <p className="text-xl text-charcoal/60">
          Explore the forgotten ingredients that kept our ancestors strong for 5,000 years.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12 bg-white p-4 rounded-3xl shadow-sm border border-charcoal/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search ingredients..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-sand/50 border-none focus:ring-2 focus:ring-sage/20 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                filter === cat 
                ? "bg-charcoal text-white shadow-lg shadow-charcoal/20" 
                : "bg-sand text-charcoal/60 hover:bg-charcoal/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item, idx) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={item.name}
            className="group bg-white rounded-[2.5rem] overflow-hidden border border-charcoal/5 hover:shadow-2xl hover:shadow-charcoal/5 transition-all duration-500"
          >
            <div className={`h-48 ${item.color} flex items-center justify-center relative overflow-hidden`}>
              <item.icon className="w-20 h-20 text-charcoal/10 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-6 right-6 px-3 py-1 bg-white/80 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-widest text-charcoal">
                {item.category}
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-charcoal">{item.name}</h3>
                <span className="text-xs font-bold text-sage uppercase bg-sage/10 px-2 py-1 rounded">
                  {item.dosha}
                </span>
              </div>
              
              <p className="text-charcoal/60 text-sm leading-relaxed mb-6">
                {item.desc}
              </p>

              <div className="pt-6 border-t border-charcoal/5">
                <p className="text-xs font-bold text-charcoal/30 uppercase tracking-widest mb-2">Primary Benefit</p>
                <p className="text-charcoal font-medium text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-clay" />
                  {item.benefit}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
