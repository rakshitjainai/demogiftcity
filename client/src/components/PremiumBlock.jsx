import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function PremiumBlock() {
  return (
    <section className="py-16 bg-paper px-6">
      <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden card-shadow bg-forest flex flex-col md:flex-row border border-forest-deep relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="p-10 md:p-12 flex-1 relative z-10 flex flex-col justify-center">
          <span className="eyebrow text-gold mb-4 block">§ RegMate Premium</span>
          <h2 className="text-3xl md:text-4xl font-display text-white mb-6">More than articles.</h2>
          <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
            Get unlimited access to learning modules, interactive regulations, quizzes, diagnostic tests, templates and professional resources.
          </p>
          <div className="flex items-center gap-4">
            <button className="cursor-target px-8 py-3.5 bg-gold text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 hover:bg-gold-soft hover:text-forest-deep">
              Become a Member
            </button>
            <span className="text-white/60 font-medium">Cancel anytime</span>
          </div>
        </div>
        <div className="bg-forest-deep p-10 md:p-12 w-full md:w-80 flex flex-col justify-center border-l border-white/10 relative z-10">
          <div className="text-white text-5xl font-display mb-2">₹1,999<span className="text-xl text-white/50 font-sans font-medium"> / year</span></div>
          <p className="text-white/60 text-sm mb-8">Less than ₹170/month</p>
          <ul className="space-y-4 text-white/80 text-sm font-medium">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" /> Interactive Regulations
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" /> Premium Learning Modules
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" /> Full Template Library
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" /> Advanced Diagnostic Tests
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
