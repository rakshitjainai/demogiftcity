import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { LATEST_BLOGS, LATEST_UPDATES } from '../data/mockData';

const CATEGORIES = [
  'All', 
  'GIFT City & IFSC Law',
  'Corporate Law',
  'Doing Business in India',
  'Incorporation & Structuring',
  'FEMA & FDI Regulations',
  'Corporate Tax Planning',
  'International Taxation',
  'IPR',
  'Docs & Formats',
  'Checklists & Procedures',
  'Capital Markets',
  'Startups / ESOP'
];

export default function News() {
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Combine blogs and updates for a single feed
  const allArticles = [...LATEST_BLOGS, ...LATEST_UPDATES].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const filtered = activeCategory === 'All' 
    ? allArticles 
    : allArticles.filter(a => a.tag === activeCategory || a.category === activeCategory);

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="text-center mb-10 sm:mb-12">
        <span className="eyebrow block mb-4">§ News & Articles</span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-forest-deep mb-4 sm:mb-6">Stay Ahead of the Curve</h1>
        <p className="text-base sm:text-xl text-ink-soft max-w-2xl mx-auto">
          Regulatory updates, expert analyses, and practical guides by CS Prashant Kumar.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-10 sm:mb-12 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`cursor-target px-4 py-2 rounded-full font-medium transition-colors flex-shrink-0 whitespace-nowrap min-h-[40px] text-sm ${
              activeCategory === cat 
                ? 'bg-forest text-white' 
                : 'bg-white border border-line text-ink-soft hover:bg-mint hover:text-forest'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(article => (
          <Link
            key={article.id}
            to={`/news/article-${article.id}`}
            className="cursor-target group flex flex-col bg-white border border-line rounded-xl overflow-hidden card-shadow hover-lift"
          >
            {article.image && (
              <div className="h-48 bg-line relative overflow-hidden">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-leaf bg-mint px-2 py-1 rounded">
                  {article.tag || article.category}
                </span>
                <span className="text-sm text-ink-soft flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {article.date}
                </span>
              </div>
              <h3 className="font-semibold text-xl text-forest-deep mb-3 line-clamp-2">{article.title}</h3>
              <p className="text-ink-soft text-sm mb-6 line-clamp-3">{article.desc || 'Comprehensive analysis of the latest regulatory shifts and compliance requirements.'}</p>
              
              <span className="mt-auto inline-flex items-center text-leaf font-semibold text-sm group-hover:text-leaf-bright transition-colors">
                Read Article <ArrowRight className="w-4 h-4 ml-2" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
