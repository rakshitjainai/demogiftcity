import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import InteractiveRegulations from './pages/InteractiveRegulations';
import ChapterDetail from './pages/ChapterDetail';
import SectionDetail from './pages/SectionDetail';
import Learning from './pages/Learning';
import Quizzes from './pages/Quizzes';
import DiagnosticTests from './pages/DiagnosticTests';
import ToolsIndex from './pages/ToolsIndex';
import ToolDetail from './pages/ToolDetail';
import Templates from './pages/Templates';
import BlogIndex from './pages/BlogIndex';
import News from './pages/News';
import Article from './pages/Article';
import About from './pages/About';
import Membership from './pages/Membership';
import AuthGated from './pages/AuthGated';
import Dashboard from './pages/Dashboard';
import FMEInterviewPro from './pages/FMEInterviewPro';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

import RegReadyAssessment from './pages/RegReadyAssessment';

// Heavy Page Routes — Lazy Loaded for Code Splitting & Performance Optimization
const CourseHub = React.lazy(() => import('./pages/CourseHub'));
const ChapterLearning = React.lazy(() => import('./pages/ChapterLearning'));
const ChallengeEngine = React.lazy(() => import('./pages/ChallengeEngine'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const BlogEditorPage = React.lazy(() => import('./pages/BlogEditorPage'));
const BlogDetail = React.lazy(() => import('./pages/BlogDetail'));
const QuizTopic = React.lazy(() => import('./pages/QuizTopic'));
const ExamReady = React.lazy(() => import('./pages/ExamReady'));

// Loading Fallback Component
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8 bg-paper">
      <div className="flex flex-col items-center gap-3 text-forest">
        <div className="w-8 h-8 rounded-full border-3 border-forest border-t-transparent animate-spin" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-soft">Loading module...</span>
      </div>
    </div>
  );
}

/**
 * Keyed Route Wrappers — Staff-Engineer architectural pattern.
 * Forces React to unmount/remount page components when URL parameters change,
 * guaranteeing zero cross-chapter, cross-topic, or cross-tool state leakage.
 */
function CourseHubRoute() {
  const { courseSlug } = useParams();
  return (
    <ErrorBoundary title="Course Error" key={courseSlug}>
      <Suspense fallback={<PageLoader />}>
        <CourseHub key={courseSlug} />
      </Suspense>
    </ErrorBoundary>
  );
}

function ChapterLearningRoute() {
  const { courseSlug, chapterId } = useParams();
  return (
    <ErrorBoundary title="Chapter Error" key={`${courseSlug}/${chapterId}`}>
      <Suspense fallback={<PageLoader />}>
        <ChapterLearning key={`${courseSlug}/${chapterId}`} />
      </Suspense>
    </ErrorBoundary>
  );
}

function ChallengeEngineRoute() {
  const { courseSlug, challengeType } = useParams();
  return (
    <ErrorBoundary title="Challenge Error" key={`${courseSlug}/${challengeType}`}>
      <Suspense fallback={<PageLoader />}>
        <ChallengeEngine key={`${courseSlug}/${challengeType}`} />
      </Suspense>
    </ErrorBoundary>
  );
}

function QuizTopicRoute() {
  const { topic } = useParams();
  return (
    <ErrorBoundary title="Quiz Error" key={topic || 'all'}>
      <Suspense fallback={<PageLoader />}>
        <QuizTopic key={topic || 'all'} />
      </Suspense>
    </ErrorBoundary>
  );
}

function ExamReadyRoute() {
  const { slug } = useParams();
  return (
    <ErrorBoundary title="Exam Error" key={slug || 'all'}>
      <Suspense fallback={<PageLoader />}>
        <ExamReady key={slug || 'all'} />
      </Suspense>
    </ErrorBoundary>
  );
}

function ToolDetailRoute() {
  const { slug } = useParams();
  return (
    <ErrorBoundary title="Tool Error" key={slug || 'all'}>
      <ToolDetail key={slug || 'all'} />
    </ErrorBoundary>
  );
}

