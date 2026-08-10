import React from 'react';
import { ArrowRight, HelpCircle } from 'lucide-react';

const TOPICS = [
  'Corporate Laws',
  'IFSC Regulations',
  'Capital Markets',
  'IPR',
  'General Laws'
];

export default function QuizzesSection() {
  return (
    <section className="py-16 bg-white px-6 border-b border-line">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="eyebrow flex items-center gap-2 mb-2">
              <span className="text-leaf">§</span>
              <span className="text-ink-soft">Test Your Knowledge</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display text-forest-deep mb-3">Practice with Quizzes</h2>
            <p className="text-lg text-ink-soft max-w-xl">
              Topic-wise quizzes across the areas that matter to compliance professionals.
            </p>
          </div>
          <a href="/knowledge-hub" className="cursor-target inline-flex items-center gap-2 text-leaf font-bold hover:text-leaf-bright transition-colors group">
            View All Quizzes <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {TOPICS.map((topic, i) => (
            <div key={i} className="cursor-target group bg-paper border border-line rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-leaf hover:bg-mint transition-colors hover-lift">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <HelpCircle className="w-6 h-6 text-forest" />
              </div>
              <h3 className="font-semibold text-ink leading-tight">{topic}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
