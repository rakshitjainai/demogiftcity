import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import KnowledgeHub from './pages/KnowledgeHub';
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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="knowledge-hub" element={<KnowledgeHub />} />
          <Route path="interactive-regulations" element={<InteractiveRegulations />} />
          <Route path="interactive-regulations/:actSlug/:chapter" element={<ChapterDetail />} />
          <Route path="interactive-regulations/:actSlug/:chapter/:sectionNum" element={<SectionDetail />} />
          <Route path="interactive-regulations/:actSlug/:chapter/section/:sectionNum" element={<SectionDetail />} />
          <Route path="learning" element={<Learning />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="quizzes/:topic" element={<QuizTopic />} />
          <Route path="diagnostic-tests" element={<DiagnosticTests />} />
          <Route path="exam-ready" element={<ExamReady />} />
          <Route path="tools" element={<ToolsIndex />} />
          <Route path="tools/:slug" element={<ToolDetail />} />
          <Route path="templates" element={<Templates />} />
          <Route path="blog" element={<BlogIndex />} />
          <Route path="blog/:slug" element={<BlogDetail />} />
          <Route path="news" element={<News />} />
          <Route path="news/:slug" element={<Article />} />
          <Route path="about" element={<About />} />
          <Route path="membership" element={<Membership />} />
          
          {/* Gated Routes */}
          <Route path="my-learning" element={<AuthGated pageName="My Learning" />} />
          <Route path="my-certificates" element={<AuthGated pageName="My Certificates" />} />
          <Route path="member-dashboard" element={<AuthGated pageName="Member Dashboard" />} />
          <Route path="profile" element={<AuthGated pageName="My Profile" />} />
          <Route path="login" element={<AuthGated pageName="Login" />} />
        </Route>
      </Routes>
    </div>
  );
}

