import React from 'react';
import { X, Calendar, User, Clock, Share2, BookOpen, CheckCircle2, Bookmark } from 'lucide-react';

export default function ArticleModal({ article, onClose }) {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                {article.category || article.type || 'Knowledge Hub'}
              </span>
              <span className="text-xs text-slate-400 font-medium">{article.date}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {article.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-4 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 custom-scrollbar">
          
          {/* Author & Meta */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-reg-green text-white font-black flex items-center justify-center">
                CS
              </div>
              <div>
                <div className="font-bold text-slate-900">{article.author || 'CS Prashant Kumar'}</div>
                <div className="text-[11px] text-slate-500">Corporate & IFSC Regulatory Specialist</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg bg-white border border-slate-200 hover:text-reg-green text-slate-600 font-bold flex items-center space-x-1">
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button className="p-2 rounded-lg bg-white border border-slate-200 hover:text-reg-green text-slate-600 font-bold flex items-center space-x-1">
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>

          {/* Article Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-reg-green text-sm text-slate-700 font-medium leading-relaxed">
            {article.summary}
          </div>

          {/* Detailed Body Paragraphs */}
          <div className="space-y-4 text-sm leading-relaxed text-slate-800">
            <p>
              {article.content || article.fullContent || `This guidance document outlines statutory procedures, compliance timelines, and practical implementation frameworks mandated by Indian regulatory bodies.`}
            </p>
            
            <h3 className="text-base font-extrabold text-slate-900 pt-2">
              Key Compliance Takeaways for Corporate Secretaries & Practitioners:
            </h3>

            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-reg-green flex-shrink-0 mt-0.5" />
                <span>Verify all documentation against current IFSCA/SEBI notifications.</span>
              </li>
              <li className="flex items-start space-x-2 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-reg-green flex-shrink-0 mt-0.5" />
                <span>Maintain audit trail records for at least 8 financial years.</span>
              </li>
              <li className="flex items-start space-x-2 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-reg-green flex-shrink-0 mt-0.5" />
                <span>Ensure Audit Committee approval prior to execution of contracts.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Source: RegMate Knowledge Repository</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-reg-green text-white font-bold hover:bg-reg-green-dark transition-colors"
          >
            Close Reader
          </button>
        </div>

      </div>
    </div>
  );
}
