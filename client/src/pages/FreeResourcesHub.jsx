import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen, BookOpen, FileText, HelpCircle, CheckSquare,
  Download, FileSpreadsheet, Vote, BookMarked, ArrowRight, Sparkles
} from 'lucide-react';
import { LATEST_BLOGS } from '../data/mockData';

export default function FreeResourcesHub() {
  const resourceCategories = [
    {
      id: 'blogs',
      title: 'Expert Commentary & Blogs',
      desc: 'Deep-dive analysis on corporate structuring, GIFT IFSC regulations, SEBI guidelines, and startup ESOPs.',
      icon: <BookOpen className="w-6 h-6 text-emerald-700" />,
      link: '/free-resources/blogs',
      actionText: 'Browse All Blogs',
      count: '50+ Articles'
    },
    {
      id: 'templates',
      title: 'Board Formats & Templates',
      desc: 'Ready-to-use board resolution formats, secretarial minutes, statutory filings checklists, and compliance registers.',
      icon: <FileSpreadsheet className="w-6 h-6 text-blue-700" />,
      link: '/free-resources/templates',
      actionText: 'Download Templates',
      count: '30+ Formats'
    },
    {
      id: 'explainers',
      title: 'Regulatory Explainers & Guides',
      desc: 'Step-by-step practical guides breaking down intricate statutory provisions into straightforward visual workflows.',
      icon: <FileText className="w-6 h-6 text-amber-700" />,
      link: '/free-resources/blogs',
      actionText: 'Read Guides',
      count: '40+ Guides'
    },
    {
      id: 'checklists',
      title: 'Compliance Checklists',
      desc: 'Actionable checklists for private company incorporation, AGM compliance, annual ROC filings, and secretarial audits.',
      icon: <CheckSquare className="w-6 h-6 text-purple-700" />,
      link: '/tools',
      actionText: 'View Checklists',
      count: '25+ Checklists'
    },
    {
      id: 'faqs',
      title: 'Regulatory FAQs',
      desc: 'Authoritative answers to the most frequently encountered ambiguities in Companies Act, SEBI LODR, and IFSC rules.',
      icon: <HelpCircle className="w-6 h-6 text-rose-700" />,
      link: '/free-resources/blogs',
      actionText: 'Explore FAQs',
      count: '100+ Q&As'
    },
    {
      id: 'glossary',
      title: 'Regulatory Glossary',
      desc: 'Exhaustive dictionary of Indian and IFSC financial legal definitions, statutory acronyms, and terms of art.',
      icon: <BookMarked className="w-6 h-6 text-teal-700" />,
      link: '/interactive-regulations',
      actionText: 'Browse Glossary',
      count: '500+ Defined Terms'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--mint)] border border-[var(--leaf)]/30 rounded-full text-xs font-bold text-[var(--forest)] uppercase tracking-wider mb-4">
            <FolderOpen size={14} className="text-[var(--leaf)]" /> Free Public Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--forest-deep)] tracking-tight">
            Free Regulatory Resources & Templates
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[var(--ink-soft)] leading-relaxed">
            Freely accessible legal commentaries, standard board resolution formats, statutory checklists, and foundational guides for Indian and IFSC corporate professionals.
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {resourceCategories.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-sm hover:shadow-md hover:border-[var(--leaf)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--mint)] flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="px-2.5 py-1 bg-[var(--mint-deep)] text-[var(--forest-deep)] text-xs font-bold rounded-full">
                    {item.count}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[var(--forest-deep)] mb-2 font-serif">
                  {item.title}
                </h2>
                <p className="text-[13px] text-[var(--ink-soft)] leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <Link
                to={item.link}
                className="inline-flex items-center justify-between px-3.5 py-2 bg-[var(--mint)] hover:bg-[var(--forest)] hover:text-white text-[var(--forest-deep)] text-xs font-bold rounded-xl transition-colors group"
              >
                <span>{item.actionText}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

        {/* Featured Recent Blogs Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[var(--line)] shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--line)]">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[var(--forest-deep)]">
                Latest Regulatory Commentaries
              </h2>
              <p className="text-xs text-[var(--ink-soft)] mt-1">
                Authored by CS Prashant Kumar and the RegMate editorial team
              </p>
            </div>
            <Link
              to="/free-resources/blogs"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[var(--leaf)] hover:text-[var(--forest)]"
            >
              <span>View All Articles</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LATEST_BLOGS.slice(0, 3).map((blog) => (
              <Link
                key={blog.id}
                to={`/free-resources/blogs/${blog.id}`}
                className="group p-5 rounded-2xl bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--leaf)] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-[var(--mint-deep)] text-[var(--forest)] text-[10.5px] font-bold uppercase tracking-wider">
                    {blog.category}
                  </span>
                  <h3 className="text-base font-bold text-[var(--forest-deep)] mt-3 mb-2 font-serif group-hover:text-[var(--leaf)] transition-colors leading-snug">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-[var(--ink-soft)] line-clamp-3 leading-relaxed mb-4">
                    {blog.summary}
                  </p>
                </div>
                <div className="pt-3 border-t border-[var(--line)] text-[11px] text-[var(--ink-soft)] flex items-center justify-between">
                  <span>{blog.date}</span>
                  <span className="font-semibold text-[var(--leaf)] group-hover:underline">Read Article →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
