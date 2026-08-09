import React from 'react';
import {
  ArrowRight, Bell, BookOpen, Sparkles, User, Clock,
  FileCheck, Award, Layers, ShieldCheck, ChevronRight
} from 'lucide-react';
import { LATEST_UPDATES, LATEST_BLOGS, LEARNING_MODULES } from '../data/mockData';

const iconMap = { FileCheck, Award, Layers, ShieldCheck };

export default function ContentGrid({ onSelectArticle, onSelectUpdate, onSelectModule }) {
  return (
    <section className="py-12" style={{ background: 'var(--mint)', borderBottom: '1px solid var(--line)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Column 1: Latest Updates ─── */}
          <div
            className="bg-white rounded-2xl p-6 flex flex-col gap-5 card-shadow"
            style={{ border: '1px solid var(--line)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
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
              <button
                onClick={() => onSelectUpdate?.(LATEST_UPDATES[0])}
                className="text-xs font-semibold flex items-center gap-1 hover:underline"
                style={{ color: 'var(--leaf)' }}
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Updates list */}
            <div className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 1, borderColor: 'var(--line)' }}>
              {LATEST_UPDATES.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectUpdate?.(item)}
                  className="py-3.5 first:pt-0 cursor-pointer group rounded-xl px-2 -mx-2 transition-all hover:bg-[var(--mint)]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border"
                      style={getCategoryStyle(item.type)}
                    >
                      {item.type}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.isNew && (
                        <span
                          className="text-[9px] font-black px-1.5 py-0.5 rounded text-white"
                          style={{ background: 'var(--leaf)' }}
                        >
                          ● New
                        </span>
                      )}
                      <span className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>
                        {item.date}
                      </span>
                    </div>
                  </div>
                  <h4
                    className="text-[13px] font-semibold leading-snug group-hover:underline"
                    style={{ color: 'var(--ink)' }}
                  >
                    {item.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Column 2: Latest Blogs / Articles ─── */}
          <div
            className="bg-white rounded-2xl p-6 flex flex-col gap-5 card-shadow"
            style={{ border: '1px solid var(--line)' }}
          >
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
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
              <button
                onClick={() => onSelectArticle?.(LATEST_BLOGS[0])}
                className="text-xs font-semibold flex items-center gap-1 hover:underline"
                style={{ color: 'var(--accent-blue)' }}
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {LATEST_BLOGS.map((blog) => {
                const IconComp = iconMap[blog.iconName] || BookOpen;
                return (
                  <div
                    key={blog.id}
                    onClick={() => onSelectArticle?.(blog)}
                    className="flex items-start gap-3 p-2 rounded-xl cursor-pointer group transition-all hover:bg-[var(--mint)] -mx-2 px-2"
                  >
                    {/* Gradient thumbnail */}
                    <div
                      className={`w-14 h-14 rounded-xl flex-shrink-0 flex flex-col items-center justify-center bg-gradient-to-br ${blog.imageBg} group-hover:scale-105 transition-transform`}
                      style={{ boxShadow: '0 2px 8px rgba(11,77,51,0.15)' }}
                    >
                      <IconComp className="w-5 h-5 text-white/80" />
                      <span className="text-[8px] font-bold text-white/60 mt-0.5 uppercase tracking-tight">
                        {blog.category.split(' ')[0]}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-[var(--forest)]"
                        style={{ color: 'var(--ink)' }}
                      >
                        {blog.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px]" style={{ color: 'var(--ink-soft)' }}>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {blog.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {blog.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              {LEARNING_MODULES.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => onSelectModule?.(mod)}
                  className={`rounded-2xl p-4 cursor-pointer group transition-all hover:scale-[1.02] relative overflow-hidden ${mod.color}`}
                  style={{ border: `1px solid` }}
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

                  {/* Progress bar in gold-soft */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-white/75 font-medium">
                      <span>{mod.completedLessons}/{mod.lessons} Lessons</span>
                      <span className="font-bold text-white">{mod.progress}% Complete</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${mod.progress}%`,
                          background: 'linear-gradient(90deg, var(--gold-soft), var(--gold))',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function getCategoryStyle(type) {
  const t = type.toUpperCase();
  if (t.includes('CIRCULAR')) return { background: '#EEF3FF', color: '#1E5AA8', borderColor: '#C7D8F5' };
  if (t.includes('AMENDMENT')) return { background: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' };
  if (t.includes('ENFORCEMENT')) return { background: '#FEE2E2', color: '#991B1B', borderColor: '#FECACA' };
  if (t.includes('NOTIFICATION')) return { background: '#EEF6F0', color: '#0B4D33', borderColor: '#C6E8D1' };
  return { background: '#F1F5F9', color: '#475569', borderColor: '#CBD5E1' };
}
