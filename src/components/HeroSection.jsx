import React, { useState } from 'react';
import { Search, BookOpen, GraduationCap, Calendar, Wrench, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import HeroIllustration from './HeroIllustration';
import { POPULAR_SEARCHES } from '../data/mockData';

export default function HeroSection({ onSearchSubmit, onSelectPill, onOpenTool }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearchSubmit(searchTerm);
    }
  };

  const featureCards = [
    {
      title: "Interactive Regulations",
      desc: "Chapter-wise, Section-wise interpretation & more",
      icon: BookOpen,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      title: "Learning & Quizzes",
      desc: "Learn, Test and Get Certified",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      title: "Compliance Calendar",
      desc: "Never miss a due date with automated alerts",
      icon: Calendar,
      color: "bg-amber-50 text-amber-700 border-amber-200"
    },
    {
      title: "Smart Tools & Templates",
      desc: "Save time with practical tools and documents",
      icon: Wrench,
      color: "bg-purple-50 text-purple-700 border-purple-200"
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-12 lg:py-16 border-b border-slate-200">
      
      {/* Background Subtle Grid Lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0B5C36_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Search & Popular Pills (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-reg-green animate-ping"></span>
              <span className="flex h-2 w-2 rounded-full bg-reg-green -ml-4"></span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>India's Premier Corporate & GIFT City IFSC Compliance Hub</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              Your Complete Companion for{' '}
              <span className="block mt-1">
                Regulations, <span className="text-blue-600 underline decoration-blue-300 decoration-wavy decoration-2">Learning</span> & <span className="text-reg-green">Compliance</span>
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
              Smart tools, expert insights and interactive learning to help professionals navigate complex laws with confidence.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="pt-2">
              <div className="relative flex items-center shadow-lg shadow-slate-200/80 rounded-2xl bg-white border border-slate-200 p-1.5 focus-within:border-reg-green focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3.5 flex-shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search laws, regulations, sections, topics…"
                  className="w-full pl-3 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none font-medium"
                />
                <button
                  type="submit"
                  className="bg-reg-green hover:bg-reg-green-dark text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md shadow-emerald-900/20 transition-all flex items-center space-x-2 flex-shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Popular Searches Pills */}
            <div className="pt-1">
              <div className="flex items-center space-x-2 mb-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Popular Searches:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((pill, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchTerm(pill);
                      onSelectPill(pill);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-reg-green text-xs font-semibold rounded-full shadow-xs transition-all hover:scale-105 active:scale-95"
                  >
                    #{pill}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Illustration & Feature Stack (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-6">
            
            {/* Top: Vector SVG Illustration */}
            <div className="w-full flex justify-center">
              <HeroIllustration />
            </div>

            {/* Bottom: Stacked Feature List Card (4 Items) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Key Platform Features
                </h3>
                <span className="text-xs font-bold text-reg-green bg-emerald-50 px-2 py-0.5 rounded">
                  All-in-One
                </span>
              </div>

              <div className="space-y-3">
                {featureCards.map((feat, idx) => {
                  const IconComp = feat.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => onOpenTool && onOpenTool(feat.title)}
                      className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
                    >
                      <div className={`p-2.5 rounded-xl ${feat.color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-reg-green transition-colors flex items-center justify-between">
                          <span>{feat.title}</span>
                          <span className="opacity-0 group-hover:opacity-100 text-reg-green transition-opacity text-xs">→</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
