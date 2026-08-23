import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Bell, ArrowRight, HelpCircle, Briefcase, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LATEST_UPDATES, LATEST_BLOGS, COMPLIANCE_TOOLS } from '../data/mockData';

// Extended searchable items list
const SEARCH_COLLECTIONS = [
  ...LATEST_UPDATES.map(u => ({ ...u, type: 'update', path: `/news/article-${u.id}` })),
  ...LATEST_BLOGS.map(b => ({ ...b, type: 'blog', path: `/free-resources/blogs/${b.slug || b.id}` })),
  ...COMPLIANCE_TOOLS.map(t => ({ ...t, type: 'tool', path: `/tools/${t.slug}` })),
  { id: 'job-fme', title: 'IFSCA FME-InterviewPro Simulator', category: 'Products / FME-InterviewPro', summary: 'Role-weighted interview simulator & preparation engine for GIFT IFSC FME compliance roles', type: 'job', path: '/prepare/fme' },
  { id: 'reg-ifsca-fme', title: 'IFSCA Fund Management Regulations 2022', category: 'Interactive Regulations', summary: 'Detailed chapter-wise regulations for Authorised and Registered FMEs in GIFT City', type: 'regulation', path: '/interactive-regulations' },
  { id: 'reg-sebi-aif', title: 'SEBI (Alternative Investment Funds) Regulations', category: 'Interactive Regulations', summary: 'Category I, II, III AIF operational, compliance, and filing rules', type: 'regulation', path: '/interactive-regulations' },
  { id: 'quiz-ifsca-cmi', title: 'IFSCA Capital Markets & Intermediaries Quiz', category: 'Practice Quizzes', summary: '100+ diagnostic questions covering CMI regulations in GIFT IFSC', type: 'quiz', path: '/practice/quizzes' },
  { id: 'quiz-aml', title: 'AML / CFT & PMLA Compliance Quiz', category: 'Practice Quizzes', summary: 'Anti-money laundering reporting and beneficial ownership verification questions', type: 'quiz', path: '/practice/quizzes' }
];

export default function SearchModal({ initialQuery, onClose, onSelectItem }) {
  const [query, setQuery] = useState(initialQuery || '');
  const navigate = useNavigate();

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Smart partial word matching
  const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  const getMatchScore = (item) => {
    if (searchTerms.length === 0) return 0;

    const titleStr = (item.title || '').toLowerCase();
    const catStr = (item.category || item.tag || '').toLowerCase();
    const descStr = (item.summary || item.description || '').toLowerCase();

    let score = 0;

    searchTerms.forEach(term => {
      if (titleStr.includes(term)) {
        score += titleStr.startsWith(term) ? 50 : 30;
      }
      if (catStr.includes(term)) {
        score += 20;
      }
      if (descStr.includes(term)) {
        score += 10;
      }
    });

    return score;
  };

  const results = searchTerms.length === 0 
    ? [] 
    : SEARCH_COLLECTIONS
        .map(item => ({ item, score: getMatchScore(item) }))
        .filter(res => res.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(res => res.item);

  const handleSelect = (item) => {
    if (onSelectItem) onSelectItem(item);
    if (item.path) {
      navigate(item.path);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center space-x-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search regulations, circulars, FME, AIF, tools, quizzes..."
            className="w-full bg-transparent outline-none text-sm text-slate-900 font-semibold placeholder-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-5 overflow-y-auto space-y-3 custom-scrollbar min-h-[250px]">
          
          {query.trim() === '' && (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-slate-400">
                Type keywords such as <strong className="text-slate-700">"IFSCA"</strong>, <strong className="text-slate-700">"FME"</strong>, <strong className="text-slate-700">"AIF"</strong>, or <strong className="text-slate-700">"AML"</strong> to filter across RegMate.
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {['IFSCA FME', 'SEBI AIF', 'Aircraft Leasing', 'ESOP', 'FME-InterviewPro'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold border border-slate-200 cursor-pointer transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() !== '' && results.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-semibold text-slate-600">No results found matching "{query}"</p>
              <p className="text-xs mt-1">Try searching with broader terms like "IFSCA", "Regulations", or "Quiz".</p>
            </div>
          )}

          {results.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/80 cursor-pointer flex items-center justify-between transition-colors group"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-600 group-hover:text-emerald-700 group-hover:border-emerald-300">
                  {item.type === 'update' && <Bell className="w-4 h-4 text-emerald-600" />}
                  {item.type === 'blog' && <BookOpen className="w-4 h-4 text-blue-600" />}
                  {item.type === 'tool' && <FileText className="w-4 h-4 text-purple-600" />}
                  {item.type === 'job' && <Briefcase className="w-4 h-4 text-amber-600" />}
                  {item.type === 'regulation' && <BookOpen className="w-4 h-4 text-emerald-700" />}
                  {item.type === 'quiz' && <HelpCircle className="w-4 h-4 text-teal-600" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 group-hover:bg-emerald-200 group-hover:text-emerald-900">
                      {item.category || item.type}
                    </span>
                    {item.date && <span className="text-[10px] text-slate-400">{item.date}</span>}
                  </div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">{item.title}</div>
                  {item.summary && <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.summary}</div>}
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2" />
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
