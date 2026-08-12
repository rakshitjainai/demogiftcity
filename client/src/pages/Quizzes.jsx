import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const TOPICS = [
  { id: 'sebi-aif-regulations', title: 'SEBI AIF Regulations', desc: 'Category I, II & III AIFs, Angel Funds & PPM rules', badge: 'New Topic' },
  { id: 'corporate-laws', title: 'Corporate Laws', desc: 'Companies Act and related regulations' },
  { id: 'ifsc-regulations', title: 'IFSC Regulations', desc: 'GIFT City, FME, and CMI frameworks' },
  { id: 'capital-markets', title: 'Capital Markets', desc: 'SEBI LODR, ICDR, and PIT' },
  { id: 'ipr', title: 'IPR', desc: 'Trademarks, Patents, and Copyrights' },
  { id: 'general-laws', title: 'General Laws', desc: 'Contract Act, Stamp Act, etc.' }
];

export default function Quizzes() {
  return (
    <div className="py-16 px-6 max-w-6xl mx-auto animate-fade-in-up">
      <div className="text-center mb-16">
        <span className="eyebrow block mb-4">§ Practice</span>
        <h1 className="text-4xl md:text-5xl font-display text-forest-deep mb-6">Practice with Quizzes</h1>
        <p className="text-xl text-ink-soft max-w-2xl mx-auto">
          Topic-wise quizzes across the areas that matter to compliance professionals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOPICS.map(topic => (
          <Link 
            key={topic.id} 
            to={`/quizzes/${topic.id}`}
            className="cursor-target block bg-white border border-line rounded-xl p-6 card-shadow hover-lift group"
          >
            <div className="w-12 h-12 bg-mint rounded-full flex items-center justify-center mb-4 group-hover:bg-leaf group-hover:text-white transition-colors text-forest">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-xl text-forest-deep mb-2">{topic.title}</h3>
            <p className="text-ink-soft text-sm mb-4">{topic.desc}</p>
            <span className="text-xs font-bold uppercase tracking-wider text-gold">Topic-wise quiz</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
