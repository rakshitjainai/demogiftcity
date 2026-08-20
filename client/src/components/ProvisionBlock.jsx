import React, { useState } from 'react';
import { BookOpen, Sparkles, AlertCircle, Link2, Copy, Check, Bookmark, Share2 } from 'lucide-react';

/**
 * ProvisionBlock per Doc 06 §27:
 * Visually distinguishes:
 * 1. Statutory Provision Text (verbatim legal text with serif font and left green bar)
 * 2. RegMate Plain English Explanation (light green/mint background with sparkle icon)
 * 3. Practical Implication / Compliance Notes (subtle amber/gold border and warning badge)
 * 4. Regulatory Reference & Source (official gazette/circular cite)
 */
export default function ProvisionBlock({
  sectionNumber,
  sectionTitle,
  statutoryText,
  explanationText,
  practicalImplications = [],
  regulatorySource,
  amendments = [],
  effectiveDate,
  actName,
  onBookmark,
  isBookmarked = false,
  className = ''
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'explanation' | 'implications' | 'amendments'

  const handleCopy = () => {
    const textToCopy = `Section ${sectionNumber || ''}: ${sectionTitle || ''}\n\nStatutory Text:\n${statutoryText || ''}\n\nRegMate Explanation:\n${explanationText || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border border-line card-shadow overflow-hidden transition-all ${className}`}>
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-forest to-forest-deep px-5 py-4 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-leaf text-white font-bold text-xs">
            § {sectionNumber || 'Sec'}
          </span>
          <h3 className="font-display font-semibold text-base sm:text-lg text-white">
            {sectionTitle || 'Section Provision'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {effectiveDate && (
            <span className="text-[11px] bg-white/10 text-mint px-2.5 py-1 rounded-md">
              Effective: {effectiveDate}
            </span>
          )}
          <button
            onClick={handleCopy}
            title="Copy provision text"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-mint hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-leaf-bright" /> : <Copy className="w-4 h-4" />}
          </button>
          {onBookmark && (
            <button
              onClick={onBookmark}
              title="Bookmark provision"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isBookmarked ? 'bg-gold text-white' : 'bg-white/10 hover:bg-white/20 text-mint'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-line bg-mint/40 px-4 pt-2 gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'text'
              ? 'bg-white text-forest border-t-2 border-forest shadow-sm'
              : 'text-ink-soft hover:text-forest'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Statutory Text
        </button>
        {explanationText && (
          <button
            onClick={() => setActiveTab('explanation')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'explanation'
                ? 'bg-white text-forest border-t-2 border-forest shadow-sm'
                : 'text-ink-soft hover:text-forest'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-leaf" />
            Plain-English Analysis
          </button>
        )}
        {practicalImplications && practicalImplications.length > 0 && (
          <button
            onClick={() => setActiveTab('implications')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'implications'
                ? 'bg-white text-forest border-t-2 border-forest shadow-sm'
                : 'text-ink-soft hover:text-forest'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-gold" />
            Practical Implications ({practicalImplications.length})
          </button>
        )}
        {amendments && amendments.length > 0 && (
          <button
            onClick={() => setActiveTab('amendments')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'amendments'
                ? 'bg-white text-forest border-t-2 border-forest shadow-sm'
                : 'text-ink-soft hover:text-forest'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-accent-blue inline-block"></span>
            Amendments ({amendments.length})
          </button>
        )}
      </div>

      {/* Tab Content Panels */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* 1. Statutory Text */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="pl-4 border-l-4 border-forest bg-paper py-3 pr-3 rounded-r-xl">
              <p className="text-sm sm:text-base leading-relaxed text-ink font-serif whitespace-pre-line">
                {statutoryText || 'No statutory text provided for this section.'}
              </p>
            </div>
            {regulatorySource && (
              <div className="flex items-center gap-2 text-xs text-ink-soft bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                <Link2 className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                <span className="font-semibold text-forest">Source:</span>
                <span className="truncate">{regulatorySource}</span>
              </div>
            )}
          </div>
        )}

        {/* 2. Plain English Explanation */}
        {activeTab === 'explanation' && (
          <div className="bg-gradient-to-br from-mint to-white p-5 rounded-xl border border-mint-deep space-y-3">
            <div className="flex items-center gap-2 text-forest font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-leaf" />
              <span>RegMate Plain-English Breakdown</span>
            </div>
            <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
              {explanationText || 'Detailed commentary and plain-English breakdown available for RegLens subscribers.'}
            </p>
          </div>
        )}

        {/* 3. Practical Implications */}
        {activeTab === 'implications' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Compliance & Filing Checkpoints</span>
            </div>
            <ul className="space-y-2.5">
              {practicalImplications.map((imp, i) => (
                <li key={i} className="flex items-start gap-2.5 bg-amber-50/60 border border-amber-200/70 p-3 rounded-xl text-xs sm:text-sm text-ink-soft leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. Amendments */}
        {activeTab === 'amendments' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-forest">
              Legislative History & Gazette Notifications
            </h4>
            <div className="space-y-2">
              {amendments.map((amend, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm space-y-1">
                  <div className="flex items-center justify-between text-ink font-semibold">
                    <span>{amend.title || `Amendment #${idx + 1}`}</span>
                    <span className="text-xs text-ink-soft">{amend.date}</span>
                  </div>
                  <p className="text-ink-soft text-xs">{amend.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
