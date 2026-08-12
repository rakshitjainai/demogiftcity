import React, { useState } from 'react';
import { Search, X, BookOpen, Bell, ArrowRight } from 'lucide-react';
import { LATEST_UPDATES, LATEST_BLOGS, COMPLIANCE_TOOLS } from '../data/mockData';

export default function SearchModal({ initialQuery, onClose, onSelectItem }) {
  const [query, setQuery] = useState(initialQuery || '');

  // Filter content matching search query
  const filteredUpdates = LATEST_UPDATES.filter(u =>
    u.title.toLowerCase().includes(query.toLowerCase()) ||
    (u.summary || '').toLowerCase().includes(query.toLowerCase()) ||
    (u.category || '').toLowerCase().includes(query.toLowerCase())
  );

  const filteredBlogs = LATEST_BLOGS.filter(b =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(query.toLowerCase()) ||
    (b.summary || '').toLowerCase().includes(query.toLowerCase())
  );

  const filteredTools = COMPLIANCE_TOOLS.filter(t =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center space-x-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search regulations, IFSCA circulars, Companies Act, tools..."
            className="w-full bg-transparent outline-none text-sm text-slate-900 font-semibold placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
          
          {query.trim() === '' && (
            <div className="text-center py-8 text-xs text-slate-400">
              Type keywords such as <strong className="text-slate-700">"IFSCA"</strong>, <strong className="text-slate-700">"Related Party"</strong>, or <strong className="text-slate-700">"AML"</strong> to filter regulations & tools.
            </div>
          )}

          {/* Regulatory Updates Section */}
          {filteredUpdates.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Bell className="w-3.5 h-3.5 text-reg-green" />
                <span>Circulars & Amendments ({filteredUpdates.length})</span>
              </h4>
              {filteredUpdates.map(up => (
                <div
                  key={up.id}
                  onClick={() => { onSelectItem(up); onClose(); }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/80 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{up.category || 'Update'}</span>
                      <span className="text-[10px] text-slate-400">{up.date}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">{up.title}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Blogs & Articles Section */}
          {filteredBlogs.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Articles & Guides ({filteredBlogs.length})</span>
              </h4>
              {filteredBlogs.map(b => (
                <div
                  key={b.id}
                  onClick={() => { onSelectItem(b); onClose(); }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-[10px] font-semibold text-blue-600 mb-0.5">{b.category} • {b.author}</div>
                    <div className="text-xs font-bold text-slate-900">{b.title}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Tools Section */}
          {filteredTools.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <span>Tools & Calculators ({filteredTools.length})</span>
              </h4>
              {filteredTools.map(t => (
                <div
                  key={t.id}
                  onClick={() => { onSelectItem(t); onClose(); }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/80 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">{t.tag}</span>
                    <div className="text-xs font-bold text-slate-900 mt-1">{t.title}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
