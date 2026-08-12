import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, ChevronLeft, ChevronRight, X, Sparkles, Filter } from 'lucide-react';
import postsSummary from '../data/posts-summary.json';
import categoriesData from '../data/categories.json';

const POSTS_PER_PAGE = 12;

export default function BlogIndex() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return postsSummary.filter(post => {
      // Category filter
      const matchesCategory = selectedCategory === 'all' || 
        post.categories.some(cat => cat.slug === selectedCategory);
      
      // Search filter
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        post.categories.some(cat => cat.name.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

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
    setSelectedCategory('all');
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
          <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" /> § Codex Journal & Insights
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-[var(--forest-deep)] mb-4 tracking-tight">
          The Blog
        </h1>
        <p className="text-lg md:text-xl text-[var(--ink-soft)] max-w-3xl mx-auto leading-relaxed">
          Comprehensive collection of published insights on corporate law, GIFT IFSC regulations, IPR, business expansion, and creative living.
        </p>

        {/* Total Dataset Counter Pill */}
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--mint)] border border-[var(--line)] text-xs font-semibold text-[var(--forest)] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[var(--leaf)] animate-pulse"></span>
          <span>Sourced from <strong>{postsSummary.length} Published WordPress Blog Posts</strong></span>
        </div>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--ink-soft)] hover:bg-[var(--line)] cursor-pointer"
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
            className={`cursor-target px-4 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all cursor-pointer ${
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
              key={post.id}
              to={`/blog/${post.slug}`}
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
              className={`cursor-target px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
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
                        className={`cursor-target w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
              className={`cursor-target px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
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
