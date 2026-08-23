import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import InteractiveRegulations from './pages/InteractiveRegulations';
import ChapterDetail from './pages/ChapterDetail';
import SectionDetail from './pages/SectionDetail';
import Learning from './pages/Learning';
import Quizzes from './pages/Quizzes';
import QuizTopic from './pages/QuizTopic';
import DiagnosticTests from './pages/DiagnosticTests';
import ToolsIndex from './pages/ToolsIndex';
import ToolDetail from './pages/ToolDetail';
import Templates from './pages/Templates';
import BlogIndex from './pages/BlogIndex';
import BlogDetail from './pages/BlogDetail';
import News from './pages/News';
import Article from './pages/Article';
import About from './pages/About';
import Membership from './pages/Membership';
import AuthGated from './pages/AuthGated';
import Dashboard from './pages/Dashboard';
import ExamReady from './pages/ExamReady';
import FMEInterviewPro from './pages/FMEInterviewPro';
import BlogEditorPage from './pages/BlogEditorPage';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';

// New Hub Pages per Doc 01 Architecture
import PracticeHub from './pages/PracticeHub';
import PrepareHub from './pages/PrepareHub';
import RegIntelHub from './pages/RegIntelHub';
import FreeResourcesHub from './pages/FreeResourcesHub';

// Gamified RegLearn System
import CourseHub from './pages/CourseHub';
import ChapterLearning from './pages/ChapterLearning';
import ChallengeEngine from './pages/ChallengeEngine';

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
          <Route path="learn" element={<Learning />} />
          <Route path="learn/course/:courseId" element={<Learning />} />
          <Route path="learn/paths/:pathId" element={<Learning />} />
          {/* Gamified Learning Routes */}
          <Route path="learn/:courseSlug" element={<CourseHub />} />
          <Route path="learn/:courseSlug/chapter/:chapterId" element={<ChapterLearning />} />
          <Route path="learn/:courseSlug/challenge/:challengeType" element={<ChallengeEngine />} />

          {/* ─── 2. RegLens (/understand & /interactive-regulations) ───── */}
          <Route path="understand" element={<InteractiveRegulations />} />
          <Route path="understand/:actSlug" element={<InteractiveRegulations />} />
          <Route path="understand/:actSlug/:chapter" element={<ChapterDetail />} />
          <Route path="understand/:actSlug/:chapter/:sectionNum" element={<SectionDetail />} />
          <Route path="interactive-regulations" element={<InteractiveRegulations />} />
          <Route path="interactive-regulations/:actSlug" element={<InteractiveRegulations />} />
          <Route path="interactive-regulations/:actSlug/:chapter" element={<ChapterDetail />} />
          <Route path="interactive-regulations/:actSlug/:chapter/:sectionNum" element={<SectionDetail />} />
          <Route path="interactive-regulations/:actSlug/:chapter/section/:sectionNum" element={<SectionDetail />} />

          {/* ─── 3. RegPractice (/practice) ───────────────────────────── */}
          <Route path="practice" element={<PracticeHub />} />
          <Route path="practice/quizzes" element={<Quizzes />} />
          <Route path="practice/quizzes/:topic" element={<QuizTopic />} />
          <Route path="practice/mock-tests" element={<ExamReady />} />
          <Route path="practice/mock-tests/:slug" element={<ExamReady />} />
          <Route path="practice/question-bank" element={<Quizzes />} />

          {/* ─── 4. RegTools (/tools) ─────────────────────────────────── */}
          <Route path="tools" element={<ToolsIndex />} />
          <Route path="tools/:slug" element={<ToolDetail />} />

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
          <Route path="free-resources/articles" element={<BlogIndex />} />
          <Route path="free-resources/explainers" element={<BlogIndex />} />
          <Route path="free-resources/guides" element={<BlogIndex />} />
          <Route path="free-resources/faqs" element={<BlogIndex />} />
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
          <Route path="blog/:slug" element={<Navigate to="/free-resources/blogs" replace />} />
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
