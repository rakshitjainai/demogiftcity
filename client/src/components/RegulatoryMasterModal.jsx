import React, { useState, useEffect, useCallback } from 'react';
import {
  X, CheckCircle2, Circle, BookOpen, HelpCircle, ArrowLeft,
  ShieldAlert, Sparkles, Award, Loader2, AlertCircle, ChevronDown,
  ChevronRight, Type, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─── Question type display helpers ────────────────────────────────────────
const TYPE_META = {
  mcq:         { label: 'MCQ',          color: 'text-blue-700 bg-blue-50 border-blue-200' },
  truefalse:   { label: 'True / False', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  fill:        { label: 'Fill in the Blank', color: 'text-violet-700 bg-violet-50 border-violet-200' },
  spot_lapse:  { label: 'Spot the Lapse', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  old_vs_new:  { label: 'Old vs New',   color: 'text-orange-700 bg-orange-50 border-orange-200' },
  flash_recall:{ label: 'Flash Recall', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
  match:       { label: 'Match',        color: 'text-rose-700 bg-rose-50 border-rose-200' },
  lesson:      { label: 'Lesson',       color: 'text-forest-700 bg-mint border-mint-deep' },
};

function TypeBadge({ type }) {
  const meta = TYPE_META[type] || { label: type, color: 'text-ink-soft bg-paper border-line' };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>
      {meta.label}
    </span>
  );
}

// ─── Lesson Renderer ──────────────────────────────────────────────────────
function LessonRenderer({ item, isCompleted, onToggleComplete }) {
  // Merge payload (CMI) with top-level fields (FME/AIF) — FME/AIF put hook/cards/summary/tip at root
  const payloadRaw = item.payload || {};
  const payload = {
    hook: payloadRaw.hook || item.hook || '',
    cards: payloadRaw.cards || null,
    summary: payloadRaw.summary || item.summary || '',
    tip: payloadRaw.tip || item.tip || '',
    reg_text: payloadRaw.reg_text || '',
    meaning: payloadRaw.meaning || '',
    importance: payloadRaw.importance || '',
    practitioner_note: payloadRaw.practitioner_note || '',
    takeaway: payloadRaw.takeaway || '',
  };

  // FME/AIF cards come as a pipe-delimited string; parse into structured objects
  if (!payload.cards && typeof item.cards === 'string' && item.cards.trim()) {
    const cardBlocks = item.cards.split('||').map(b => b.trim()).filter(Boolean);
    payload.cards = cardBlocks.map(block => {
      const parts = block.split('|').map(p => p.trim()).filter(Boolean);
      const card = {};
      parts.forEach(part => {
        if (part.startsWith('LAW '))   card.law   = part.replace(/^LAW\s+/, '');
        else if (part.startsWith('PLAIN ')) card.means = part.replace(/^PLAIN\s+/, '');
        else if (part.startsWith('WATCH ')) card.watch = part.replace(/^WATCH\s+/, '');
        else if (!card.title) card.title = part;
        else card.means = (card.means ? card.means + ' ' : '') + part;
      });
      return card;
    });
  }
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-line">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <TypeBadge type="lesson" />
            {item.provision && (
              <span className="px-2 py-0.5 bg-paper border border-line text-ink-soft text-[10px] rounded-full">
                {item.provision}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-display text-forest-deep font-semibold leading-snug">
            {item.title}
          </h2>
        </div>
        <button
          onClick={onToggleComplete}
          className={`cursor-target flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all min-h-[44px] ${
            isCompleted
              ? 'bg-mint text-forest border border-mint-deep'
              : 'bg-forest text-white hover:bg-leaf'
          }`}
        >
          {isCompleted ? <><CheckCircle2 className="w-4 h-4 text-leaf" /> Done</> : <><Circle className="w-4 h-4" /> Mark Complete</>}
        </button>
      </div>

      {/* Hook */}
      {payload.hook && (
        <div className="p-4 bg-forest/5 border-l-4 border-forest rounded-r-xl text-sm italic text-forest-deep leading-relaxed">
          "{payload.hook}"
        </div>
      )}

      {/* Primary text fields (for deep_dive / DD type lessons) */}
      {payload.reg_text && (
        <div className="bg-mint/20 border border-mint-deep/30 rounded-xl p-4 font-mono text-xs text-forest-deep leading-relaxed">
          <strong className="block text-leaf text-[10px] uppercase font-sans mb-1 font-bold">Statutory Text:</strong>
          {payload.reg_text}
        </div>
      )}
      {payload.meaning && (
        <div className="text-sm text-ink leading-relaxed">
          <strong className="text-forest-deep font-semibold">What this means: </strong>{payload.meaning}
        </div>
      )}
      {payload.importance && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold uppercase tracking-wider block mb-0.5 text-amber-800">Why It Matters:</strong>
            {payload.importance}
          </div>
        </div>
      )}
      {payload.practitioner_note && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed">
          <strong className="font-bold text-slate-900 block mb-1">Practitioner Note:</strong>
          {payload.practitioner_note}
        </div>
      )}
      {payload.takeaway && (
        <div className="bg-leaf/10 border border-leaf/30 rounded-xl p-4 text-sm text-forest-deep flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-leaf flex-shrink-0 mt-0.5" />
          <div><strong className="font-bold">Key Takeaway: </strong>{payload.takeaway}</div>
        </div>
      )}

      {/* Cards (LAW/PLAIN/WATCH) */}
      {payload.cards?.map((card, idx) => (
        <div key={idx} className="bg-white border border-line rounded-xl p-5 card-shadow space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {card.tag && (
              <span className="px-2.5 py-0.5 bg-mint text-forest font-bold text-[10px] rounded-full uppercase tracking-wider">
                {card.tag}
              </span>
            )}
            {card.title && <h3 className="font-semibold text-forest-deep text-base">{card.title}</h3>}
          </div>
          {card.law && (
            <div className="bg-mint/20 border border-mint-deep/30 rounded-lg p-4 font-mono text-xs text-forest-deep leading-relaxed">
              <strong className="block text-leaf text-[10px] uppercase font-sans mb-1 font-bold">Statutory Mandate:</strong>
              {card.law}
            </div>
          )}
          {card.means && (
            <div className="text-sm text-ink leading-relaxed">
              <strong className="text-forest-deep font-semibold">What this means: </strong>{card.means}
            </div>
          )}
          {card.watch && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold uppercase tracking-wider block mb-0.5 text-amber-800">Practitioner Note:</strong>
                {card.watch}
              </div>
            </div>
          )}
          {card.link && (
            <div className="text-xs text-ink-soft italic pt-2 border-t border-line/50">Link to: {card.link}</div>
          )}
        </div>
      ))}

      {/* Summary & Tip */}
      {payload.summary && (
        <div className="bg-paper border border-line rounded-xl p-5">
          <h4 className="font-semibold text-forest-deep text-xs uppercase tracking-wider mb-2">Summary</h4>
          <p className="text-sm text-ink leading-relaxed">{payload.summary}</p>
        </div>
      )}
      {payload.tip && (
        <div className="bg-leaf/10 border border-leaf/30 rounded-xl p-5 text-sm text-forest-deep flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-leaf flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-1">Key Takeaway &amp; Action Tip:</strong>
            {payload.tip}
          </div>
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <button
          onClick={onToggleComplete}
          className="cursor-target px-6 py-2.5 bg-forest text-white font-semibold text-sm rounded-xl hover:bg-leaf transition-colors flex items-center gap-2 min-h-[48px]"
        >
          {isCompleted ? 'Mark as Incomplete' : 'Mark Lesson Complete & Continue'}
        </button>
      </div>
    </div>
  );
}

// ─── Flash Recall / Deck Renderer ─────────────────────────────────────────
function FlashRecallRenderer({ item, isCompleted, onToggleComplete }) {
  const [flipped, setFlipped] = useState(false);
  const cards = [];
  if (typeof item.cards === 'string' && item.cards.trim()) {
    const blocks = item.cards.split('||').map(b => b.trim()).filter(Boolean);
    blocks.forEach(b => {
      const parts = b.split('|').map(p => p.trim()).filter(Boolean);
      cards.push({ front: parts[0] || item.title || 'Flash Recall', back: parts.slice(1).join('\n') || parts[0] });
    });
  } else if (item.pairs && typeof item.pairs === 'string' && item.pairs.trim()) {
    item.pairs.split(';').forEach(pair => {
      const [f, b] = pair.split('=').map(s => s?.trim());
      if (f) cards.push({ front: f, back: b || '' });
    });
  }

  const defaultFront = item.question || item.title || 'Flash Recall Card';
  const defaultBack = item.explanation || item.summary || item.meaning || 'Review statutory text and key thresholds for this concept.';

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-line">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <TypeBadge type={item.type || 'flash_recall'} />
            {item.concept && (
              <span className="px-2 py-0.5 bg-paper border border-line text-ink-soft text-[10px] rounded-full">
                {item.concept}
              </span>
            )}
            {item.provision && (
              <span className="px-2 py-0.5 bg-paper border border-line text-ink-soft text-[10px] rounded-full">
                {item.provision}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-display text-forest-deep font-semibold leading-snug">
            {item.question || item.title}
          </h2>
        </div>
        <button
          onClick={onToggleComplete}
          className={`cursor-target flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all min-h-[44px] ${
            isCompleted
              ? 'bg-mint text-forest border border-mint-deep'
              : 'bg-forest text-white hover:bg-leaf'
          }`}
        >
          {isCompleted ? <><CheckCircle2 className="w-4 h-4 text-leaf" /> Done</> : <><Circle className="w-4 h-4" /> Mark Reviewed</>}
        </button>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-6 sm:p-8 min-h-[240px] flex flex-col justify-between card-shadow hover-lift relative overflow-hidden transition-all select-none border border-slate-700"
      >
        <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
          <span className="uppercase tracking-widest text-[10px] text-amber-400 font-bold">⚡ Rapid Recall Deck</span>
          <span>Tap anywhere to flip</span>
        </div>
        
        <div className="my-auto py-4 text-center">
          {!flipped ? (
            <div className="text-lg sm:text-2xl font-semibold text-white leading-relaxed font-display">
              {cards[0]?.front || defaultFront}
            </div>
          ) : (
            <div className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans animate-fade-in whitespace-pre-line text-left">
              <strong className="block text-emerald-400 font-mono text-xs uppercase mb-2">Key Takeaway / Answer:</strong>
              {cards[0]?.back || defaultBack}
            </div>
          )}
        </div>

        <div className="text-center text-[11px] text-slate-400 font-mono">
          {flipped ? '✓ Flipped (Tap to hide)' : 'Tap card to reveal answer / details'}
        </div>
      </div>

      {cards.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {cards.slice(1).map((c, i) => (
            <div key={i} className="p-4 bg-white border border-line rounded-xl card-shadow">
              <div className="text-xs font-bold text-forest-deep mb-1 font-display">{c.front}</div>
              <div className="text-xs text-ink-soft leading-relaxed whitespace-pre-line">{c.back}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MCQ / Multiple-choice Renderer ──────────────────────────────────────
function McqRenderer({ item, courseSlug, isCompleted, onAnswered }) {
  const { token } = useAuth();
  const [selected, setSelected] = useState(null);
  const [fillText, setFillText] = useState('');
  const [result, setResult] = useState(null); // { isCorrect, correctKey, explanation }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const type = item.type || 'mcq';
  const isDeferred = ['match'].includes(type);
  const isFill = type === 'fill';

  // Build option list from item fields
  const options = [];
  if (item.option_A !== undefined) {
    ['A', 'B', 'C', 'D'].forEach(k => {
      if (item[`option_${k}`]) options.push({ k, t: item[`option_${k}`] });
    });
  }
  // For true/false
  if (type === 'truefalse' && options.length === 0) {
    options.push({ k: 'A', t: 'True' }, { k: 'B', t: 'False' });
  }

  // If no options and not fill, provide default true/false or answer review
  const hasNoOptions = !isFill && options.length === 0;

  const handleSubmit = async () => {
    if (result) return;
    const answer = isFill ? fillText.trim() : selected;
    if (!answer && !hasNoOptions) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/regulatory-master/${courseSlug}/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ uid: item.uid, answer: answer || 'A' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Submission failed');
      setResult(data);
      if (onAnswered) onAnswered(item.uid, data.isCorrect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-4 border-b border-line">
        <div className="flex flex-wrap gap-2 mb-3">
          <TypeBadge type={type} />
          {item.concept && (
            <span className="px-2 py-0.5 bg-paper border border-line text-ink-soft text-[10px] rounded-full">
              {item.concept}
            </span>
          )}
          {item.provision && (
            <span className="px-2 py-0.5 bg-paper border border-line text-ink-soft text-[10px] rounded-full">
              {item.provision}
            </span>
          )}
        </div>
        <h2 className="text-lg sm:text-xl font-display text-forest-deep font-semibold leading-snug">
          {item.question || item.title}
        </h2>
      </div>

      {/* Deferred stub notice */}
      {isDeferred && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-sm text-amber-800">
          <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <strong className="block font-bold">Advanced format — simplified display</strong>
            <span className="text-xs text-amber-700">This question type uses a matching format. Full interactive matching is coming soon — shown as multiple-choice below.</span>
          </div>
        </div>
      )}

      {/* Fill in the Blank */}
      {isFill && !result && (
        <div>
          <label className="block text-sm font-semibold text-forest-deep mb-2">Your Answer:</label>
          <input
            type="text"
            value={fillText}
            onChange={e => setFillText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder="Type your answer and press Enter or click Submit"
            className="w-full px-4 py-3 border-2 border-line rounded-xl text-sm focus:outline-none focus:border-forest transition-colors min-h-[52px]"
          />
        </div>
      )}

      {/* MCQ Options */}
      {!isFill && options.length > 0 && (
        <div className="space-y-2.5">
          {options.map(opt => {
            let style = 'bg-paper border-line text-ink hover:border-forest hover:bg-mint/30';
            if (result) {
              if (opt.k === result.correctKey) style = 'bg-mint border-leaf text-forest font-semibold';
              else if (opt.k === selected && opt.k !== result.correctKey) style = 'bg-rose-50 border-rose-300 text-rose-800';
              else style = 'bg-paper border-line text-ink-soft opacity-60';
            } else if (opt.k === selected) {
              style = 'bg-forest/10 border-forest text-forest font-semibold';
            }

            return (
              <button
                key={opt.k}
                onClick={() => !result && setSelected(opt.k)}
                disabled={!!result}
                className={`cursor-target w-full p-3 sm:p-4 rounded-xl border-2 text-left text-sm flex items-start gap-3 transition-all ${style} min-h-[52px]`}
              >
                <span className="px-2.5 py-1 bg-white/80 border border-current/30 rounded-lg font-bold text-xs flex-shrink-0">
                  {opt.k}
                </span>
                <span className="pt-0.5 leading-relaxed">{opt.t}</span>
                {result && opt.k === result.correctKey && <CheckCircle2 className="w-5 h-5 text-leaf ml-auto flex-shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Submit button */}
      {!result && (
        <button
          onClick={handleSubmit}
          disabled={loading || (!selected && !fillText.trim())}
          className={`cursor-target w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 min-h-[52px] ${
            (selected || fillText.trim()) && !loading
              ? 'bg-forest text-white hover:bg-leaf'
              : 'bg-line text-ink-soft cursor-not-allowed'
          }`}
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : 'Submit Answer'}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-rose-700 text-sm p-3 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
            result.isCorrect ? 'bg-mint text-forest border border-mint-deep' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {result.isCorrect
              ? <><CheckCircle2 className="w-5 h-5 text-leaf flex-shrink-0" /><span>Correct! Excellent analysis.</span></>
              : <><ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" /><span>Incorrect. Review the statutory explanation below.</span></>
            }
          </div>

          {isFill && result.correctKey && (
            <div className="p-3 bg-paper border border-line rounded-xl text-sm">
              <strong className="text-forest-deep">Correct answer: </strong>
              <span className="font-mono text-forest">{result.correctKey}</span>
            </div>
          )}

          {result.explanation && (
            <div className="bg-paper border border-line rounded-xl p-5 text-xs text-ink leading-relaxed">
              <strong className="font-bold text-forest-deep block mb-1 uppercase tracking-wider text-[10px]">
                Statutory Explanation:
              </strong>
              {result.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Syllabus item in the left panel ─────────────────────────────────────
function SyllabusItem({ item, isActive, isDone, onClick }) {
  const isLesson = item.itemType === 'lesson' || item.type === 'lesson';
  return (
    <button
      onClick={() => onClick(item)}
      className={`w-full px-3 py-2.5 text-left text-xs flex items-center justify-between transition-colors rounded-lg min-h-[44px] ${
        isActive
          ? isLesson
            ? 'bg-mint/60 font-semibold text-forest-deep border-l-4 border-leaf pl-2'
            : 'bg-gold/20 font-semibold text-forest-deep border-l-4 border-gold pl-2'
          : 'hover:bg-paper/80 text-ink'
      }`}
    >
      <div className="flex items-center gap-2 truncate pr-2 min-w-0">
        {isLesson
          ? <BookOpen className="w-3.5 h-3.5 text-forest flex-shrink-0" />
          : <HelpCircle className="w-3.5 h-3.5 text-gold flex-shrink-0" />
        }
        <span className="truncate leading-snug">{item.title || item.question?.slice(0, 50)}</span>
      </div>
      {isDone
        ? <CheckCircle2 className="w-3.5 h-3.5 text-leaf flex-shrink-0" />
        : <Circle className="w-3.5 h-3.5 text-ink-soft/40 flex-shrink-0" />
      }
    </button>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────
export default function RegulatoryMasterModal({ course, onClose }) {
  const { user, token, toggleCourseItem } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState(new Set([1]));

  const courseSlug = course?.slug || course?.code?.toLowerCase().replace('ifsca-', 'ifsca-').replace('sebi-', 'sebi-');

  // Resolve slug
  const resolvedSlug = (() => {
    const code = (course?.code || '').toUpperCase();
    if (code === 'IFSCA-CMI') return 'ifsca-cmi';
    if (code === 'IFSCA-FME') return 'ifsca-fme';
    if (code === 'SEBI-AIF') return 'sebi-aif';
    return courseSlug;
  })();

  // Get completed items from user or localStorage
  const getCompletedItems = useCallback(() => {
    if (user?.courseProgress) {
      const entry = user.courseProgress.find(c => c.courseSlug === resolvedSlug);
      if (entry) return new Set(entry.completedItems || []);
    }
    const guest = JSON.parse(localStorage.getItem('regmate_guest_course_progress') || '{}');
    return new Set(guest[resolvedSlug]?.completedItems || []);
  }, [user, resolvedSlug]);

  const [completedSet, setCompletedSet] = useState(getCompletedItems);

  // Keep completedSet in sync when user changes
  useEffect(() => {
    setCompletedSet(getCompletedItems());
  }, [getCompletedItems]);

  // Fetch all items from server
  useEffect(() => {
    if (!resolvedSlug) return;
    setLoading(true);
    setFetchError(null);
    fetch(`${API_BASE}/regulatory-master/${resolvedSlug}/items`)
      .then(r => r.json())
      .then(data => {
        if (data.items) {
          setItems(data.items);
          // Auto-select first item
          if (data.items.length > 0) setActiveItem(data.items[0]);
        } else {
          setFetchError(data.message || 'Failed to load content');
        }
      })
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [resolvedSlug]);

  // Group items by chapter
  const chapters = (() => {
    const chMap = {};
    items.forEach(item => {
      const chNo = item.module_no || item.chapterNo || 1;
      if (!chMap[chNo]) chMap[chNo] = { num: chNo, name: item.module_name || `Chapter ${chNo}`, items: [] };
      chMap[chNo].items.push(item);
    });
    return Object.values(chMap).sort((a, b) => a.num - b.num);
  })();

  const totalItems = items.length;
  const completedCount = completedSet.size;
  const progressPct = totalItems > 0 ? Math.min(100, Math.round((completedCount / totalItems) * 100)) : 0;

  const toggleChapter = (num) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      next.has(num) ? next.delete(num) : next.add(num);
      return next;
    });
  };

  const handleToggleLesson = async (uid) => {
    const wasCompleted = completedSet.has(uid);
    // Optimistic update
    setCompletedSet(prev => {
      const next = new Set(prev);
      wasCompleted ? next.delete(uid) : next.add(uid);
      return next;
    });

    if (token) {
      try {
        await fetch(`${API_BASE}/regulatory-master/${resolvedSlug}/mark-lesson`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ uid, markAs: wasCompleted ? 'incomplete' : 'complete' }),
        });
      } catch (_) {
        // Fallback already handled by guest localStorage via toggleCourseItem
      }
    } else {
      toggleCourseItem(resolvedSlug, uid);
    }
  };

  const handleAnswered = (uid) => {
    setCompletedSet(prev => new Set([...prev, uid]));
  };

  const isLesson = (item) => item?.itemType === 'lesson' || item?.type === 'lesson' || (!item?.question && !item?.title?.includes('Deck'));
  const isFlashRecall = (item) => item?.type === 'flash_recall' || item?.itemType === 'flash_recall' || item?.question?.includes('Deck') || item?.title?.includes('Deck');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
      <div className="bg-white w-full md:max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-forest-deep text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <span className="px-2.5 py-0.5 bg-mint/20 text-mint font-bold text-xs rounded-full uppercase flex-shrink-0">
              {course?.code}
            </span>
            <h2 className="text-base sm:text-lg font-display text-paper font-semibold truncate">
              {course?.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cursor-target p-2.5 rounded-full hover:bg-white/10 text-paper/80 hover:text-white transition-colors flex-shrink-0 ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress sub-header */}
        <div className="bg-paper border-b border-line px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-ink-soft flex-shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span>{totalItems} Items</span>
            <span>•</span>
            <span>{completedCount} Completed</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Progress: <strong className="text-forest">{user ? `${progressPct}%` : '0%'}</strong></span>
            <div className="w-24 bg-line h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressPct === 100 ? 'bg-leaf-bright' : 'bg-leaf'}`}
                style={{ width: user ? `${progressPct}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-grow flex overflow-hidden">

          {/* Left: Syllabus panel */}
          <div className="w-72 flex-shrink-0 border-r border-line overflow-y-auto bg-paper/40 p-3 space-y-2 hidden md:block">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-ink-soft px-2 mb-3">
              Syllabus &amp; Modules
            </h3>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-leaf" />
              </div>
            )}

            {chapters.map(ch => {
              const isExpanded = expandedChapters.has(ch.num);
              const chDone = ch.items.filter(i => completedSet.has(i.uid)).length;
              return (
                <div key={ch.num} className="border border-line rounded-xl bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleChapter(ch.num)}
                    className="w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-paper/80 transition-colors min-h-[44px]"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-bold text-leaf uppercase tracking-wider block">
                        Ch {ch.num}
                      </span>
                      <h4 className="font-semibold text-forest-deep text-xs leading-snug truncate">{ch.name}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-semibold text-ink-soft">{chDone}/{ch.items.length}</span>
                      {isExpanded
                        ? <ChevronDown className="w-3.5 h-3.5 text-ink-soft" />
                        : <ChevronRight className="w-3.5 h-3.5 text-ink-soft" />
                      }
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-line bg-paper/30 p-1 space-y-0.5">
                      {ch.items.map(item => (
                        <SyllabusItem
                          key={item.uid}
                          item={item}
                          isActive={activeItem?.uid === item.uid}
                          isDone={completedSet.has(item.uid)}
                          onClick={i => { setActiveItem(i); }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Content viewer */}
          <div className="flex-grow p-4 sm:p-6 overflow-y-auto bg-white">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-leaf mx-auto" />
                  <p className="text-sm text-ink-soft">Loading course content…</p>
                </div>
              </div>
            ) : fetchError ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3 p-6">
                  <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                  <p className="text-sm font-semibold text-rose-700">{fetchError}</p>
                  <p className="text-xs text-ink-soft">Make sure the backend server is running.</p>
                </div>
              </div>
            ) : activeItem ? (
              isFlashRecall(activeItem) ? (
                <FlashRecallRenderer
                  item={activeItem}
                  isCompleted={completedSet.has(activeItem.uid)}
                  onToggleComplete={() => handleToggleLesson(activeItem.uid)}
                />
              ) : isLesson(activeItem) ? (
                <LessonRenderer
                  item={activeItem}
                  isCompleted={completedSet.has(activeItem.uid)}
                  onToggleComplete={() => handleToggleLesson(activeItem.uid)}
                />
              ) : (
                <McqRenderer
                  key={activeItem.uid}
                  item={activeItem}
                  courseSlug={resolvedSlug}
                  isCompleted={completedSet.has(activeItem.uid)}
                  onAnswered={handleAnswered}
                />
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-ink-soft">
                <BookOpen className="w-12 h-12 text-leaf/40 mb-3" />
                <h3 className="font-semibold text-forest-deep text-lg mb-1">Select a Lesson or Quiz</h3>
                <p className="text-xs max-w-sm">
                  Choose any lesson or practice question from the syllabus to start learning.
                </p>
              </div>
            )}

            {/* Mobile chapter navigation */}
            <div className="md:hidden mt-8 border-t border-line pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-3">All Modules</h4>
              <div className="space-y-2">
                {chapters.map(ch => (
                  <div key={ch.num}>
                    <button
                      onClick={() => toggleChapter(ch.num)}
                      className="w-full text-left p-3 bg-paper border border-line rounded-xl font-semibold text-sm text-forest-deep flex items-center justify-between min-h-[44px]"
                    >
                      <span>Ch {ch.num}: {ch.name}</span>
                      {expandedChapters.has(ch.num) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {expandedChapters.has(ch.num) && (
                      <div className="mt-1 pl-3 space-y-1">
                        {ch.items.map(item => (
                          <SyllabusItem
                            key={item.uid}
                            item={item}
                            isActive={activeItem?.uid === item.uid}
                            isDone={completedSet.has(item.uid)}
                            onClick={i => { setActiveItem(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
