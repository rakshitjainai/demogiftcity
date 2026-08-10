import React from 'react';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Membership() {
  return (
    <div className="py-16 px-6 max-w-5xl mx-auto animate-fade-in-up">
      <div className="text-center mb-16">
        <span className="eyebrow block mb-4">§ Premium Access</span>
        <h1 className="text-4xl md:text-5xl font-display text-forest-deep mb-6">RegMate Premium</h1>
        <p className="text-xl text-ink-soft max-w-2xl mx-auto">
          More than articles — unlock the full suite of compliance tools, learning modules, and expert resources.
        </p>
      </div>

      <div className="max-w-md mx-auto bg-white border-2 border-gold rounded-3xl p-8 md:p-10 card-shadow relative hover-lift">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gold text-white font-bold tracking-wider uppercase text-sm px-6 py-2 rounded-full flex items-center gap-2">
          <Star className="w-4 h-4 fill-current" /> Most Popular
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display text-forest-deep mb-2">Annual Membership</h2>
          <div className="flex items-end justify-center gap-1 mb-2">
            <span className="text-4xl font-display text-forest-deep">₹1,999</span>
            <span className="text-ink-soft mb-1">/ year</span>
          </div>
          <p className="text-sm text-ink-soft">Billed annually. Cancel anytime.</p>
        </div>

        <ul className="space-y-4 mb-10">
          {[
            'Unlimited access to Learning Modules',
            'Interactive Regulations browser',
            'Practice Quizzes by subject',
            'Diagnostic Tests for compliance readiness',
            'Downloadable Templates & Checklists',
            'Early access to new features'
          ].map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-mint flex-shrink-0 flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-leaf font-bold" />
              </div>
              <span className="text-ink-soft">{feature}</span>
            </li>
          ))}
        </ul>

        <button className="cursor-target w-full py-4 bg-forest text-white rounded-full font-medium hover-lift shadow-lg text-lg">
          Become a Member
        </button>
        <p className="text-center text-xs text-ink-soft mt-4">
          Secure payment. 14-day money-back guarantee.
        </p>
      </div>
    </div>
  );
}
