import React from 'react';
import { X, Calendar, User, Clock, Share2, BookOpen, CheckCircle2, Bookmark } from 'lucide-react';

export default function ArticleModal({ article, onClose }) {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(7,51,33,0.7)] backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] card-shadow" style={{ border: '1px solid var(--line)' }}>
        
        {/* Header */}
        <div className="p-6 flex items-start justify-between" style={{ borderBottom: '1px solid var(--line)', background: 'var(--mint)' }}>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide" style={{ background: 'var(--mint-deep)', color: 'var(--forest)' }}>
                {article.category || article.type || 'Knowledge Hub'}
              </span>
              <span className="text-xs text-slate-400 font-medium">{article.date}</span>
            </div>
            <h2 className="text-xl sm:text-2xl leading-tight" style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, color: 'var(--ink)' }}>
              {article.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors ml-4 flex-shrink-0 hover:bg-white/50"
            style={{ color: 'var(--ink-soft)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 no-scrollbar" style={{ color: 'var(--ink-soft)' }}>
          
          {/* Author & Meta */}
          <div className="flex items-center justify-between p-4 rounded-xl text-xs" style={{ background: 'var(--mint)', border: '1px solid var(--mint-deep)' }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-xs" style={{ background: 'var(--forest)' }}>
                CS
              </div>
              <div>
                <div className="font-bold text-slate-900">{article.author || 'CS Prashant Kumar'}</div>
                <div className="text-[11px] text-slate-500">Corporate & IFSC Regulatory Specialist</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold flex items-center space-x-1" style={{ color: 'var(--forest)' }}>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold flex items-center space-x-1" style={{ color: 'var(--forest)' }}>
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>

          {/* Article Summary Box */}
          <div className="p-4 rounded-xl text-sm font-medium leading-relaxed" style={{ background: 'var(--mint)', borderLeft: '4px solid var(--forest)', color: 'var(--ink)' }}>
            {article.summary}
          </div>

          {/* Detailed Body Paragraphs */}
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
            <p>
              {article.content || article.fullContent || `This guidance document outlines statutory procedures, compliance timelines, and practical implementation frameworks mandated by Indian regulatory bodies.`}
            </p>
            
            <h3 className="text-base font-semibold pt-2" style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--ink)' }}>
              Key Compliance Takeaways for Corporate Secretaries & Practitioners:
            </h3>

            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--leaf)' }} />
                <span>Verify all documentation against current IFSCA/SEBI notifications.</span>
              </li>
              <li className="flex items-start space-x-2 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--leaf)' }} />
                <span>Maintain audit trail records for at least 8 financial years.</span>
              </li>
              <li className="flex items-start space-x-2 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--leaf)' }} />
                <span>Ensure Audit Committee approval prior to execution of contracts.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--line)', background: 'var(--mint)' }}>
          <span className="font-medium" style={{ color: 'var(--ink-soft)' }}>Source: RegMate Knowledge Repository</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-white font-bold transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--forest)' }}
          >
            Close Reader
          </button>
        </div>

      </div>
    </div>
  );
}
