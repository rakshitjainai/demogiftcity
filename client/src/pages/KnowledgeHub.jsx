import React from 'react';
import { BookOpen, HelpCircle, GraduationCap, Scale, Briefcase, FileText, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'gift', title: 'GIFT City & IFSC', icon: <Briefcase className="w-6 h-6 text-leaf" />, count: '24 Modules' },
  { id: 'corp', title: 'Corporate Law', icon: <Scale className="w-6 h-6 text-leaf" />, count: '56 Modules' },
  { id: 'capital', title: 'Capital Markets', icon: <FileText className="w-6 h-6 text-leaf" />, count: '38 Modules' },
  { id: 'ipr', title: 'IPR', icon: <BookOpen className="w-6 h-6 text-leaf" />, count: '12 Modules' }
];

export default function KnowledgeHub() {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="text-center mb-12 sm:mb-16">
        <span className="eyebrow block mb-4">§ Knowledge Hub</span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-forest-deep mb-4 sm:mb-6">
          Everything you need to stay compliant.
        </h1>
        <p className="text-base sm:text-xl text-ink-soft max-w-2xl mx-auto">
          Explore our structured regulatory content, practice quizzes, and interactive learning modules.
        </p>
      </div>

      {/* Primary tools grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-12 sm:mb-16">

        <Link to="/interactive-regulations" className="cursor-target block bg-white p-6 sm:p-8 rounded-2xl border border-line card-shadow hover-lift min-h-[160px]">
          <BookOpen className="w-10 h-10 text-leaf mb-5" />
          <h2 className="text-xl sm:text-2xl font-display text-forest-deep mb-3">Interactive Regulations</h2>
          <p className="text-ink-soft text-sm sm:text-base">Browse chapter-wise regulatory content and official text.</p>
        </Link>

        <Link to="/quizzes" className="cursor-target block bg-white p-6 sm:p-8 rounded-2xl border border-line card-shadow hover-lift min-h-[160px]">
          <HelpCircle className="w-10 h-10 text-leaf mb-5" />
          <h2 className="text-xl sm:text-2xl font-display text-forest-deep mb-3">Practice Quizzes</h2>
          <p className="text-ink-soft text-sm sm:text-base">Test your knowledge across various compliance domains.</p>
        </Link>

        <Link to="/learning" className="cursor-target block bg-white p-6 sm:p-8 rounded-2xl border border-line card-shadow hover-lift min-h-[160px]">
          <GraduationCap className="w-10 h-10 text-leaf mb-5" />
          <h2 className="text-xl sm:text-2xl font-display text-forest-deep mb-3">Regulatory Master</h2>
          <p className="text-ink-soft text-sm sm:text-base">
            Structured lessons &amp; diagnostic questions for IFSCA CMI, FME, and SEBI AIF — served securely from the backend.
          </p>
        </Link>

        {/* ExamReady — new card with premium dark styling */}
        <Link
          to="/exam-ready"
          className="cursor-target block bg-gradient-to-br from-forest-deep via-forest to-emerald-800 p-6 sm:p-8 rounded-2xl border border-forest card-shadow hover-lift min-h-[160px] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-mint/10 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-5 group-hover:bg-white/25 transition-colors">
              <Zap className="w-6 h-6 text-gold" />
            </div>
            <h2 className="text-xl sm:text-2xl font-display text-white mb-3">ExamReady</h2>
            <p className="text-white/70 text-sm sm:text-base">
              Full 100-question IFSCA CMI mock test. 90 minutes, −0.25 negative marking, instant results.
            </p>
            <span className="inline-block mt-4 px-2.5 py-0.5 bg-gold/25 text-gold text-[10px] font-bold rounded-full uppercase tracking-wider border border-gold/30">
              New
            </span>
          </div>
        </Link>

      </div>

      {/* Category browser */}
      <div>
        <h3 className="text-xl sm:text-2xl font-display text-forest-deep mb-5 sm:mb-6 text-center">Browse by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="cursor-target bg-paper border border-line p-5 sm:p-6 rounded-xl flex flex-col items-center text-center hover-lift min-h-[120px] justify-center">
              <div className="w-12 h-12 rounded-full bg-mint flex items-center justify-center mb-3 sm:mb-4">
                {cat.icon}
              </div>
              <h4 className="font-semibold text-ink mb-1 text-sm sm:text-base">{cat.title}</h4>
              <span className="text-xs sm:text-sm text-leaf font-medium">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
