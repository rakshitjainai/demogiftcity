import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, ChevronLeft, ChevronRight, X, Sparkles, Filter } from 'lucide-react';
import postsSummary from '../data/posts-summary.json';
import categoriesData from '../data/categories.json';

const POSTS_PER_PAGE = 12;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function BlogIndex({ categoryFilter }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [dynamicPosts, setDynamicPosts] = useState([]);

  useEffect(() => {
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/blogs`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && Array.isArray(data.posts)) {
          // Filter out static duplicates if backend returned them
          const onlyDb = data.posts.filter(p => p.isDynamic);
          setDynamicPosts(onlyDb);
        }
      })
      .catch(err => console.warn('BlogIndex API fetch fallback:', err.message));
  }, []);

  // Combine dynamic posts + static posts, then sort by date
  const sortedPosts = useMemo(() => {
    const combined = [...dynamicPosts, ...postsSummary];
    return combined.sort((a, b) => {
      const timeA = new Date(a.publishedAt || a.rawDate || a.date || a.createdAt).getTime() || 0;
      const timeB = new Date(b.publishedAt || b.rawDate || b.date || b.createdAt).getTime() || 0;
      return timeB - timeA;
    });
  }, [dynamicPosts]);

  // Section specific filter logic
  const filteredPosts = useMemo(() => {
    return sortedPosts.filter(post => {
      let matchesSection = true;

      if (categoryFilter === 'explainers') {
        const explainerCats = ['gift-city-ifsc-law', 'sebi-securities-laws', 'singapore-expansion-series', 'go-global-series', 'uae-expansion-series', 'ipr', 'fema-fdi-regulations'];
        const text = (post.title + ' ' + (post.excerpt || '')).toLowerCase();
        matchesSection = post.categories.some(cat => explainerCats.includes(cat.slug)) ||
          text.includes('explainer') || text.includes('analysis') || text.includes('framework') || text.includes('overview') || text.includes('taxation') || text.includes('regulations');
      } else if (categoryFilter === 'guides') {
        const guideCats = ['checklists-procedures', 'doing-business-in-india', 'incorporation-structuring', 'docs-formats', 'board-resolutions', 'esop'];
        const text = (post.title + ' ' + (post.excerpt || '')).toLowerCase();
        matchesSection = post.categories.some(cat => guideCats.includes(cat.slug)) ||
          text.includes('guide') || text.includes('how to') || text.includes('checklist') || text.includes('procedure') || text.includes('resolution') || text.includes('template') || text.includes('format');
      } else if (categoryFilter === 'faqs') {
        const faqCats = ['insight-on-adjudication-order', 'regulatory-updates', 'secretarial-standards'];
        const text = (post.title + ' ' + (post.excerpt || '')).toLowerCase();
        matchesSection = post.categories.some(cat => faqCats.includes(cat.slug)) ||
          text.includes('test') || text.includes('quiz') || text.includes('faq') || text.includes('q&a') || text.includes('diagnostic') || text.includes('assessment') || text.includes('questions');
      } else if (selectedCategory !== 'all') {
        matchesSection = post.categories.some(cat => cat.slug === selectedCategory);
      }

      // Search filter
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        post.title.toLowerCase().includes(q) ||
        (post.excerpt || '').toLowerCase().includes(q) ||
        (post.author || '').toLowerCase().includes(q) ||
        post.categories.some(cat => (cat.name || '').toLowerCase().includes(q));

      return matchesSection && matchesSearch;
    });
  }, [sortedPosts, selectedCategory, categoryFilter, searchQuery]);

  // Section Header Info
  const headerInfo = useMemo(() => {
    if (categoryFilter === 'explainers') {
      return {
        eyebrow: '§ Regulatory Explainers & Commentary',
        title: 'Regulatory Explainers',
        desc: 'In-depth legal commentaries, statutory breakdowns, and GIFT IFSC regulatory framework explainers.'
      };
    } else if (categoryFilter === 'guides') {
      return {
        eyebrow: '📋 Compliance & Procedural Guides',
        title: 'Compliance & Procedural Guides',
        desc: 'Step-by-step secretarial procedures, board resolution formats, incorporation checklists, and filing workflows.'
      };
    } else if (categoryFilter === 'faqs') {
      return {
        eyebrow: '❓ Regulatory FAQs & Diagnostics',
        title: 'Regulatory FAQs & Self-Tests',
        desc: 'Frequently asked questions, practitioner Q&As, and interactive compliance self-assessment tests.'
      };
    }
    return {
      eyebrow: '§ Codex Journal & Insights',
      title: 'Blogs & Regulatory Analysis',
      desc: 'Comprehensive collection of published insights on corporate law, GIFT IFSC regulations, IPR, and business expansion.'
    };
  }, [categoryFilter]);

  // Reset to page 1 when search or category changes
  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(categoryFilter || 'all');
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPosts = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  const startIdx = (validCurrentPage - 1) * POSTS_PER_PAGE;
  const endIdx = Math.min(startIdx + POSTS_PER_PAGE, totalPosts);
  const currentPosts = filteredPosts.slice(startIdx, endIdx);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  // Active category display name
  const activeCategoryObj = categoriesData.find(c => c.slug === selectedCategory);
  const activeCategoryName = activeCategoryObj ? activeCategoryObj.name : 'All Categories';

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in-up">
      
      {/* Hero Header */}
      <div className="text-center mb-10">
        <span className="eyebrow block mb-3 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" /> {headerInfo.eyebrow}
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-[var(--forest-deep)] mb-4 tracking-tight">
          {headerInfo.title}
        </h1>
        <p className="text-lg md:text-xl text-[var(--ink-soft)] max-w-3xl mx-auto leading-relaxed">
          {headerInfo.desc}
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-[var(--line)] rounded-2xl p-4 md:p-6 mb-10 card-shadow">
        
        {/* Search Bar */}
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] opacity-60" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search 192 blog posts by title, topic, author, or keyword..."
            className="w-full pl-12 pr-10 py-3 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-sm text-[var(--ink)] placeholder-[var(--ink-soft)] focus:outline-none focus:border-[var(--leaf)] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-[var(--ink-soft)] hover:bg-[var(--line)] cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
            <Filter className="w-3.5 h-3.5" /> Filter by Category ({categoriesData.length} categories)
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => handleCategoryChange('all')}
              className="text-xs font-semibold text-[var(--leaf)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Clear Filter <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category Filter Pills (Horizontal Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`cursor-target px-4 py-2 rounded-full text-xs font-bold flex-shrink-0 transition-all cursor-pointer min-h-[36px] ${
              selectedCategory === 'all'
                ? 'bg-[var(--forest)] text-white shadow-sm'
                : 'bg-[var(--paper)] border border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--mint)] hover:text-[var(--forest)]'
            }`}
          >
            All Posts ({postsSummary.length})
          </button>
          {categoriesData.map(cat => {
            const count = postsSummary.filter(p => p.categories.some(c => c.slug === cat.slug)).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`cursor-target px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? 'bg-[var(--forest)] text-white shadow-sm'
                    : 'bg-[var(--paper)] border border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--mint)] hover:text-[var(--forest)]'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[var(--line)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--forest-deep)] font-display flex items-center gap-2">
            <span>{selectedCategory === 'all' ? 'All Published Blog Posts' : activeCategoryName}</span>
            {searchQuery && <span className="text-xs font-normal text-[var(--ink-soft)]">matching "{searchQuery}"</span>}
          </h2>
          <p className="text-xs text-[var(--ink-soft)] mt-0.5">
            {totalPosts > 0 ? (
              <>Showing <strong className="text-[var(--ink)]">{startIdx + 1}–{endIdx}</strong> of <strong className="text-[var(--ink)]">{totalPosts}</strong> published blog posts</>
            ) : (
              'No published blog posts match your criteria'
            )}
          </p>
        </div>

        {/* Pagination Indicator Top */}
        {totalPages > 1 && (
          <div className="text-xs text-[var(--ink-soft)] font-medium bg-[var(--mint)] px-3 py-1 rounded-lg border border-[var(--line)]">
            Page {validCurrentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* Posts Cards Grid */}
      {currentPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {currentPosts.map(post => (
            <Link
              key={post.id || post._id}
              to={`/free-resources/blogs/${post.slug || post.id || post._id}`}
              className="cursor-target group flex flex-col bg-white border border-[var(--line)] rounded-2xl overflow-hidden card-shadow hover-lift p-6 transition-all duration-200"
            >
              {/* Category Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.categories && post.categories.length > 0 ? (
                  post.categories.slice(0, 2).map((cat, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-bold uppercase tracking-wider text-[var(--forest)] bg-[var(--mint)] px-2.5 py-1 rounded-md border border-[var(--mint-deep)]"
                    >
                      {cat.name}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--forest)] bg-[var(--mint)] px-2.5 py-1 rounded-md">
                    Blog
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-display font-bold text-xl text-[var(--forest-deep)] group-hover:text-[var(--leaf)] transition-colors line-clamp-2 mb-3 leading-snug">
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="text-[var(--ink-soft)] text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                {post.excerpt}
              </p>

              {/* Author & Date Metadata */}
              <div className="pt-4 border-t border-[var(--line)] mt-auto flex items-center justify-between text-xs text-[var(--ink-soft)]">
                <div className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-[var(--leaf)]" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--gold)]" />
                  <span>{post.date}</span>
                </div>
              </div>

              {/* Read Action Button */}
              <div className="mt-4 flex items-center justify-between text-xs font-bold text-[var(--leaf)] group-hover:text-[var(--forest)] transition-colors">
                <span>Read Article</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-[var(--line)] rounded-2xl p-12 text-center my-8 card-shadow">
          <div className="w-16 h-16 rounded-full bg-[var(--mint)] text-[var(--forest)] flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-xl font-display font-bold text-[var(--forest-deep)] mb-2">No Blog Posts Found</h3>
          <p className="text-[var(--ink-soft)] max-w-md mx-auto mb-6 text-sm">
            We couldn't find any blog posts matching "{searchQuery}" in the selected category.
          </p>
          <button
            onClick={handleResetFilters}
            className="cursor-target px-6 py-2.5 bg-[var(--forest)] text-white text-sm font-bold rounded-full hover:bg-[var(--forest-deep)] transition-all cursor-pointer inline-flex items-center gap-2"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--line)]">
          <div className="text-xs text-[var(--ink-soft)]">
            Showing page <strong className="text-[var(--ink)]">{validCurrentPage}</strong> of <strong className="text-[var(--ink)]">{totalPages}</strong> ({totalPosts} total published posts)
          </div>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() => goToPage(validCurrentPage - 1)}
              disabled={validCurrentPage === 1}
              className={`cursor-target px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all min-h-[44px] ${
                validCurrentPage === 1
                  ? 'border-[var(--line)] text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--mint)] hover:text-[var(--forest)] cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - validCurrentPage) <= 2)
                .map((page, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span className="px-1 text-xs text-[var(--ink-soft)]">...</span>}
                      <button
                        onClick={() => goToPage(page)}
                        className={`cursor-target w-10 h-10 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          validCurrentPage === page
                            ? 'bg-[var(--forest)] text-white shadow-xs'
                            : 'bg-white border border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--mint)] hover:text-[var(--forest)]'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => goToPage(validCurrentPage + 1)}
              disabled={validCurrentPage === totalPages}
              className={`cursor-target px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all min-h-[44px] ${
                validCurrentPage === totalPages
                  ? 'border-[var(--line)] text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--mint)] hover:text-[var(--forest)] cursor-pointer'
              }`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
