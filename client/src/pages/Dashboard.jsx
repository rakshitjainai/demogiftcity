import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, ArrowRight, Clock, Bookmark, Layers, Sparkles, CheckCircle2, ShieldCheck, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ACTS_DATA, getActName } from '../data/regulationsData';
import coursesData from '../data/courses.json';

export default function Dashboard() {
  const { user } = useAuth();

  // Get last read from user object or local fallback
  const lastRead = user?.readingProgress || JSON.parse(localStorage.getItem('regmate_last_read') || 'null');
  
  // Get bookmarked provisions
  const bookmarks = JSON.parse(localStorage.getItem('regmate_bookmarks') || '[]');

  // Get user course progress
  const getCourseProgress = (slug) => {
    const course = coursesData[slug];
    if (!course) return { pct: 0, completed: 0, total: 1 };
    
    let completed = 0;
    if (user?.courseProgress) {
      const entry = user.courseProgress.find(c => c.courseSlug === slug);
      if (entry) completed = entry.completedItems?.length || 0;
    } else {
      const guestProgress = JSON.parse(localStorage.getItem('regmate_guest_course_progress') || '{}');
      completed = guestProgress[slug]?.completedItems?.length || 0;
    }

    const pct = Math.min(100, Math.round((completed / course.totalItems) * 100));
    return { pct, completed, total: course.totalItems };
  };

  const actsList = Object.entries(ACTS_DATA).map(([slug, data]) => ({
    slug,
    title: data.title,
    totalChapters: data.totalChapters,
    totalSections: data.chapters.reduce((n, c) => n + c.sections.length, 0)
  }));

  const userName = user?.name || 'Practitioner';

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto space-y-10 animate-fade-in-up pb-24">
      
      {/* ─── WELCOME HEADER ───────────────────────────────────────────────── */}
      <div className="bg-forest-deep text-paper rounded-3xl p-8 md:p-10 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-leaf/20 to-transparent pointer-events-none" />
        
        <div className="space-y-3 z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-mint/20 text-mint font-bold text-xs rounded-full uppercase tracking-wider">
              {user?.role === 'admin' ? 'Administrator' : 'Member Workspace'}
            </span>
            <span className="px-2.5 py-0.5 bg-gold/20 text-gold text-xs font-bold rounded-full">
              Verifiable License Active
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-display text-white font-semibold">
            Welcome back, {userName}
          </h1>
          <p className="text-paper/80 text-sm max-w-xl">
            Track your ongoing regulatory reading, course progress, statutory bookmarks, and practitioner tools.
          </p>
        </div>

        <div className="flex gap-3 z-10 flex-wrap">
          <Link
            to="/interactive-regulations"
            className="cursor-target px-5 py-2.5 bg-mint text-forest font-semibold text-xs rounded-xl hover:bg-mint-deep transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" /> Browse Regulations
          </Link>
          <Link
            to="/learning"
            className="cursor-target px-5 py-2.5 bg-white/10 text-white font-semibold text-xs rounded-xl hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-2"
          >
            <PlayCircle className="w-4 h-4" /> Learning Modules
          </Link>
        </div>
      </div>

      {/* ─── CONTINUE READING CARD ────────────────────────────────────────── */}
      {lastRead && lastRead.actSlug ? (
        <div className="bg-white border-2 border-forest/20 rounded-2xl p-6 md:p-8 card-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-forest flex-shrink-0 mt-1">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-leaf uppercase tracking-wider block">
                Continue Reading
              </span>
              <h3 className="text-xl font-display text-forest-deep font-semibold mt-1">
                {getActName(lastRead.actSlug)}
              </h3>
              <p className="text-sm text-ink-soft mt-0.5">
                Chapter {lastRead.chapter?.replace('chapter-', '') || '1'} • Regulation {lastRead.sectionNum} {lastRead.sectionTitle ? `— ${lastRead.sectionTitle}` : ''}
              </p>
            </div>
          </div>

          <Link
            to={`/interactive-regulations/${lastRead.actSlug}/${lastRead.chapter || 'chapter-1'}/section-${lastRead.sectionNum || '1'}`}
            className="cursor-target px-6 py-3 bg-forest text-white font-semibold text-sm rounded-xl hover:bg-leaf transition-all shadow-md flex items-center gap-2 flex-shrink-0"
          >
            <span>Continue Reading</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-paper border border-line rounded-2xl p-6 text-center text-ink-soft text-sm">
          <Clock className="w-8 h-8 text-leaf mx-auto mb-2 opacity-60" />
          <p className="font-semibold text-forest-deep">No recent reading history recorded yet.</p>
          <p className="text-xs mt-1">Start reading any Interactive Regulation to resume where you left off!</p>
        </div>
      )}

      {/* ─── MY LIBRARY (ACTS & COURSES) ─────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display text-forest-deep font-semibold">My Library</h2>
            <p className="text-xs text-ink-soft">Master corporate and IFSC laws with real-time completion metrics.</p>
          </div>
          <Link to="/learning" className="cursor-target text-xs font-semibold text-forest hover:text-leaf">
            View All Courses →
          </Link>
        </div>

        {/* Course Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* IFSCA-CMI Card */}
          {(() => {
            const { pct, completed, total } = getCourseProgress('ifsca-cmi');
            return (
              <div className="bg-white border border-line rounded-2xl p-6 card-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-mint text-forest font-bold text-xs rounded-full uppercase">
                      IFSCA-CMI
                    </span>
                    <span className="text-xs font-bold text-forest">{user ? `${pct}%` : '0%'} Complete</span>
                  </div>
                  <h3 className="font-semibold text-lg text-forest-deep mb-2">
                    IFSCA (Capital Market Intermediaries) Regulations, 2025
                  </h3>
                  <p className="text-xs text-ink-soft mb-4">
                    17 Chapters • 35 Structured Lessons • 102 Practice MCQs
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="w-full bg-line h-2 rounded-full overflow-hidden">
                    <div className="bg-leaf h-full rounded-full" style={{ width: user ? `${pct}%` : '0%' }} />
                  </div>
                  <Link
                    to="/learning"
                    className="cursor-target block text-center py-2.5 bg-paper border border-line text-forest font-semibold text-xs rounded-xl hover:bg-mint transition-colors"
                  >
                    Open Course Syllabus ({completed}/{total} Completed)
                  </Link>
                </div>
              </div>
            );
          })()}

          {/* SEBI-AIF Card */}
          {(() => {
            const { pct, completed, total } = getCourseProgress('sebi-aif');
            return (
              <div className="bg-white border border-line rounded-2xl p-6 card-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-mint text-forest font-bold text-xs rounded-full uppercase">
                      SEBI-AIF
                    </span>
                    <span className="text-xs font-bold text-forest">{user ? `${pct}%` : '0%'} Complete</span>
                  </div>
                  <h3 className="font-semibold text-lg text-forest-deep mb-2">
                    SEBI (Alternative Investment Funds) Regulations, 2012
                  </h3>
                  <p className="text-xs text-ink-soft mb-4">
                    14 Chapters • 14 Structured Lessons • 64 Practice MCQs
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="w-full bg-line h-2 rounded-full overflow-hidden">
                    <div className="bg-leaf h-full rounded-full" style={{ width: user ? `${pct}%` : '0%' }} />
                  </div>
                  <Link
                    to="/learning"
                    className="cursor-target block text-center py-2.5 bg-paper border border-line text-forest font-semibold text-xs rounded-xl hover:bg-mint transition-colors"
                  >
                    Open Course Syllabus ({completed}/{total} Completed)
                  </Link>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Acts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {actsList.map(act => (
            <Link
              key={act.slug}
              to={`/interactive-regulations/${act.slug}/chapter-1`}
              className="cursor-target bg-paper border border-line rounded-xl p-5 hover:bg-white hover:border-forest transition-all card-shadow block space-y-2"
            >
              <h4 className="font-semibold text-forest-deep text-sm leading-snug">{act.title}</h4>
              <p className="text-xs text-ink-soft">{act.totalChapters} Chapters • {act.totalSections} Provisions</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── SAVED BOOKMARKS ─────────────────────────────────────────────── */}
      {bookmarks.length > 0 && (
        <div className="bg-white border border-line rounded-2xl p-6 md:p-8 card-shadow space-y-4">
          <h3 className="font-semibold text-forest-deep text-lg flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-gold fill-gold" /> Saved Bookmarks ({bookmarks.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookmarks.map((bm, idx) => (
              <Link
                key={idx}
                to={bm.url}
                className="cursor-target p-3.5 bg-paper border border-line rounded-xl hover:bg-mint/30 transition-colors flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-forest truncate pr-2">{bm.title}</span>
                <ArrowRight className="w-4 h-4 text-ink-soft flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM TAB BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line px-4 py-3 flex items-center justify-around z-40 text-[11px] font-medium text-ink-soft">
        <Link to="/dashboard" className="flex flex-col items-center text-forest font-bold">
          <BookOpen className="w-5 h-5 mb-0.5 text-forest" />
          <span>Dashboard</span>
        </Link>
        <Link to="/interactive-regulations" className="flex flex-col items-center hover:text-forest">
          <Layers className="w-5 h-5 mb-0.5" />
          <span>Library</span>
        </Link>
        <Link to="/learning" className="flex flex-col items-center hover:text-forest">
          <PlayCircle className="w-5 h-5 mb-0.5" />
          <span>Learning</span>
        </Link>
        <Link to="/my-certificates" className="flex flex-col items-center hover:text-forest">
          <Award className="w-5 h-5 mb-0.5" />
          <span>Certificates</span>
        </Link>
      </div>

    </div>
  );
}
