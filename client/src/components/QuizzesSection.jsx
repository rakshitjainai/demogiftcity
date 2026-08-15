import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Building2, Globe, TrendingUp, Shield, Scale } from 'lucide-react';

const TOPICS = [
  { id: 'sebi-aif-regulations', title: 'SEBI AIF Regulations', icon: Layers, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { id: 'corporate-laws', title: 'Corporate Laws', icon: Building2, color: 'text-blue-700', bg: 'bg-blue-50' },
  { id: 'ifsc-regulations', title: 'IFSC Regulations', icon: Globe, color: 'text-teal-700', bg: 'bg-teal-50' },
  { id: 'capital-markets', title: 'Capital Markets', icon: TrendingUp, color: 'text-amber-700', bg: 'bg-amber-50' },
  { id: 'ipr', title: 'IPR', icon: Shield, color: 'text-rose-700', bg: 'bg-rose-50' },
  { id: 'general-laws', title: 'General Laws', icon: Scale, color: 'text-violet-700', bg: 'bg-violet-50' },
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
          <Link to="/quizzes" className="cursor-target inline-flex items-center gap-2 text-leaf font-bold hover:text-leaf-bright transition-colors group">
            View All Quizzes <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <Link
                key={topic.id}
                to={`/quizzes/${topic.id}`}
                className="cursor-target group bg-paper border border-line rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-leaf hover:bg-mint transition-colors hover-lift"
              >
                <div className={`w-12 h-12 rounded-full ${topic.bg} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${topic.color}`} />
                </div>
                <h3 className="font-semibold text-ink leading-tight">{topic.title}</h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
