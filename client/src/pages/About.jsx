import React from 'react';
import { Globe, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto animate-fade-in-up">
      <div className="text-center mb-12 sm:mb-16">
        <span className="eyebrow block mb-4">§ About Us</span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-forest-deep mb-4 sm:mb-6">Our Mission</h1>
        <p className="text-base sm:text-xl text-ink-soft max-w-3xl mx-auto leading-relaxed">
          To empower professionals with structured regulatory intelligence, practical learning, and the tools needed to stay ahead in a complex compliance landscape.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
        <div className="order-2 md:order-1">
          <h2 className="text-3xl font-display text-forest-deep mb-6">The RegMate Story</h2>
          <div className="space-y-4 text-ink-soft text-lg">
            <p>
              Navigating regulations shouldn't mean drowning in unstructured PDFs and scattered notifications. RegMate was born from a simple realization: compliance professionals spend too much time searching and structuring data, and not enough time analyzing and advising.
            </p>
            <p>
              We built this platform to bring regulatory content, learning modules, quizzes, practical resources, and compliance tools into one unified, professional experience.
            </p>
          </div>
        </div>
        <div className="order-1 md:order-2 h-80 rounded-2xl bg-forest-deep overflow-hidden relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute inset-0 flex items-center justify-center p-8">
             <div className="text-white font-display text-4xl text-center leading-tight">
               "Navigate Regulations.<br/><span className="text-gold">Stay Ahead.</span>"
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 md:p-12 card-shadow">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-start">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-mint-deep flex-shrink-0 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
             <span className="text-3xl sm:text-4xl font-display text-forest">PK</span>
          </div>
          <div>
            <span className="eyebrow block mb-2">§ Founder &amp; Author</span>
            <h2 className="text-2xl sm:text-3xl font-display text-forest-deep mb-2">CS Prashant Kumar</h2>
            <p className="text-leaf font-medium mb-4 sm:mb-6">Company Secretary &amp; Compliance Expert</p>
            
            <p className="text-ink-soft mb-4 leading-relaxed">
              With over a decade of hands-on experience in corporate law, compliance, and regulatory advisory, Prashant curates and authors the insights on RegMate. As a Partner at a full-service Indian law firm, his daily practice revolves around cross-border structuring, FEMA compliance, IP protection, and advanced corporate governance for both rapid-growth startups and established enterprises.
            </p>
            <p className="text-ink-soft mb-6 leading-relaxed">
              He frequently writes and speaks on demystifying complex regulatory frameworks, ensuring that founders, CFOs, and compliance professionals have access to clear, actionable intelligence.
            </p>
            
            <div className="flex gap-3">
              <button className="cursor-target p-3 rounded-full bg-paper border border-line hover:bg-mint text-forest transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </button>
              <button className="cursor-target p-3 rounded-full bg-paper border border-line hover:bg-mint text-forest transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
