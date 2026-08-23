import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, AlertCircle, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';

// Runtime shortcode parser to convert leftover WordPress shortcodes into interactive UI CTA cards
function parseShortcodes(rawContent = '') {
  if (!rawContent) return '';
  let content = rawContent;

  const replacements = [
    {
      tags: [/&#91;ifsca_cmi_quiz&#93;|&#91;ifsca_cmi_quiz\]|\[ifsca_cmi_quiz\]|&#91;csater_landing&#93;|\[csater_landing\]|&#91;csater_exam&#93;|\[csater_exam\]/gi],
      replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl text-white shadow-xl border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-400/20 border border-blue-400/40 rounded-full text-[11px] font-bold text-blue-300 uppercase tracking-wider">🧪 RegPractice Knowledge Test</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">IFSCA CMI Regulations Knowledge Test</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Assess your compliance readiness with 100 MCQs, real-time scoring, and instant statutory explanation reports.</p></div><a href="/practice/mock-tests" class="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Take Practice Test →</span></a></div>`
    },
    {
      tags: [/&#91;reglearn_cmi&#93;|&#91;reglearn_cmi\]|\[reglearn_cmi\]/gi],
      replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-forest-deep rounded-3xl text-white shadow-xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-[11px] font-bold text-amber-300 uppercase tracking-wider">✨ RegLearn Interactive Masterclass</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">IFSCA Capital Market Intermediaries (CMI) Regulations, 2025</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Master all 17 chapters, net worth frameworks, fit & proper criteria, and statutory returns with interactive lessons.</p></div><a href="/learn/ifsca-cmi" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Start Interactive Course →</span></a></div>`
    },
    {
      tags: [/&#91;reglearn_aif&#93;|&#91;reglearn_aif\]|\[reglearn_aif\]/gi],
      replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-amber-950 via-slate-900 to-forest-deep rounded-3xl text-white shadow-xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-[11px] font-bold text-amber-300 uppercase tracking-wider">🎓 RegLearn Interactive Course</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">SEBI (Alternative Investment Funds) Regulations, 2012</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Comprehensive 14-chapter course covering Category I, II & III AIFs, Angel Funds, PPM structuring, and accredited investors.</p></div><a href="/learn/sebi-aif" class="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Start AIF Masterclass →</span></a></div>`
    },
    {
      tags: [/&#91;reglearn&#93;|&#91;reglearn\]|\[reglearn\]/gi],
      replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-3xl text-white shadow-xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-400/20 border border-emerald-400/40 rounded-full text-[11px] font-bold text-emerald-300 uppercase tracking-wider">🎓 RegLearn Interactive Platform</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">IFSCA & SEBI Interactive Learning Modules</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Explore interactive regulatory courses with case scenarios, chapter challenges, and certification.</p></div><a href="/learn" class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Explore All Courses →</span></a></div>`
    },
    {
      tags: [/&#91;fme_quiz&#93;|&#91;fme_quiz\]|\[fme_quiz\]|&#91;ifsc_fme_mock_test&#93;|\[ifsc_fme_mock_test\]/gi],
      replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-forest-deep rounded-3xl text-white shadow-xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-400/20 border border-emerald-400/40 rounded-full text-[11px] font-bold text-emerald-300 uppercase tracking-wider">🧪 RegPractice Practitioner Quiz</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">IFSCA FME Regulations Practitioner Test</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Test your knowledge on FME registration thresholds, capital adequacy, and placement memoranda norms.</p></div><a href="/practice/quizzes" class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Take FME Quiz →</span></a></div>`
    },
    {
      tags: [/&#91;ifsca_aml_quiz&#93;|&#91;ifsca_aml_quiz\]|\[ifsca_aml_quiz\]|&#91;amlcft_diagnostic&#93;|\[amlcft_diagnostic\]/gi],
      replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 rounded-3xl text-white shadow-xl border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-400/20 border border-purple-400/40 rounded-full text-[11px] font-bold text-purple-300 uppercase tracking-wider">🛡️ RegTools Compliance Diagnostic</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">AML / CFT Readiness Diagnostic Tool</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Evaluate your entity's Anti-Money Laundering & Combating Financing of Terrorism compliance posture.</p></div><a href="/tools/aml-risk-assessment" class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Launch Diagnostic Tool →</span></a></div>`
    },
    {
      tags: [/&#91;statuteiq_quiz&#93;|&#91;statuteiq_quiz\]|\[statuteiq_quiz\]|&#91;statuteiq_rpt_quiz&#93;|\[statuteiq_rpt_quiz\]/gi],
      replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 rounded-3xl text-white shadow-xl border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-400/20 border border-blue-400/40 rounded-full text-[11px] font-bold text-blue-300 uppercase tracking-wider">📝 Secretarial Standards Quiz</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">Interactive Compliance & Secretarial Test</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Test your grasp of Secretarial Standard-1 (SS-1), Related Party Transactions, and Companies Act compliance.</p></div><a href="/practice/quizzes" class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Start Knowledge Quiz →</span></a></div>`
    },
    {
      tags: [/&#91;fme_diagnostic&#93;|&#91;fme_diagnostic\]|\[fme_diagnostic\]/gi],
      replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-teal-950 via-slate-900 to-forest-deep rounded-3xl text-white shadow-xl border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-400/20 border border-teal-400/40 rounded-full text-[11px] font-bold text-teal-300 uppercase tracking-wider">🔧 RegTools Diagnostic Tool</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">FME Enforcement Readiness Diagnostic</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Identify operational gaps, statutory return deadlines, and enforcement vulnerabilities for GIFT City FMEs.</p></div><a href="/tools/compliance-diagnostic" class="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Run Diagnostic Tool →</span></a></div>`
    },
    {
      tags: [/&#91;ifsc_compliance_calendar&#93;|&#91;ifsc_compliance_calendar\]|\[ifsc_compliance_calendar\]/gi],
      replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-amber-950 via-slate-900 to-forest-deep rounded-3xl text-white shadow-xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-[11px] font-bold text-amber-300 uppercase tracking-wider">📅 RegTools Compliance Calendar</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">GIFT IFSC Annual Compliance Calendar Builder</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Customized compliance calendar with officer assignment, evidence logging, and statutory due date alerts.</p></div><a href="/tools/compliance-calendar" class="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Open Compliance Calendar →</span></a></div>`
    },
    {
      tags: [/&#91;ecl_pillars&#93;|&#91;ecl_keypoints&#93;|&#91;ecl_statband&#93;|&#91;ecl_takeaway&#93;|\[ecl_pillars\]|\[ecl_keypoints\]|\[ecl_statband\]|\[ecl_takeaway\]/gi],
      replacement: `<div class="my-6 p-5 bg-emerald-900/10 border border-emerald-600/30 rounded-2xl text-emerald-950 font-medium text-sm leading-relaxed not-prose flex items-start gap-3"><span class="text-emerald-600 font-bold text-lg">📌</span><div><strong class="font-bold block text-emerald-900 mb-1">Key Statutory Takeaway</strong>Executive guidance and regulatory framework summary for statutory compliance.</div></div>`
    }
  ];

  replacements.forEach(sr => {
    sr.tags.forEach(rgx => {
      content = content.replace(rgx, sr.replacement);
    });
  });

  // Strip residual <pre class="wp-block-code"><code> wrappers around converted div elements
  content = content.replace(/<pre class="wp-block-code"><code>\s*(<div class="my-8[\s\S]*?<\/div>)\s*<\/code><\/pre>/gi, '$1');

  return content;
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamically load post data chunk when slug changes
  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    fetch(`${API_BASE_URL}/blogs/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.post) {
          setPost(data.post);
          setLoading(false);
        } else {
          throw new Error('Not found in API');
        }
      })
      .catch(() => {
        // Fallback to static posts.json
        import('../data/posts.json')
          .then(module => {
            const postsData = [...module.default].sort((a, b) => {
              const timeA = new Date(a.rawDate || a.date).getTime() || 0;
              const timeB = new Date(b.rawDate || b.date).getTime() || 0;
              return timeB - timeA;
            });
            const index = postsData.findIndex(p => p.slug === slug || p.id === slug || p._id === slug);

            if (index !== -1) {
              setPost(postsData[index]);
              setPrevPost(index > 0 ? postsData[index - 1] : null);
              setNextPost(index < postsData.length - 1 ? postsData[index + 1] : null);
            } else {
              setPost(null);
            }
          })
          .catch(() => setPost(null))
          .finally(() => setLoading(false));
      });
  }, [slug]);

  // Loading skeleton state
  if (loading) {
    return (
      <div className="py-20 px-6 max-w-4xl mx-auto text-center animate-fade-in-up">
        <div className="w-12 h-12 rounded-full bg-[var(--mint)] text-[var(--forest)] flex items-center justify-center mx-auto mb-4 animate-spin">
          <Loader2 className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-[var(--ink-soft)]">Loading Blog Post...</p>
      </div>
    );
  }

  // Handle post not found (404 state)
  if (!post) {
    return (
      <div className="py-20 px-6 max-w-4xl mx-auto text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-6 border border-red-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-display font-bold text-[var(--forest-deep)] mb-4">
          Blog Post Not Found
        </h1>
        <p className="text-[var(--ink-soft)] mb-8 max-w-md mx-auto text-sm">
          The requested blog post <code className="text-xs bg-slate-100 px-2 py-1 rounded">/free-resources/blogs/{slug}</code> could not be found.
        </p>
        <Link
          to="/free-resources/blogs"
          className="cursor-target inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--forest)] text-white font-bold text-sm hover:bg-[var(--forest-deep)] transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Blog Index
        </Link>
      </div>
    );
  }

  // Calculate estimated reading time (~200 words per minute)
  const wordCount = post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Parse shortcodes and sanitize content with DOMPurify
  const parsedContent = parseShortcodes(post.content || '');
  const sanitizedContent = DOMPurify.sanitize(parsedContent, {
    ADD_ATTR: ['target', 'rel'],
  });

  return (
    <article className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in-up">
      
      {/* Top Back Link */}
      <Link
        to="/free-resources/blogs"
        className="cursor-target inline-flex items-center text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--leaf)] mb-8 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
        Back to Blogs & Analysis
      </Link>

      {/* Header Section */}
      <header className="mb-10 pb-8 border-b border-[var(--line)]">
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories && post.categories.length > 0 ? (
            post.categories.map((cat, idx) => (
              <span
                key={idx}
                className="text-xs font-bold uppercase tracking-wider text-[var(--forest)] bg-[var(--mint)] border border-[var(--mint-deep)] px-3 py-1 rounded-full"
              >
                {typeof cat === 'object' ? cat.name : cat}
              </span>
            ))
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--forest)] bg-[var(--mint)] px-3 py-1 rounded-full">
              {post.category || 'Blog Article'}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[var(--forest-deep)] mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Byline & Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--line)] text-sm text-[var(--ink-soft)]">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Author */}
            <div className="flex items-center gap-2 font-medium text-[var(--ink)]">
              <div className="w-8 h-8 rounded-full bg-[var(--forest)] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {post.author ? post.author.charAt(0).toUpperCase() : 'C'}
              </div>
              <span>{post.author || 'RegMate Editorial Team'}</span>
            </div>

            <span className="text-[var(--line)] hidden sm:inline">•</span>

            {/* Date */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[var(--gold)]" />
              <span>{post.date || 'Recent'}</span>
            </div>

            <span className="text-[var(--line)] hidden sm:inline">•</span>

            {/* Read Time */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[var(--leaf)]" />
              <span>{readTime} min read</span>
            </div>
          </div>

          {/* Social Share & Bookmark Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="cursor-target p-2 rounded-full border border-[var(--line)] hover:bg-[var(--mint)] text-[var(--forest)] transition-colors cursor-pointer"
              title="Share Article"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              className="cursor-target p-2 rounded-full border border-[var(--line)] hover:bg-[var(--mint)] text-[var(--forest)] transition-colors cursor-pointer"
              title="Bookmark Article"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Cleaned & Shortcode-Parsed Post Body */}
      <div
        className="blog-content-body mb-16"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {/* Post Footer & Next/Prev Navigation */}
      <footer className="pt-8 border-t border-[var(--line)]">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Previous Post Link */}
          {prevPost ? (
            <Link
              to={`/free-resources/blogs/${prevPost.slug || prevPost.id}`}
              className="cursor-target group p-4 rounded-xl border border-[var(--line)] bg-white hover:border-[var(--leaf)] hover-lift transition-all cursor-pointer"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] block mb-1">
                ← Previous Article
              </span>
              <span className="font-display font-bold text-sm text-[var(--forest-deep)] group-hover:text-[var(--leaf)] line-clamp-1">
                {prevPost.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {/* Next Post Link */}
          {nextPost && (
            <Link
              to={`/free-resources/blogs/${nextPost.slug || nextPost.id}`}
              className="cursor-target group p-4 rounded-xl border border-[var(--line)] bg-white hover:border-[var(--leaf)] hover-lift text-right transition-all cursor-pointer"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] block mb-1">
                Next Article →
              </span>
              <span className="font-display font-bold text-sm text-[var(--forest-deep)] group-hover:text-[var(--leaf)] line-clamp-1">
                {nextPost.title}
              </span>
            </Link>
          )}
        </div>

        {/* Back to Blog Button */}
        <div className="text-center">
          <Link
            to="/free-resources/blogs"
            className="cursor-target inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--forest)] text-[var(--forest)] hover:bg-[var(--forest)] hover:text-white font-bold text-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Explore All 192 Blog Posts
          </Link>
        </div>

      </footer>
    </article>
  );
}
