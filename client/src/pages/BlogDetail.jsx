import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Share2, Bookmark, AlertCircle, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';

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

    import('../data/posts.json')
      .then(module => {
        const postsData = [...module.default].sort((a, b) => {
          const timeA = new Date(a.rawDate || a.date).getTime() || 0;
          const timeB = new Date(b.rawDate || b.date).getTime() || 0;
          return timeB - timeA;
        });
        const index = postsData.findIndex(p => p.slug === slug);

        if (index !== -1) {
          setPost(postsData[index]);
          setPrevPost(index > 0 ? postsData[index - 1] : null);
          setNextPost(index < postsData.length - 1 ? postsData[index + 1] : null);
        } else {
          setPost(null);
          setPrevPost(null);
          setNextPost(null);
        }
      })
      .catch(err => {
        console.error('Failed to load blog posts data:', err);
        setPost(null);
      })
      .finally(() => {
        setLoading(false);
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
          The requested blog post <code className="text-xs bg-slate-100 px-2 py-1 rounded">/blog/{slug}</code> could not be found or may have been relocated.
        </p>
        <Link
          to="/blog"
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

  // Sanitize content with DOMPurify
  const sanitizedContent = DOMPurify.sanitize(post.content, {
    ADD_ATTR: ['target', 'rel'],
  });

  return (
    <article className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in-up">
      
      {/* Top Back Link */}
      <Link
        to="/blog"
        className="cursor-target inline-flex items-center text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--leaf)] mb-8 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
        Back to Blog
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
                {cat.name}
              </span>
            ))
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--forest)] bg-[var(--mint)] px-3 py-1 rounded-full">
              Blog Article
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
              <span>{post.author}</span>
            </div>

            <span className="text-[var(--line)] hidden sm:inline">•</span>

            {/* Date */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[var(--gold)]" />
              <span>{post.date}</span>
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

      {/* Cleaned WordPress Post Body */}
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
              to={`/blog/${prevPost.slug}`}
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
              to={`/blog/${nextPost.slug}`}
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
            to="/blog"
            className="cursor-target inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--forest)] text-[var(--forest)] hover:bg-[var(--forest)] hover:text-white font-bold text-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Explore All 192 Blog Posts
          </Link>
        </div>

      </footer>

    </article>
  );
}
