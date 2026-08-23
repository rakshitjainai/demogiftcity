import React, { useState, useEffect, useMemo } from 'react';
import {
  PlayCircle, BookOpen, HelpCircle, Loader2, GraduationCap, Sparkles,
  Search, Filter, CheckCircle2, Award, Clock, ArrowRight, ShieldCheck,
  Star, Lock, BookMarked, BarChart3, ChevronRight, TrendingUp, Flame, Target
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegulatoryMasterModal from '../components/RegulatoryMasterModal';
import LockOverlay from '../components/LockOverlay';
import Breadcrumb from '../components/Breadcrumb';
import BadgeChip from '../components/BadgeChip';
import { getCourseStats, MASTERY_LEVELS } from '../utils/learnProgress';
import coursesData from '../data/courses.json';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Course definitions with accurate curriculum counts derived dynamically from courses.json
const ACTIVE_COURSES = [
  coursesData['ifsca-cmi'],
  coursesData['ifsca-fme'],
  coursesData['sebi-aif']
].filter(Boolean).map(c => ({
  id: `mod-${c.slug}`,
  code: c.code,
  slug: c.slug,
  regulator: c.regulator,
  title: c.title,
  description: c.description,
  badge: c.badge,
  difficulty: c.difficulty,
  durationHours: c.durationHours,
  color: c.color,
  accentColor: c.accentColor,
  totalChapters: c.totalChapters,
  totalLessons: c.totalLessons,
  totalQuestions: c.totalQuestions,
  category: c.category
}));

const UPCOMING_COURSES = [
  {
    id: 'mod-lodr',
    code: 'SEBI-LODR',
    slug: 'sebi-lodr',
    regulator: 'SEBI',
    title: 'SEBI (Listing Obligations and Disclosure Requirements) 2015',
    description: 'Governance, board composition, committee mandates, material event reporting, and periodic disclosure framework for listed entities.',
    badge: 'Coming Soon',
    difficulty: 'Intermediate',
    durationHours: 10,
    color: 'from-sky-900 via-indigo-900 to-slate-900',
    accentColor: 'bg-sky-500',
    totalChapters: 12,
    totalLessons: 24,
    totalQuestions: 75,
    category: 'Corporate Governance',
    isUpcoming: true,
  },
  {
    id: 'mod-companies',
    code: 'MCA-CA2013',
    slug: 'mca-ca2013',
    regulator: 'MCA',
    title: 'Companies Act 2013: Essential Secretarial Compliance',
    description: 'Practical walkthrough of incorporation, director disqualifications, related-party transactions, secretarial standards (SS-1, SS-2) & MCA-21 v3 filings.',
    badge: 'Preview Available',
    difficulty: 'Beginner',
    durationHours: 18,
    color: 'from-teal-900 via-emerald-950 to-slate-900',
    accentColor: 'bg-teal-500',
    totalChapters: 15,
    totalLessons: 30,
    totalQuestions: 90,
    category: 'Company Law',
    isUpcoming: true,
  }
];

const COURSES = [...ACTIVE_COURSES, ...UPCOMING_COURSES];

const LEARNING_PATHS = [
  {
    id: 'path-gift-fme',
    title: 'GIFT City Fund Management Specialist',
    coursesCount: 2,
    estimatedHours: '27 hrs',
    level: 'Advanced',
    description: 'Complete curriculum covering IFSCA FME Regulations, PPM drafting principles, and regulatory reporting.',
    courses: ['IFSCA-FME', 'IFSCA-CMI']
  },
  {
    id: 'path-sebi-compliance',
    title: 'SEBI AIF & Capital Markets Compliance Professional',
    coursesCount: 2,
    estimatedHours: '24 hrs',
    level: 'Intermediate to Advanced',
    description: 'Essential mastery for compliance officers managing Category I/II/III AIFs and investment managers.',
    courses: ['SEBI-AIF', 'SEBI-LODR']
  }
];

export default function Learning() {
  const { user, isAuthenticated, isMember, hasCourseAccess, initiateCheckout } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchParams] = useSearchParams();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegulator, setSelectedRegulator] = useState('ALL');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'PATHS'

  // Auto-launch modal if query param (e.g. ?course=ifsca-cmi) is provided
  useEffect(() => {
    const courseParam = searchParams.get('course') || searchParams.get('track') || searchParams.get('slug');
    if (courseParam) {
      const match = COURSES.find(c => c.slug === courseParam || c.code.toLowerCase() === courseParam.toLowerCase() || c.id === courseParam);
      if (match && !match.isUpcoming) {
        setSelectedCourse(match);
      }
    }
  }, [searchParams]);

  // Meta from API (lesson/question counts)
  const [courseMeta, setCourseMeta] = useState({});
  const [metaLoading, setMetaLoading] = useState(true);

  // Fetch real counts from server for active courses
  useEffect(() => {
    const fetchAll = async () => {
      setMetaLoading(true);
      const results = await Promise.allSettled(
        COURSES.filter(c => !c.isUpcoming).map(c =>
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

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return COURSES.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.regulator.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRegulator = selectedRegulator === 'ALL' || c.regulator === selectedRegulator;

      const hasAccess = hasCourseAccess(c.slug);
      if (activeTab === 'IN_PROGRESS') {
        return matchesSearch && matchesRegulator && hasAccess && !c.isUpcoming;
      }
      if (activeTab === 'PATHS') {
        return false; // Handled separately
      }
      return matchesSearch && matchesRegulator;
    });
  }, [searchQuery, selectedRegulator, activeTab, hasCourseAccess]);


  return (
    <div className="min-h-screen bg-paper py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Learn', href: '/learn' },
            { label: 'RegLearn Course Catalogue', active: true }
          ]}
        />

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#042C1D] via-[#0B4D33] to-[#073321] text-white p-8 sm:p-12 shadow-xl border border-emerald-900/50">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-sm">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>RegLearn • Structured Regulatory Curriculum</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight tracking-tight">
              Master Indian Regulations With Modular Precision
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 font-normal leading-relaxed">
              Step-by-step master courses covering IFSCA, SEBI, and MCA frameworks. Complete with chapter diagnostics, real case scenarios, practical compliance notes, and certified assessments.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-emerald-100 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Legal Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Verifiable Certificates</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-300" />
                <span>Self-Paced Learning</span>
              </div>
            </div>
          </div>

          {/* Background watermark */}
          <div className="absolute right-6 -bottom-8 opacity-10 text-white pointer-events-none hidden lg:block">
            <GraduationCap className="w-80 h-80" />
          </div>
        </div>

        {/* Search, Tabs & Filters Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-line card-shadow space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by regulation, topic or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-paper rounded-xl border border-line text-sm text-ink focus:outline-none focus:border-forest"
              />
            </div>

            {/* Regulator Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {['ALL', 'IFSCA', 'SEBI', 'MCA', 'RBI'].map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegulator(reg)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex-shrink-0 ${
                    selectedRegulator === reg
                      ? 'bg-forest text-white shadow-sm'
                      : 'bg-paper text-ink-soft hover:bg-mint hover:text-forest border border-line'
                  }`}
                >
                  {reg === 'ALL' ? 'All Regulators' : reg}
                </button>
              ))}
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center border-t border-line pt-3 gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'ALL' ? 'bg-mint text-forest font-bold' : 'text-ink-soft hover:text-forest'
              }`}
            >
              All Courses ({COURSES.length})
            </button>
            <button
              onClick={() => setActiveTab('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'IN_PROGRESS' ? 'bg-mint text-forest font-bold' : 'text-ink-soft hover:text-forest'
              }`}
            >
              My Unlocked Courses
            </button>
            <button
              onClick={() => setActiveTab('PATHS')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'PATHS' ? 'bg-mint text-forest font-bold' : 'text-ink-soft hover:text-forest'
              }`}
            >
              Learning Paths ({LEARNING_PATHS.length})
            </button>
          </div>
        </div>

        {/* View Mode: Learning Paths */}
        {activeTab === 'PATHS' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LEARNING_PATHS.map((path) => (
              <div
                key={path.id}
                className="bg-white rounded-3xl p-7 border border-line card-shadow hover-lift flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <BadgeChip label={path.level} variant="gold" size="sm" />
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {path.estimatedHours}
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-bold text-forest mb-2">
                    {path.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed mb-6">
                    {path.description}
                  </p>

                  <div className="space-y-2 mb-6 bg-paper p-4 rounded-2xl border border-line">
                    <div className="text-xs font-bold text-forest uppercase tracking-wider mb-2">
                      Included Course Modules:
                    </div>
                    {path.courses.map((cCode, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-ink">
                        <CheckCircle2 className="w-3.5 h-3.5 text-leaf flex-shrink-0" />
                        <span>{cCode} Regulatory Master</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('ALL')}
                  className="w-full py-3 rounded-xl bg-forest hover:bg-leaf text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>View Included Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Course Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredCourses.map((course) => {
              const meta = courseMeta[course.slug];
              const chaptersCount = meta?.totalChapters || course.totalChapters;
              const lessonsCount = meta?.totalLessons || course.totalLessons;
              const questionsCount = meta?.totalQuestions || course.totalQuestions;

              const isOwned = hasCourseAccess(course.slug);
              const isLocked = !isOwned && !course.isUpcoming;

              // Gamification stats from localStorage
              const courseChapters = coursesData[course.slug]?.chapters || [];
              const stats = getCourseStats(course.slug, courseChapters);
              const hasProgress = stats.started > 0;
              const masteryLvl = stats.mastered > 0
                ? 5 : stats.completed > 0 ? 4 : stats.started > 0 ? 2 : 0;
              const ml = MASTERY_LEVELS[masteryLvl] || MASTERY_LEVELS[0];

              return (
                <div
                  key={course.id}
                  className={`bg-white rounded-3xl border border-line card-shadow hover-lift flex flex-col justify-between overflow-hidden transition-all ${
                    course.isUpcoming ? 'opacity-85' : ''
                  }`}
                >
                  {/* Top Header Gradient */}
                  <div className={`p-6 bg-gradient-to-br ${course.color} text-white relative`}>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-sm text-white font-bold text-xs">
                        {course.code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {stats.streak > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-300 text-[10px] font-bold">
                            <Flame className="w-3 h-3" />{stats.streak}d
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                          {course.badge}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-lg sm:text-xl text-white leading-snug line-clamp-2 min-h-[3.25rem]">
                      {course.title}
                    </h3>

                    {/* Progress bar on header if has progress */}
                    {hasProgress && !course.isUpcoming && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] text-white/70 mb-1">
                          <span className="font-medium">Progress</span>
                          <span className="font-bold">{stats.overallPct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-700"
                            style={{ width: `${stats.overallPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs sm:text-sm text-ink-soft leading-relaxed line-clamp-2">
                      {course.description}
                    </p>

                    {/* Stats Matrix */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-line bg-paper/60 rounded-xl px-3 text-center">
                      <div>
                        <div className="text-xs text-ink-soft">Chapters</div>
                        <div className="text-sm font-bold text-forest">{chaptersCount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-ink-soft">Mastered</div>
                        <div className="text-sm font-bold text-forest">{stats.mastered}/{chaptersCount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-ink-soft">Questions</div>
                        <div className="text-sm font-bold text-forest">{questionsCount} Qs</div>
                      </div>
                    </div>

                    {/* Mastery Badge */}
                    {hasProgress && !course.isUpcoming && (
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: ml.bg, color: ml.text }}
                        >
                          {masteryLvl === 5 && <Star className="w-2.5 h-2.5" />}
                          {ml.short}
                        </span>
                        {stats.weakAreas > 0 && (
                          <span className="text-[10px] text-rose-600 font-medium flex items-center gap-0.5">
                            <Target className="w-3 h-3" />{stats.weakAreas} weak area{stats.weakAreas !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-1">
                      {course.isUpcoming ? (
                        <div className="w-full py-3 rounded-xl bg-gray-100 text-gray-500 font-semibold text-xs text-center border border-gray-200">
                          Curriculum in Editorial Review
                        </div>
                      ) : isOwned ? (
                        <div className="space-y-2">
                          <Link
                            to={`/learn/${course.slug}`}
                            className="w-full py-3 rounded-xl bg-forest hover:bg-leaf text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <TrendingUp className="w-4 h-4" />
                            <span>{hasProgress ? 'Continue Learning' : 'Start Learning'}</span>
                          </Link>
                          <button
                            onClick={() => setSelectedCourse(course)}
                            className="w-full py-2 rounded-xl bg-mint text-forest hover:bg-mint-deep font-semibold text-xs transition-colors border border-mint-deep flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Classic Study Mode</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Link
                            to={`/learn/${course.slug}`}
                            className="w-full py-2.5 rounded-xl bg-mint text-forest hover:bg-mint-deep font-bold text-xs transition-colors border border-mint-deep flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-leaf" />
                            <span>Preview Free Chapter</span>
                          </Link>
                          <Link
                            to="/membership"
                            className="w-full py-2.5 rounded-xl bg-forest hover:bg-leaf text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Unlock Full Course (₹499)</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredCourses.length === 0 && activeTab !== 'PATHS' && (
          <div className="text-center py-16 bg-white rounded-3xl border border-line p-8 max-w-md mx-auto">
            <GraduationCap className="w-12 h-12 text-forest mx-auto mb-3 opacity-60" />
            <h3 className="font-display font-bold text-lg text-forest mb-1">No Courses Match Your Filter</h3>
            <p className="text-xs text-ink-soft mb-4">Try clearing your search query or choosing another regulator.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedRegulator('ALL'); setActiveTab('ALL'); }}
              className="px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-leaf cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* Interactive Course Study Modal */}
      {selectedCourse && (
        <RegulatoryMasterModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
