import React, { useState, useEffect } from 'react';
import { PlayCircle, BookOpen, HelpCircle, Loader2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegulatoryMasterModal from '../components/RegulatoryMasterModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Course definitions — metadata only, NO fake progress numbers
const COURSES = [
  {
    id: 'mod-cmi',
    code: 'IFSCA-CMI',
    slug: 'ifsca-cmi',
    title: 'IFSCA (Capital Market Intermediaries) Regulations, 2025',
    description: 'In-depth study of registration, net worth, governance, code of conduct, and enforcement for all 11 CMI categories in GIFT IFSC.',
    badge: 'Updated 2026',
    color: 'from-slate-900 via-slate-800 to-blue-900',
    accentColor: 'bg-blue-500',
  },
  {
    id: 'mod-fme',
    code: 'IFSCA-FME',
    slug: 'ifsca-fme',
    title: 'IFSCA (Fund Management) Regulations, 2025',
    description: 'Masterclass on FMEs, Venture Capital Schemes, PMS, ESG funds, Family Investment Funds, and Investment Trusts in GIFT City.',
    badge: 'Most Popular',
    color: 'from-emerald-900 via-emerald-800 to-teal-900',
    accentColor: 'bg-emerald-500',
  },
  {
    id: 'mod-aif',
    code: 'SEBI-AIF',
    slug: 'sebi-aif',
    title: 'SEBI (Alternative Investment Funds) Regulations, 2012',
    description: 'Comprehensive coverage of Category I, II & III AIFs, Angel Funds, PPM structuring, accredited investors, valuation, and GARUDA filings.',
    badge: 'New Content',
    color: 'from-amber-900 via-amber-800 to-orange-900',
    accentColor: 'bg-amber-500',
  },
];

export default function Learning() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Meta from API (lesson/question counts)
  const [courseMeta, setCourseMeta] = useState({});
  const [metaLoading, setMetaLoading] = useState(true);

  // Fetch real counts from server for all three courses
  useEffect(() => {
    const fetchAll = async () => {
      setMetaLoading(true);
      const results = await Promise.allSettled(
        COURSES.map(c =>
          fetch(`${API_BASE}/regulatory-master/${c.slug}/meta`)
            .then(r => r.json())
            .then(data => ({ slug: c.slug, data }))
        )
      );
      const meta = {};
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value?.data?.counts) {
          meta[r.value.slug] = r.value.data.counts;
        }
      });
      setCourseMeta(meta);
      setMetaLoading(false);
    };
    fetchAll();
  }, []);

  // Get real progress for a course slug from user's courseProgress
  const getCourseProgress = (slug) => {
    const meta = courseMeta[slug];
    const total = meta?.total || 1;
    let completed = 0;

    if (user?.courseProgress) {
      const entry = user.courseProgress.find(c => c.courseSlug === slug);
      if (entry) completed = entry.completedItems?.length || 0;
    } else {
      const guest = JSON.parse(localStorage.getItem('regmate_guest_course_progress') || '{}');
      completed = guest[slug]?.completedItems?.length || 0;
    }

    const pct = Math.min(100, Math.round((completed / total) * 100));
    return { completed, total, pct };
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between mb-10 sm:mb-12">
        <div>
          <span className="eyebrow block mb-4">§ Regulatory Master</span>
          <h1 className="text-3xl sm:text-4xl font-display text-forest-deep mb-3 sm:mb-4">
            Regulatory Master
          </h1>
          <p className="text-ink-soft text-base sm:text-lg max-w-xl">
            Deep-dive structured learning: statutory text, practitioner lessons, and diagnostic questions — all from real regulatory content, served securely.
          </p>
        </div>
        <div className="flex gap-3 sm:gap-4 flex-wrap">
          <Link
            to="/my-learning"
            className="cursor-target px-4 sm:px-5 py-2.5 bg-paper border border-forest text-forest rounded-full font-medium hover-lift text-sm sm:text-base min-h-[44px] flex items-center"
          >
            My Learning
          </Link>
          <Link
            to="/exam-ready"
            className="cursor-target px-4 sm:px-5 py-2.5 bg-forest text-white rounded-full font-medium hover-lift text-sm sm:text-base min-h-[44px] flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            ExamReady Mock Test
          </Link>
        </div>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURSES.map(course => {
          const meta = courseMeta[course.slug];
          const { completed, total, pct } = getCourseProgress(course.slug);

          return (
            <div
              key={course.id}
              className="bg-white border border-line rounded-2xl overflow-hidden card-shadow hover-lift flex flex-col h-full"
            >
              {/* Gradient top band */}
              <div className={`h-2 w-full bg-gradient-to-r ${course.color}`} />

              <div className="p-6 flex flex-col flex-grow">
                {/* Badge row */}
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-mint text-forest font-semibold text-xs rounded-full uppercase tracking-wider">
                    {course.code}
                  </span>
                  {course.badge && (
                    <span className="px-2.5 py-0.5 bg-gold/20 text-forest text-xs font-bold rounded-full">
                      {course.badge}
                    </span>
                  )}
                </div>

                {/* Title & description */}
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-forest-deep mb-2 leading-snug">{course.title}</h3>
                  <p className="text-xs text-ink-soft mb-4 leading-relaxed">{course.description}</p>

                  {/* Counts */}
                  <div className="text-xs font-medium text-forest flex items-center gap-1 mb-4 flex-wrap">
                    {course.slug === 'ifsca-fme' ? (
                      <>
                        <BookOpen className="w-4 h-4 text-leaf" />
                        7 Modules · 16 Topics
                        <span className="text-ink-soft mx-1">•</span>
                        <HelpCircle className="w-3.5 h-3.5 text-gold" />
                        12 Interview Qs · 20 Exam Qs
                      </>
                    ) : metaLoading ? (
                      <span className="flex items-center gap-1 text-ink-soft">
                        <Loader2 className="w-3 h-3 animate-spin" /> Loading counts…
                      </span>
                    ) : meta ? (
                      <>
                        <BookOpen className="w-4 h-4 text-leaf" />
                        {meta.lessons || 0} Lessons
                        <span className="text-ink-soft mx-1">•</span>
                        <HelpCircle className="w-3.5 h-3.5 text-gold" />
                        {meta.questions || 0} Questions
                        <span className="text-ink-soft mx-1">•</span>
                        {meta.total || 0} Items total
                      </>
                    ) : (
                      <span className="text-ink-soft text-xs italic">
                        {course.slug === 'sebi-aif' ? '5 Lessons • 16 Questions' : '17 Lessons • 174 Questions'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-3 mt-auto border-t border-line pt-4">
                  <div className="flex justify-between text-xs font-medium text-ink-soft">
                    <span>Course Completion</span>
                    <span className="font-bold text-forest">{user ? `${pct}%` : '0%'}</span>
                  </div>
                  <div className="w-full bg-line h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-leaf-bright' : 'bg-leaf'}`}
                      style={{ width: user ? `${pct}%` : '0%' }}
                    />
                  </div>
                  {user && total > 0 && (
                    <p className="text-[10px] text-ink-soft">{completed} of {total} items completed</p>
                  )}

                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="cursor-target mt-2 w-full flex items-center justify-center gap-2 py-3 bg-mint text-forest font-medium rounded-xl hover:bg-mint-deep transition-colors min-h-[48px] text-sm"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {pct > 0 ? 'Continue Learning' : 'Start Learning'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="mt-8 p-4 bg-mint/40 border border-mint-deep rounded-xl text-xs text-forest-deep">
        <strong>About Regulatory Master:</strong> All lessons and questions are served from the backend — answer keys never reach the browser. Your progress is saved per-item and synced across devices when logged in.
      </div>

      {/* Modal */}
      {selectedCourse && (
        <RegulatoryMasterModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
