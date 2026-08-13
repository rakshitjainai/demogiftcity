import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldAlert, Sparkles, Volume2, Star } from 'lucide-react';

export function ParagraphBlock({ text, fontSizeClass = 'text-sm' }) {
  if (!text) return null;
  return (
    <p className={`${fontSizeClass} text-ink leading-relaxed mb-3`}>
      {text}
    </p>
  );
}

export function SubRegulationBlock({ num, text, clauses = [], fontSizeClass = 'text-sm' }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-mint text-forest font-bold text-xs flex-shrink-0 mt-0.5 border border-mint-deep">
        ({num})
      </span>
      <div className="flex-grow">
        <p className={`${fontSizeClass} text-ink leading-relaxed font-normal`}>
          {text}
        </p>
        {clauses.length > 0 && (
          <div className="mt-2 pl-4 border-l-2 border-mint-deep space-y-2">
            {clauses.map((clause, idx) => (
              <ClauseBlock key={idx} letter={clause.letter} text={clause.text} fontSizeClass={fontSizeClass} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ClauseBlock({ letter, text, fontSizeClass = 'text-sm' }) {
  return (
    <div className="flex items-start gap-2 text-ink">
      <span className="font-semibold text-leaf text-xs mt-0.5 flex-shrink-0">
        ({letter})
      </span>
      <span className={`${fontSizeClass} leading-relaxed`}>{text}</span>
    </div>
  );
}

export function ExpandableLongText({ text, maxChars = 280, fontSizeClass = 'text-sm' }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const isLong = text.length > maxChars;
  const displayText = !expanded && isLong ? `${text.slice(0, maxChars)}...` : text;

  return (
    <div className="relative">
      <div className={`${fontSizeClass} text-ink leading-relaxed whitespace-pre-line`}>
        {displayText}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="cursor-target mt-2 inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-leaf transition-colors"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              View full statutory text <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

export function PractitionerNote({ title = "Practitioner Note", text, type = "caution" }) {
  if (!text) return null;

  return (
    <div className="my-4 bg-amber-50/90 border border-amber-300/80 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-3 shadow-sm">
      <Star className="w-4 h-4 text-gold flex-shrink-0 mt-0.5 fill-gold/30" />
      <div className="flex-grow">
        <strong className="font-bold uppercase tracking-wider block text-amber-900 mb-1 text-[11px]">
          {title}
        </strong>
        <p className="leading-relaxed text-amber-950/90">{text}</p>
      </div>
    </div>
  );
}
