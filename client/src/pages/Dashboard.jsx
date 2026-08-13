import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  GraduationCap, 
  Award, 
  ArrowRight, 
  Clock, 
  Bookmark, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  PlayCircle,
  HelpCircle,
  TrendingUp,
  FileText,
  Search,
  FileCheck,
  Scale,
  Building,
  Shield,
  Zap,
  Printer,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  Flame,
  MessageSquare,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ACTS_DATA, getActName } from '../data/regulationsData';
import { LATEST_UPDATES, LATEST_BLOGS } from '../data/mockData';
import coursesData from '../data/courses.json';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Get last read from user object or local fallback
  const lastRead = user?.readingProgress || JSON.parse(localStorage.getItem('regmate_last_read') || 'null');
  
  // Get bookmarked provisions
  const bookmarks = JSON.parse(localStorage.getItem('regmate_bookmarks') || '[]');

  // Get user course progress logic
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

    const pct = Math.min(100, Math.round((completed / (course.totalItems || 1)) * 100));
    return { pct, completed, total: course.totalItems || 1 };
  };

  // Calculate live stats across user account
  const quizProgress = user?.quizProgress || [];
  const learningProgress = user?.learningProgress || [];
  const courseProgressList = user?.courseProgress || [];

  // Lessons completed live sum
  const totalLessonsCompleted = learningProgress.reduce((sum, m) => sum + (m.completedLessons?.length || 0), 0)
    + courseProgressList.reduce((sum, c) => sum + (c.completedItems?.length || 0), 0);

  // Quizzes taken live sum
  const quizzesTakenCount = quizProgress.length;

  // Average quiz score %
  const averageScorePct = quizzesTakenCount > 0 
    ? Math.round(quizProgress.reduce((sum, q) => sum + (q.percentage || 0), 0) / quizzesTakenCount)
    : 0;

  // Total correct answers
  const totalCorrectAnswers = quizProgress.reduce((sum, q) => sum + (q.score || 0), 0);

  // Best quiz score
  const bestScoreVal = quizzesTakenCount > 0
    ? Math.max(...quizProgress.map(q => q.score || 0))
    : 0;

  // Certificates count (earned on completing course or 100% progress)
  const earnedCertificates = courseProgressList.filter(c => {
    const course = coursesData[c.courseSlug];
    return course && (c.completedItems?.length || 0) >= course.totalItems;
  }).length;

  // Overall completion percentage
  const cmiProg = getCourseProgress('ifsca-cmi');
  const aifProg = getCourseProgress('sebi-aif');
  const overallProgressPct = Math.round((cmiProg.pct + aifProg.pct) / 2);

  const userName = user?.name || 'Practitioner';

  const regulatorCounts = [
    { name: 'IFSCA', count: '5 Acts', icon: ShieldCheck, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { name: 'SEBI', count: '1 Act', icon: Scale, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { name: 'MCA', count: '1 Act', icon: Building, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { name: 'RBI', count: '1 Act', icon: Shield, color: 'text-teal-700 bg-teal-50 border-teal-200' },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-24">
      
      {/* ─── WELCOME HEADER ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[var(--ink)]">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1">
            Continue your journey of regulatory intelligence and mastery.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-2 md:mt-0">
          <span className="px-3 py-1 bg-[var(--mint)] border border-[var(--mint-deep)] text-[var(--forest)] text-xs font-bold rounded-full uppercase tracking-wider">
            {user?.role === 'admin' ? 'Administrator' : 'Active License Member'}
          </span>
          <button 
            onClick={() => navigate('/interactive-regulations')}
            className="px-4 py-2 bg-[var(--forest)] text-white text-xs font-bold rounded-xl hover:bg-[var(--forest-deep)] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <BookOpen className="w-4 h-4" /> Browse Regulations
          </button>
        </div>
      </div>

      {/* ─── TOP SECTION: PRIMARY ACTIONS + LEARNING SNAPSHOT ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Two Primary Action Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Action Card 1: Interactive Regulations */}
          <div className="bg-white border border-[var(--line)] rounded-2xl p-5 card-shadow flex flex-col justify-between space-y-4 hover:border-[var(--forest)] transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--mint)] text-[var(--forest)] flex items-center justify-center shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold font-serif text-[var(--ink)]">
                Interactive Regulations
              </h2>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                Explore regulations with expert analysis, practical points, and statutory guidance.
              </p>
            </div>
            <button
              onClick={() => navigate('/interactive-regulations')}
              className="w-full py-2.5 px-4 bg-white border border-[var(--forest)] text-[var(--forest)] font-bold text-xs rounded-xl hover:bg-[var(--mint)] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action Card 2: Regulatory Mastery */}
          <div className="bg-emerald-950 text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-emerald-600/20 to-transparent pointer-events-none" />
            <div className="space-y-3 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center backdrop-blur-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold font-serif text-white">
                Regulatory Mastery
              </h2>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Learn chapter-wise, test your knowledge with diagnostic quizzes, and earn certificates.
              </p>
            </div>
            <button
              onClick={() => navigate('/learning')}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer relative z-10"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right Column (5 cols): Your Learning Snapshot */}
        <div className="lg:col-span-5 bg-white border border-[var(--line)] rounded-2xl p-5 card-shadow flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--forest)]" />
              <h3 className="font-bold font-serif text-sm text-[var(--ink)]">
                Your Learning Snapshot
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-[var(--ink-soft)] bg-[var(--paper)] px-2.5 py-0.5 rounded-full border border-[var(--line)]">
              This Month
            </span>
          </div>

          {/* 4 Stat Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            
            <div className="bg-[var(--paper)] p-2.5 rounded-xl border border-[var(--line)]">
              <span className="block text-lg font-extrabold text-[var(--ink)] leading-none">
                {totalLessonsCompleted}
              </span>
              <span className="text-[10px] text-[var(--ink-soft)] block mt-1 leading-tight">
                Lessons Completed
              </span>
            </div>

            <div className="bg-[var(--paper)] p-2.5 rounded-xl border border-[var(--line)]">
              <span className="block text-lg font-extrabold text-[var(--ink)] leading-none">
                {quizzesTakenCount}
              </span>
              <span className="text-[10px] text-[var(--ink-soft)] block mt-1 leading-tight">
                Quizzes Taken
              </span>
            </div>

            <div className="bg-[var(--paper)] p-2.5 rounded-xl border border-[var(--line)]">
              <span className="block text-lg font-extrabold text-[var(--ink)] leading-none">
                {averageScorePct}%
              </span>
              <span className="text-[10px] text-[var(--ink-soft)] block mt-1 leading-tight">
                Average Score
              </span>
            </div>

            <div className="bg-[var(--paper)] p-2.5 rounded-xl border border-[var(--line)]">
              <span className="block text-lg font-extrabold text-[var(--ink)] leading-none">
                {earnedCertificates}
              </span>
              <span className="text-[10px] text-[var(--ink-soft)] block mt-1 leading-tight">
                Certificates Earned
              </span>
            </div>

          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--ink)]">Overall Progress</span>
              <span className="font-bold text-[var(--forest)]">{overallProgressPct}%</span>
            </div>
            <div className="w-full bg-[var(--line)] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[var(--forest)] h-full rounded-full transition-all duration-500" 
                style={{ width: `${overallProgressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[var(--ink-soft)] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> You are doing great! Keep it up!
              </span>
              <button 
                onClick={() => navigate('/my-learning')}
                className="font-bold text-[var(--forest)] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View Full Progress →
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ─── SECOND ROW: CONTINUE LEARNING, QUIZZES & CERTIFICATES ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Continue Learning Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[var(--line)] rounded-2xl p-5 card-shadow space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--forest)]" />
                <h3 className="font-bold font-serif text-sm text-[var(--ink)]">
                  Continue Learning
                </h3>
              </div>
              <button 
                onClick={() => navigate('/learning')}
                className="text-xs font-bold text-[var(--forest)] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Active Reading/Course Card */}
            {lastRead && lastRead.actSlug ? (
              <div className="bg-[var(--paper)] border border-[var(--line)] rounded-xl p-4 space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--mint)] text-[var(--forest)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[var(--ink)] leading-tight">
                      {getActName(lastRead.actSlug)}
                    </h4>
                    <p className="text-[11px] text-[var(--ink-soft)] mt-1 leading-snug">
                      Chapter {lastRead.chapter?.replace('chapter-', '') || '1'} — Regulation {lastRead.sectionNum} {lastRead.sectionTitle ? `(${lastRead.sectionTitle})` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/interactive-regulations/${lastRead.actSlug}/${lastRead.chapter || 'chapter-1'}/section-${lastRead.sectionNum || '1'}`)}
                    className="px-4 py-1.5 bg-[var(--forest)] text-white text-xs font-bold rounded-lg hover:bg-[var(--forest-deep)] transition-colors cursor-pointer"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => navigate(`/interactive-regulations/${lastRead.actSlug}/${lastRead.chapter || 'chapter-1'}/section-${lastRead.sectionNum || '1'}`)}
                    className="px-3 py-1.5 bg-white border border-[var(--line)] text-[var(--ink-soft)] text-xs font-semibold rounded-lg hover:bg-[var(--mint)] transition-colors cursor-pointer"
                  >
                    Go to last read
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[var(--paper)] border border-[var(--line)] rounded-xl p-4 text-center space-y-2 mb-4">
                <p className="text-xs font-semibold text-[var(--ink)]">No active reading session yet.</p>
                <p className="text-[11px] text-[var(--ink-soft)]">Start reading any regulation to resume your progress here!</p>
              </div>
            )}

            {/* Recent Modules List */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-soft)] block">
                Recent Modules
              </span>
              
              {/* Module 1: IFSCA-CMI */}
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--paper)] border border-[var(--line)]">
                <span className="font-semibold text-[var(--ink)] truncate max-w-[200px]">
                  IFSCA Capital Market Intermediaries
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-[var(--line)] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[var(--forest)] h-full rounded-full" style={{ width: `${cmiProg.pct}%` }} />
                  </div>
                  <span className="font-bold text-[11px] text-[var(--forest)] w-8 text-right">{cmiProg.pct}%</span>
                </div>
              </div>

              {/* Module 2: SEBI-AIF */}
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--paper)] border border-[var(--line)]">
                <span className="font-semibold text-[var(--ink)] truncate max-w-[200px]">
                  SEBI Alternative Investment Funds
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-[var(--line)] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[var(--forest)] h-full rounded-full" style={{ width: `${aifProg.pct}%` }} />
                  </div>
                  <span className="font-bold text-[11px] text-[var(--forest)] w-8 text-right">{aifProg.pct}%</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/my-learning')}
            className="text-xs font-bold text-[var(--forest)] hover:underline flex items-center gap-1 cursor-pointer pt-2"
          >
            <span>Go to My Learning</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quizzes Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[var(--line)] rounded-2xl p-5 card-shadow space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--forest)]" />
                <h3 className="font-bold font-serif text-sm text-[var(--ink)]">
                  Quizzes
                </h3>
              </div>
              <button 
                onClick={() => navigate('/quizzes')}
                className="text-xs font-bold text-[var(--forest)] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Circular Ring Dial & Stats */}
            <div className="flex items-center gap-4 my-3">
              {/* Ring Progress Dial */}
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[var(--line)]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[var(--forest)]"
                    strokeDasharray={`${averageScorePct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center leading-none">
                  <span className="block text-xs font-bold text-[var(--ink)]">{averageScorePct}%</span>
                  <span className="text-[7px] text-[var(--ink-soft)] block uppercase">Average</span>
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div className="space-y-1.5 flex-1 text-xs">
                <div className="flex items-center justify-between text-[var(--ink-soft)]">
                  <span>Quizzes Taken</span>
                  <span className="font-bold text-[var(--ink)]">{quizzesTakenCount}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--ink-soft)]">
                  <span>Correct Answers</span>
                  <span className="font-bold text-[var(--ink)]">{totalCorrectAnswers}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--ink-soft)]">
                  <span>Best Score</span>
                  <span className="font-bold text-[var(--ink)]">{bestScoreVal > 0 ? `${bestScoreVal}` : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/quizzes')}
            className="w-full py-2 bg-[var(--mint)] border border-[var(--mint-deep)] text-[var(--forest)] text-xs font-bold rounded-xl hover:bg-[var(--mint-deep)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Start a Quiz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Certificates Panel (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-[var(--line)] rounded-2xl p-5 card-shadow space-y-4 flex flex-col justify-between text-center">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-3 text-left">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--forest)]" />
                <h3 className="font-bold font-serif text-sm text-[var(--ink)]">
                  Certificates
                </h3>
              </div>
              <button 
                onClick={() => navigate('/my-certificates')}
                className="text-xs font-bold text-[var(--forest)] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Badge Graphic */}
            <div className="w-14 h-14 rounded-2xl bg-[var(--mint)] text-[var(--forest)] border border-[var(--mint-deep)] flex items-center justify-center mx-auto my-3 shadow-xs">
              <Award className="w-7 h-7" />
            </div>

            <h4 className="text-base font-extrabold text-[var(--ink)]">
              {earnedCertificates} Certificates Earned
            </h4>
            <p className="text-xs text-[var(--ink-soft)] mt-1">
              {earnedCertificates > 0 
                ? 'Great achievement! Complete remaining modules to earn more.'
                : 'Complete any course to earn your first verifiable certificate.'}
            </p>
          </div>

          <button 
            onClick={() => navigate('/my-certificates')}
            className="w-full py-2 bg-white border border-[var(--line)] text-[var(--ink)] text-xs font-bold rounded-xl hover:bg-[var(--mint)] transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>View Certificates</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ─── THIRD ROW: RESOURCE DISCOVERY CARDS ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Guidance Notes by Regulator */}
        <div className="bg-white border border-[var(--line)] rounded-2xl p-5 card-shadow space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5 mb-2.5">
              <h3 className="font-bold font-serif text-sm text-[var(--ink)]">
                Guidance Notes by Regulator
              </h3>
              <button 
                onClick={() => navigate('/knowledge-hub')}
                className="text-xs font-bold text-[var(--forest)] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {regulatorCounts.map((reg, idx) => {
                const Icon = reg.icon;
                return (
                  <div 
                    key={idx} 
                    onClick={() => navigate('/interactive-regulations')}
                    className="flex items-center justify-between p-2 rounded-xl bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--mint)] transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-[var(--forest)]" />
                      <span className="font-bold text-[var(--ink)]">{reg.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[var(--ink-soft)] font-medium">{reg.count}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                        New
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => navigate('/knowledge-hub')}
            className="text-xs font-bold text-[var(--forest)] hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Latest Circulars / Updates */}
        <div className="bg-white border border-[var(--line)] rounded-2xl p-5 card-shadow space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5 mb-2.5">
              <h3 className="font-bold font-serif text-sm text-[var(--ink)]">
                Latest Circulars / Updates
              </h3>
              <button 
                onClick={() => navigate('/news')}
                className="text-xs font-bold text-[var(--forest)] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {LATEST_UPDATES.slice(0, 3).map((up) => (
                <div 
                  key={up.id}
                  onClick={() => navigate('/news')}
                  className="p-2 rounded-xl bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--mint)] transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      {up.category}
                    </span>
                    <span className="text-[9px] text-[var(--ink-soft)]">{up.date}</span>
                  </div>
                  <h4 className="font-bold text-[11px] text-[var(--ink)] leading-snug line-clamp-1">
                    {up.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => navigate('/news')}
            className="text-xs font-bold text-[var(--forest)] hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>All Circulars</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Latest Blogs */}
        <div className="bg-white border border-[var(--line)] rounded-2xl p-5 card-shadow space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5 mb-2.5">
              <h3 className="font-bold font-serif text-sm text-[var(--ink)]">
                Latest Blogs
              </h3>
              <button 
                onClick={() => navigate('/blog')}
                className="text-xs font-bold text-[var(--forest)] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {LATEST_BLOGS.slice(0, 3).map((blog) => (
                <div 
                  key={blog.id}
                  onClick={() => navigate('/blog')}
                  className="p-2 rounded-xl bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--mint)] transition-colors cursor-pointer space-y-1"
                >
                  <span className="text-[9px] font-bold text-[var(--ink-soft)] block">
                    {blog.category} • {blog.date}
                  </span>
                  <h4 className="font-bold text-[11px] text-[var(--ink)] leading-snug line-clamp-2">
                    {blog.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => navigate('/blog')}
            className="text-xs font-bold text-[var(--forest)] hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>All Blogs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Recommended for You */}
        <div className="bg-white border border-[var(--line)] rounded-2xl p-5 card-shadow space-y-3 flex flex-col justify-between">
          <div>
            <div className="border-b border-[var(--line)] pb-2.5 mb-2.5">
              <h3 className="font-bold font-serif text-sm text-[var(--ink)]">
                Recommended for You
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              {/* Rec 1 */}
              <div 
                onClick={() => navigate('/quizzes')}
                className="p-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100/70 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="block font-bold text-[11px] text-amber-900">Take a Quiz</span>
                  <span className="text-[10px] text-amber-800/80 block">Test knowledge on IFSCA rules</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-900 flex-shrink-0" />
              </div>

              {/* Rec 2 */}
              <div 
                onClick={() => navigate('/learning')}
                className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="block font-bold text-[11px] text-emerald-900">Complete Module</span>
                  <span className="text-[10px] text-emerald-800/80 block">IFSCA Intermediaries</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-900 flex-shrink-0" />
              </div>

              {/* Rec 3 */}
              <div 
                onClick={() => navigate('/interactive-regulations/ifsca-mga-2026/chapter-1')}
                className="p-2 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100/70 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="block font-bold text-[11px] text-blue-900">New Regulation</span>
                  <span className="text-[10px] text-blue-800/80 block">IFSCA MGA Regulations 2026</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-blue-900 flex-shrink-0" />
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/learning')}
            className="text-xs font-bold text-[var(--forest)] hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>See All Recommendations</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ─── FOURTH ROW: RECENTLY VIEWED & QUICK TOOLS ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recently Viewed (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[var(--line)] rounded-2xl p-5 card-shadow space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--forest)]" />
              <h3 className="font-bold font-serif text-sm text-[var(--ink)]">
                Recently Viewed
              </h3>
            </div>
            <button 
              onClick={() => navigate('/interactive-regulations')}
              className="text-xs font-bold text-[var(--forest)] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          {lastRead && lastRead.actSlug ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div 
                onClick={() => navigate(`/interactive-regulations/${lastRead.actSlug}/${lastRead.chapter || 'chapter-1'}/section-${lastRead.sectionNum || '1'}`)}
                className="p-3 bg-[var(--paper)] border border-[var(--line)] rounded-xl hover:bg-[var(--mint)] transition-colors cursor-pointer space-y-1"
              >
                <span className="text-[10px] font-bold text-[var(--forest)] block">
                  {getActName(lastRead.actSlug)}
                </span>
                <p className="text-xs font-bold text-[var(--ink)] line-clamp-1">
                  Section {lastRead.sectionNum} {lastRead.sectionTitle ? `— ${lastRead.sectionTitle}` : ''}
                </p>
                <span className="text-[9px] text-[var(--ink-soft)] block">Just now</span>
              </div>

              {bookmarks.length > 0 && (
                <div 
                  onClick={() => navigate(bookmarks[0].url)}
                  className="p-3 bg-[var(--paper)] border border-[var(--line)] rounded-xl hover:bg-[var(--mint)] transition-colors cursor-pointer space-y-1"
                >
                  <span className="text-[10px] font-bold text-[var(--gold)] block">
                    Bookmarked Section
                  </span>
                  <p className="text-xs font-bold text-[var(--ink)] line-clamp-1">
                    {bookmarks[0].title}
                  </p>
                  <span className="text-[9px] text-[var(--ink-soft)] block">Saved Bookmark</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-center text-xs text-[var(--ink-soft)]">
              No recently viewed items recorded yet. Browse regulations to keep track of your history.
            </div>
          )}
        </div>

        {/* Quick Tools (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[var(--line)] rounded-2xl p-5 card-shadow space-y-3">
          <div className="border-b border-[var(--line)] pb-2.5 mb-2.5">
            <h3 className="font-bold font-serif text-sm text-[var(--ink)]">
              Quick Tools
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2">
            
            {/* Tool 1: Search Regulations */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-search-modal'))}
              className="p-2.5 bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--mint)] hover:border-[var(--leaf)] rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-[var(--forest)]" />
              <span className="text-[10px] font-bold text-[var(--ink)] leading-tight">Search Regs</span>
            </button>

            {/* Tool 2: Bookmarks */}
            <button
              onClick={() => setShowBookmarksModal(true)}
              className="p-2.5 bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--mint)] hover:border-[var(--leaf)] rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 relative"
            >
              <Bookmark className="w-4 h-4 text-[var(--forest)]" />
              <span className="text-[10px] font-bold text-[var(--ink)] leading-tight">Bookmarks</span>
              {bookmarks.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </button>

            {/* Tool 3: Notes & Compliance Tools */}
            <button
              onClick={() => navigate('/tools')}
              className="p-2.5 bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--mint)] hover:border-[var(--leaf)] rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4 text-[var(--forest)]" />
              <span className="text-[10px] font-bold text-[var(--ink)] leading-tight">Notes & Tools</span>
            </button>

            {/* Tool 4: Compare (Coming Soon) */}
            <button
              onClick={() => setShowCompareModal(true)}
              className="p-2.5 bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--mint)] hover:border-[var(--leaf)] rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 relative"
            >
              <Layers className="w-4 h-4 text-[var(--forest)]" />
              <span className="text-[10px] font-bold text-[var(--ink)] leading-tight">Compare</span>
              <span className="text-[8px] font-bold px-1 bg-amber-100 text-amber-800 rounded">Soon</span>
            </button>

            {/* Tool 5: Download PDF */}
            <button
              onClick={() => window.print()}
              className="p-2.5 bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--mint)] hover:border-[var(--leaf)] rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-[var(--forest)]" />
              <span className="text-[10px] font-bold text-[var(--ink)] leading-tight">Print PDF</span>
            </button>

            {/* Tool 6: Print / Share */}
            <button
              onClick={() => window.print()}
              className="p-2.5 bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--mint)] hover:border-[var(--leaf)] rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-[var(--forest)]" />
              <span className="text-[10px] font-bold text-[var(--ink)] leading-tight">Print / Share</span>
            </button>

          </div>
        </div>

      </div>

      {/* Bookmarks Modal */}
      {showBookmarksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-bold font-serif text-lg text-slate-900">Saved Bookmarks ({bookmarks.length})</h3>
              </div>
              <button
                onClick={() => setShowBookmarksModal(false)}
                className="p-2.5 rounded-full hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close bookmarks"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {bookmarks.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {bookmarks.map((bm, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setShowBookmarksModal(false); navigate(bm.url); }}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 truncate max-w-xs">{bm.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{bm.actSlug || 'Interactive Regulation'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-700 flex-shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                <Bookmark className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
                <p className="text-sm font-semibold text-slate-800">No saved bookmarks yet.</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Click the bookmark icon on any regulation section page to save key statutory clauses here for quick reference!
                </p>
                <button
                  onClick={() => { setShowBookmarksModal(false); navigate('/interactive-regulations'); }}
                  className="mt-2 px-4 py-2 bg-emerald-800 text-white font-bold text-xs rounded-xl hover:bg-emerald-900 transition-colors"
                >
                  Browse Regulations
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compare Modal (Coming Soon) */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="font-bold font-serif text-xl text-slate-900">Section Comparison Tool</h3>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full uppercase">
              Under Development
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Section Comparison Engine is being built to allow side-by-side statutory clause comparisons between IFSCA, SEBI, and Companies Act provisions. Check back in an upcoming release!
            </p>
            <button
              onClick={() => setShowCompareModal(false)}
              className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors min-h-[48px]"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ─── FOOTER QUOTE BAR ─────────────────────────────────────────────── */}
      <div className="bg-[var(--mint)] border border-[var(--mint-deep)] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p className="font-serif italic text-[var(--forest-deep)] text-center sm:text-left">
          "RegMate is your partner in regulatory intelligence and professional growth."
        </p>
        <a 
          href="mailto:support@regmate.in" 
          className="font-bold text-[var(--forest)] hover:underline flex items-center gap-1 flex-shrink-0"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Have feedback? Let us know →
        </a>
      </div>

    </div>
  );
}
