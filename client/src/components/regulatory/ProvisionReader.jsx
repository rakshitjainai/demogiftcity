import React, { useState } from 'react';
import { Copy, Check, Bookmark, Share2, Sparkles, BookOpen, FileText, Download, Printer } from 'lucide-react';

export default function ProvisionReader({ provision, chapterTitle, actTitle, onBookmark, isBookmarked }) {
  const [copied, setCopied] = useState(false);

  if (!provision) {
    return (
      <div className="p-8 text-center text-ink-soft bg-white rounded-2xl border border-line">
        Select a provision from the table of contents to begin reading.
      </div>
    );
  }

  const handleCopy = () => {
    const textToCopy = `${provision.heading}\n\n${provision.text}\n\nSource: ${provision.source_reference}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-line card-shadow overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-line bg-paper/50 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gold">
            {chapterTitle || 'Chapter Provision'}
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-forest-deep">
            {provision.heading}
          </h2>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            title="Copy statutory text"
            className="p-2 rounded-lg border border-line text-ink-soft hover:text-forest hover:bg-mint transition-colors text-xs font-medium flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          {onBookmark && (
            <button
              onClick={() => onBookmark(provision)}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Provision"}
              className={`p-2 rounded-lg border border-line transition-colors text-xs font-medium flex items-center gap-1.5 ${
                isBookmarked ? 'bg-amber-50 border-amber-300 text-amber-700' : 'text-ink-soft hover:text-forest hover:bg-mint'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Statutory Text Body */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="relative">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-forest" />
            <span>Statutory / Official Text</span>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 text-ink leading-relaxed font-serif text-[15px] sm:text-base whitespace-pre-wrap selection:bg-mint selection:text-forest">
            {provision.text || 'Official text not available.'}
          </div>
        </div>

        {/* Source citation footnote */}
        {provision.source_reference && (
          <div className="text-xs text-ink-soft border-t border-line/60 pt-3 flex items-start gap-2">
            <strong className="text-forest font-semibold flex-shrink-0">Citation:</strong>
            <span className="italic">{provision.source_reference}</span>
          </div>
        )}
      </div>
    </div>
  );
}
