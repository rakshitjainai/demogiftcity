import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Clock, Share2, BookOpen, Bookmark, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ArticleModal({ article, onClose }) {
  const [resolvedPost, setResolvedPost] = useState(article);

  useEffect(() => {
    if (!article) return;

    if (article.content && article.content.length > 500) {
      setResolvedPost(article);
      return;
    }

    import('../data/posts.json')
      .then(m => {
        const list = m.default || m;
        const match = list.find(p =>
          (article.slug && p.slug === article.slug) ||
          (article.id && (p.id === article.id || p.slug === article.id)) ||
          (article.title && p.title && p.title.toLowerCase().trim() === article.title.toLowerCase().trim())
        );
        if (match) {
          setResolvedPost({
            ...match,
            summary: match.excerpt || match.summary || article.summary || article.desc || '',
            category: match.category || article.category || 'Regulatory Intelligence',
            author: match.author || article.author || 'CS Prashant Kumar',
            date: match.date || article.date
          });
        } else {
          setResolvedPost(article);
        }
      })
      .catch(() => setResolvedPost(article));
  }, [article]);

  if (!article) return null;

  const canonicalPost = resolvedPost || article;
  const displayTitle = canonicalPost.title || article.title;
  const displayCategory = canonicalPost.category || article.category || 'Regulatory Intelligence';
  const displayDate = canonicalPost.date || article.date;
  const displayAuthor = canonicalPost.author || article.author || 'CS Prashant Kumar';
  const displaySlug = canonicalPost.slug || article.slug;
  const displaySummary = canonicalPost.excerpt || canonicalPost.summary || article.summary || article.desc || '';
  const rawContent = canonicalPost.content || article.content || canonicalPost.fullContent || article.fullContent || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(7,51,33,0.7)] backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] card-shadow" style={{ border: '1px solid var(--line)' }}>
        
        {/* Header */}
        <div className="p-6 flex items-start justify-between" style={{ borderBottom: '1px solid var(--line)', background: 'var(--mint)' }}>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide" style={{ background: 'var(--mint-deep)', color: 'var(--forest)' }}>
                {displayCategory}
              </span>
              <span className="text-xs text-slate-400 font-medium">{displayDate}</span>
            </div>
            <h2 className="text-xl sm:text-2xl leading-tight" style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, color: 'var(--ink)' }}>
              {displayTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors ml-4 flex-shrink-0 hover:bg-white/50 cursor-pointer"
            style={{ color: 'var(--ink-soft)' }}
            aria-label="Close modal"
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
                <div className="font-bold text-slate-900">{displayAuthor}</div>
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
          {displaySummary && (
            <div className="p-4 rounded-xl text-sm font-medium leading-relaxed" style={{ background: 'var(--mint)', borderLeft: '4px solid var(--forest)', color: 'var(--ink)' }}>
              {displaySummary}
            </div>
          )}

          {/* Detailed Authentic Body Content */}
          <div className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
            {rawContent ? (
              <div 
                className="article-modal-body prose max-w-none text-sm space-y-4 leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:font-serif [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-[var(--forest-deep)] [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-1 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_li]:mb-1 [&_table]:w-full [&_table]:border [&_table]:my-4 [&_th]:bg-[var(--mint)] [&_th]:p-2 [&_th]:border [&_td]:p-2 [&_td]:border"
                dangerouslySetInnerHTML={{ __html: rawContent }} 
              />
            ) : (
              <p className="text-sm italic text-[var(--ink-soft)] py-6 text-center">
                Article content unavailable.
              </p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--line)', background: 'var(--mint)' }}>
          {displaySlug ? (
            <Link
              to={`/free-resources/blogs/${displaySlug}`}
              onClick={onClose}
              className="font-bold flex items-center gap-1.5 hover:underline"
              style={{ color: 'var(--leaf)' }}
            >
              <span>Open Full Page Article</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="font-medium" style={{ color: 'var(--ink-soft)' }}>Source: RegMate Knowledge Repository</span>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-white font-bold transition-all hover:-translate-y-0.5 cursor-pointer"
            style={{ background: 'var(--forest)' }}
          >
            Close Reader
          </button>
        </div>

      </div>
    </div>
  );
}