function BlogDetailRoute() {
  const { slug } = useParams();
  return (
    <ErrorBoundary title="Blog Error" key={slug || 'all'}>
      <Suspense fallback={<PageLoader />}>
        <BlogDetail key={slug || 'all'} />
      </Suspense>
    </ErrorBoundary>
  );
}

function ChapterDetailRoute() {
  const { actSlug, chapter } = useParams();
  return (
    <ErrorBoundary title="Chapter Error" key={`${actSlug}/${chapter}`}>
      <ChapterDetail key={`${actSlug}/${chapter}`} />
    </ErrorBoundary>
  );
}

function SectionDetailRoute() {
  const { actSlug, chapter, sectionNum } = useParams();
  return (
    <ErrorBoundary title="Section Error" key={`${actSlug}/${chapter}/${sectionNum}`}>
      <SectionDetail key={`${actSlug}/${chapter}/${sectionNum}`} />
    </ErrorBoundary>
  );
}

function RegReadyAssessmentRoute() {
  return (
    <ErrorBoundary title="Compliance Diagnostic Error">
      <RegReadyAssessment />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'var(--paper)',
        color: 'var(--ink)',
        fontFamily: 'Public Sans, system-ui, sans-serif',
      }}
    >
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route
            path="admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/blogs/create"
            element={
              <ProtectedRoute requireAdmin={true}>
                <BlogEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/blogs/edit/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <BlogEditorPage />
              </ProtectedRoute>
            }
          />

          {/* ─── 1. RegLearn (/learn) ─────────────────────────────────── */}
          <Route path="learn" element={<ErrorBoundary title="Learning Hub Error"><Learning /></ErrorBoundary>} />
          <Route path="learn/course/:courseId" element={<ErrorBoundary title="Learning Hub Error"><Learning /></ErrorBoundary>} />
          <Route path="learn/paths/:pathId" element={<ErrorBoundary title="Learning Hub Error"><Learning /></ErrorBoundary>} />
          {/* Gamified Learning Routes */}
          <Route path="learn/:courseSlug" element={<CourseHubRoute />} />
          <Route path="learn/:courseSlug/chapter/:chapterId" element={<ChapterLearningRoute />} />
          <Route path="learn/:courseSlug/challenge/:challengeType" element={<ChallengeEngineRoute />} />

          {/* ─── 2. RegLens (/understand & /interactive-regulations) ───── */}
          <Route path="understand" element={<InteractiveRegulations />} />
          <Route path="understand/:actSlug" element={<InteractiveRegulations />} />
          <Route path="understand/:actSlug/:chapter" element={<ChapterDetailRoute />} />
          <Route path="understand/:actSlug/:chapter/:sectionNum" element={<SectionDetailRoute />} />
          <Route path="interactive-regulations" element={<InteractiveRegulations />} />
          <Route path="interactive-regulations/:actSlug" element={<InteractiveRegulations />} />
          <Route path="interactive-regulations/:actSlug/:chapter" element={<ChapterDetailRoute />} />
          <Route path="interactive-regulations/:actSlug/:chapter/:sectionNum" element={<SectionDetailRoute />} />
          <Route path="interactive-regulations/:actSlug/:chapter/section/:sectionNum" element={<SectionDetailRoute />} />

          {/* ─── 3. RegPractice (/practice) ───────────────────────────── */}
          <Route path="practice" element={<PracticeHub />} />
          <Route path="practice/quizzes" element={<Quizzes />} />
          <Route path="practice/quizzes/:topic" element={<QuizTopicRoute />} />
          <Route path="practice/mock-tests" element={<ExamReadyRoute />} />
          <Route path="practice/mock-tests/:slug" element={<ExamReadyRoute />} />
          <Route path="practice/question-bank" element={<Quizzes />} />

          {/* ─── 4. RegTools (/tools) ─────────────────────────────────── */}
          <Route path="tools" element={<ToolsIndex />} />
          <Route path="tools/compliance-diagnostic" element={<RegReadyAssessmentRoute />} />
          <Route path="tools/regready-assessment" element={<RegReadyAssessmentRoute />} />
          <Route path="tools/ifsca-cmi-compliance-readiness-assessment" element={<RegReadyAssessmentRoute />} />
          <Route path="tools/:slug" element={<ToolDetailRoute />} />

          {/* ─── 5. RegReady (/prepare) ───────────────────────────────── */}
          <Route path="prepare" element={<PrepareHub />} />
          <Route path="prepare/fme" element={<FMEInterviewPro />} />
          <Route path="prepare/:trackSlug" element={<PrepareHub />} />

          {/* ─── 6. RegIntel (/regintel) ──────────────────────────────── */}
          <Route path="regintel" element={<RegIntelHub />} />
          <Route path="regintel/whats-changed" element={<InteractiveRegulations />} />
          <Route path="regintel/tracker" element={<RegIntelHub />} />
          <Route path="regintel/enforcement" element={<News />} />
          <Route path="regintel/alerts" element={<RegIntelHub />} />
          <Route path="regintel/calendar" element={<Navigate to="/tools/compliance-calendar" replace />} />
          <Route path="regintel/analysis" element={<BlogIndex />} />

          {/* ─── 7. Free Resources (/free-resources) ─────────────────── */}
          <Route path="free-resources" element={<FreeResourcesHub />} />
          <Route path="free-resources/blogs" element={<BlogIndex />} />
          <Route path="free-resources/blogs/:slug" element={<BlogDetail />} />
          <Route path="free-resources/articles" element={<Navigate to="/free-resources/blogs" replace />} />
          <Route path="free-resources/explainers" element={<BlogIndex categoryFilter="explainers" />} />
          <Route path="free-resources/guides" element={<BlogIndex categoryFilter="guides" />} />
          <Route path="free-resources/faqs" element={<BlogIndex categoryFilter="faqs" />} />
          <Route path="free-resources/checklists" element={<Navigate to="/tools" replace />} />
          <Route path="free-resources/templates" element={<Templates />} />
          <Route path="free-resources/downloads" element={<Templates />} />
          <Route path="free-resources/polls" element={<FreeResourcesHub />} />
          <Route path="free-resources/glossary" element={<Navigate to="/understand" replace />} />

          {/* ─── Global Marketing & Membership ────────────────────────── */}
          <Route path="about" element={<About />} />
          <Route path="membership" element={<Membership />} />

          {/* ─── Backward Compatibility Redirects (Zero-Regression) ────── */}
          <Route path="knowledge-hub" element={<Navigate to="/learn" replace />} />
          <Route path="learning" element={<Navigate to="/learn" replace />} />
          <Route path="quizzes" element={<Navigate to="/practice/quizzes" replace />} />
          <Route path="quizzes/:topic" element={<Navigate to="/practice/quizzes" replace />} />
          <Route path="diagnostic-tests" element={<Navigate to="/practice" replace />} />
          <Route path="exam-ready" element={<Navigate to="/practice/mock-tests" replace />} />
          <Route path="fme-interviewpro" element={<Navigate to="/prepare/fme" replace />} />
          <Route path="jobs" element={<Navigate to="/prepare/fme" replace />} />
          <Route path="compliance-tools" element={<Navigate to="/tools" replace />} />
          <Route path="templates" element={<Navigate to="/free-resources/templates" replace />} />
          <Route path="blog" element={<Navigate to="/free-resources/blogs" replace />} />
          <Route path="blog/:slug" element={<BlogSlugRedirect />} />
          <Route path="news" element={<Navigate to="/regintel" replace />} />
          <Route path="news/:slug" element={<Article />} />

          {/* ─── Gated & Auth Routes ──────────────────────────────────── */}
          <Route path="my-learning" element={<AuthGated pageName="My Learning" />} />
          <Route path="my-certificates" element={<AuthGated pageName="My Certificates" />} />
          <Route path="member-dashboard" element={<AuthGated pageName="Member Dashboard" />} />
          <Route path="profile" element={<AuthGated pageName="My Profile" />} />
          <Route path="login" element={<AuthGated pageName="Login" />} />
          <Route path="register" element={<AuthGated pageName="Register" />} />

          {/* Catch-all: show 404 page */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
}
