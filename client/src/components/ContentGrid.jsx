import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Bell, BookOpen, Sparkles, User, Clock,
  FileCheck, Award, Layers, ShieldCheck, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LATEST_UPDATES, LEARNING_MODULES, LATEST_BLOGS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const iconMap = { FileCheck, Award, Layers, ShieldCheck };

export default function ContentGrid({ onSelectArticle, onSelectUpdate, onSelectModule }) {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState(LATEST_BLOGS);
  const [loadingBlogs, setLoadingBlogs] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetch(`${API_BASE_URL}/blogs?limit=15`)
      .then(res => res.json())
      .then(data => {
        let rawList = [];
        if (Array.isArray(data) && data.length > 0) {
          rawList = data;
        } else if (data.ok && Array.isArray(data.posts) && data.posts.length > 0) {
          rawList = data.posts;
        }
        
        if (rawList.length > 0) {
          const seenSlugs = new Set();
          const seenTitles = new Set();
          const clean = [];

          // 1. Process API posts, filtering test fixtures and duplicates
          for (const b of rawList) {
            if (!b || !b.slug || !b.title) continue;
            const slugKey = b.slug.trim().toLowerCase();
            const titleKey = b.title.trim().toLowerCase();
            if (slugKey.startsWith('bulk-test') || titleKey.includes('bulk test') || titleKey.includes('test post')) continue;
            if (!seenSlugs.has(slugKey) && !seenTitles.has(titleKey)) {
              seenSlugs.add(slugKey);
              seenTitles.add(titleKey);
              clean.push(b);
            }
          }

          // 2. Ensure at least 5 distinct featured articles by filling from LATEST_BLOGS
          for (const mock of LATEST_BLOGS) {
            const slugKey = mock.slug.trim().toLowerCase();
            const titleKey = mock.title.trim().toLowerCase();
            if (!seenSlugs.has(slugKey) && !seenTitles.has(titleKey)) {
              seenSlugs.add(slugKey);
              seenTitles.add(titleKey);
              clean.push(mock);
            }
          }

          if (clean.length > 0) {
            setBlogs(clean);
          }
        }
      })
      .catch(err => {
        console.warn('Using mockData fallback for blogs list:', err.message);
        setBlogs(LATEST_BLOGS);
      });
  }, []);

  return (
    <section className="py-12" style={{ background: 'var(--mint)', borderBottom: '1px solid var(--line)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

          {/* ─── Column 1: Latest Updates ─── */}
          <div
            className="bg-white rounded-2xl p-6 flex flex-col justify-between gap-4 card-shadow"
            style={{ border: '1px solid var(--line)' }}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-3" style={{ borderBottom: '1px solid var(--line)' }}>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl" style={{ background: 'var(--mint)' }}>
                    <Bell className="w-4 h-4" style={{ color: 'var(--forest)' }} />
                  </div>
                  <div>
                    <h3
                      className="text-base leading-none"
                      style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, color: 'var(--ink)' }}
                    >
                      Latest Updates
                    </h3>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                      Circulars, Amendments & Orders
                    </p>
                  </div>
                </div>
                <Link
                  to="/news"
                  className="text-xs font-semibold flex items-center gap-1 hover:underline"
                  style={{ color: 'var(--leaf)' }}
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Updates list */}
              <div className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 1, borderColor: 'var(--line)' }}>
                {LATEST_UPDATES.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectUpdate?.(item)}
                    className="py-2.5 first:pt-0 cursor-pointer group rounded-xl px-2 -mx-2 transition-all hover:bg-[var(--mint)]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border"
                        style={getCategoryStyle(item.category || '')}
                      >
                        {item.category || 'Update'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>
                          {item.date}
                        </span>
                      </div>
                    </div>
                    <h4
                      className="text-xs font-semibold leading-snug group-hover:underline line-clamp-2"
                      style={{ color: 'var(--ink)' }}
                    >
                      {item.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Column 2: Latest Blogs / Articles ─── */}
          <div
            className="bg-white rounded-2xl p-6 flex flex-col justify-between gap-4 card-shadow"
            style={{ border: '1px solid var(--line)' }}
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-3" style={{ borderBottom: '1px solid var(--line)' }}>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl" style={{ background: '#EEF3FF' }}>
                    <BookOpen className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div>
                    <h3
                      className="text-base leading-none"
                      style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, color: 'var(--ink)' }}
                    >
                      Latest Articles
                    </h3>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                      Insights by CS Prashant Kumar
                    </p>
                  </div>
                </div>
                <Link
                  to="/free-resources/blogs"
                  className="text-xs font-semibold flex items-center gap-1 hover:underline"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {loadingBlogs ? (
                <div className="flex justify-center py-8">
                  <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Loading articles...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {blogs.slice(0, 5).map((blog) => {
                    if (!blog || !blog.slug) return null;
                    const IconComp = iconMap[blog.iconName] || BookOpen;
                    return (
                      <Link
                        key={blog.slug}
                        to={`/free-resources/blogs/${blog.slug}`}
                        className="flex items-center gap-3 p-2 rounded-xl cursor-pointer group transition-all hover:bg-[var(--mint)] -mx-1.5 px-2 no-underline border border-transparent hover:border-[var(--line)]"
                        style={{ textDecoration: 'none' }}
                      >
                        {/* Gradient thumbnail */}
                        <div
                          className={`w-10 h-10 rounded-lg flex-shrink-0 flex flex-col items-center justify-center bg-gradient-to-br ${blog.imageBg || 'from-emerald-800 to-slate-900'} group-hover:scale-105 transition-transform shadow-xs`}
                        >
                          <IconComp className="w-4 h-4 text-white/80" />
                          <span className="text-[7.5px] font-bold text-white/70 uppercase tracking-tighter line-clamp-1 px-0.5">
                            {blog.category?.split(' ')[0] || ''}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4
                            className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-[var(--forest)] text-[var(--ink)]"
                          >
                            {blog.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px]" style={{ color: 'var(--ink-soft)' }}>
                            <span className="flex items-center gap-1 truncate">
                              <User className="w-3 h-3 flex-shrink-0" /> {blog.author || 'CS Prashant Kumar'}
                            </span>
                            <span className="flex items-center gap-1 flex-shrink-0">
                              <Clock className="w-3 h-3" /> {blog.date}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ─── Column 3: Popular Learning Modules ─── */}
          <div
            className="bg-white rounded-2xl p-6 flex flex-col gap-5 card-shadow"
            style={{ border: '1px solid var(--line)' }}
          >
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl" style={{ background: '#F3EEFF' }}>
                  <Sparkles className="w-4 h-4" style={{ color: '#7C3AED' }} />
                </div>
                <div>
                  <h3
                    className="text-base leading-none"
                    style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, color: 'var(--ink)' }}
                  >
                    Learning Modules
                  </h3>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                    Interactive Drills & Certification
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {LEARNING_MODULES.map((mod) => {
                const totalChapters = mod.totalChapters || mod.chapters?.length || 1;
                const totalLessons = mod.totalLessons || mod.chapters?.length || 1;
                const courseProgress = user?.courseProgress?.find(p => p.courseSlug === mod.slug || p.courseSlug === mod.id);
                const completedCount = courseProgress ? (courseProgress.completedItems?.length || 0) : (user?.learningProgress?.find(p => p.moduleId === mod.id)?.completedLessons?.length || 0);
                const progressPct = totalChapters > 0 ? Math.min(100, Math.round((completedCount / totalChapters) * 100)) : 0;

                return (
                  <Link
                    key={mod.id}
                    to={`/learning?course=${mod.slug}`}
                    className={`rounded-2xl p-4 cursor-pointer group transition-all hover:scale-[1.02] relative overflow-hidden block no-underline ${mod.color}`}
                    style={{ border: `1px solid`, textDecoration: 'none' }}
                  >
                    {/* Corner glow decoration */}
                    <div
                      className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none opacity-30"
                      style={{ background: 'rgba(255,255,255,0.2)' }}
                    />

                    {/* Top row: code pill + badge + arrow */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 border border-white/20 uppercase tracking-wider text-white">
                          {mod.code}
                        </span>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--gold-soft)', color: 'var(--ink)' }}
                        >
                          {mod.badge}
                        </span>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Title in Fraunces */}
                    <h4
                      className="text-sm leading-snug mb-3 text-white"
                      style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
                    >
                      {mod.title}
                    </h4>

                    {/* Dynamic Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-white/75 font-medium">
                        <span>{user ? `${completedCount}/${totalChapters} Chapters (${totalLessons} Lessons)` : `${totalChapters} Chapters · ${totalLessons} Lessons`}</span>
                        <span className="font-bold text-white">
                          {user ? `${progressPct}% Complete` : 'Sign in to track'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: user ? `${progressPct}%` : '0%',
                            background: 'linear-gradient(90deg, var(--gold-soft), var(--gold))',
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

function getCategoryStyle(type) {
  const t = (type || '').toUpperCase();
  if (t.includes('GIFT') || t.includes('IFSC')) return { background: '#EEF3FF', color: '#1E5AA8', borderColor: '#C7D8F5' };
  if (t.includes('CORPORATE') || t.includes('DOING BUSINESS')) return { background: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' };
  if (t.includes('IPR') || t.includes('STARTUP') || t.includes('ESOP')) return { background: '#FEE2E2', color: '#991B1B', borderColor: '#FECACA' };
  if (t.includes('CAPITAL') || t.includes('DOCS')) return { background: '#EEF6F0', color: '#0B4D33', borderColor: '#C6E8D1' };
  return { background: '#F1F5F9', color: '#475569', borderColor: '#CBD5E1' };
}
