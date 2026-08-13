import React, { useState } from 'react';
import { PlayCircle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LEARNING_MODULES } from '../data/mockData';
import coursesData from '../data/courses.json';
import { useAuth } from '../context/AuthContext';
import CourseViewerModal from '../components/CourseViewerModal';

export default function Learning() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Merge coursesData with LEARNING_MODULES metadata
  const modules = LEARNING_MODULES.map(mod => {
    let slug = null;
    if (mod.code === 'IFSCA-CMI') slug = 'ifsca-cmi';
    if (mod.code === 'SEBI-AIF') slug = 'sebi-aif';

    const realCourse = slug ? coursesData[slug] : null;

    if (realCourse) {
      return {
        ...mod,
        ...realCourse,
        totalChapters: realCourse.totalChapters,
        totalLessons: realCourse.totalLessons,
        totalQuestions: realCourse.totalQuestions,
        totalItems: realCourse.totalItems
      };
    }
    return {
      ...mod,
      slug: mod.slug,
      totalChapters: mod.chapters?.length || 0,
      totalLessons: mod.chapters?.length || 0,
      totalQuestions: 0,
      totalItems: mod.chapters?.length || 1
    };
  });

  const getCourseProgress = (courseObj) => {
    const slug = courseObj.slug || (courseObj.code === 'IFSCA-CMI' ? 'ifsca-cmi' : courseObj.code === 'SEBI-AIF' ? 'sebi-aif' : null);
    const total = courseObj.totalItems || courseObj.chapters?.length || 1;

    let completedCount = 0;
    if (user && user.courseProgress && slug) {
      const entry = user.courseProgress.find(c => c.courseSlug === slug);
      if (entry) completedCount = entry.completedItems?.length || 0;
    } else if (slug) {
      const guestProgress = JSON.parse(localStorage.getItem('regmate_guest_course_progress') || '{}');
      completedCount = guestProgress[slug]?.completedItems?.length || 0;
    } else if (user && user.learningProgress) {
      const entry = user.learningProgress.find(p => p.moduleId === courseObj.id);
      if (entry) completedCount = entry.completedLessons?.length || 0;
    }

    const pct = Math.min(100, Math.round((completedCount / total) * 100));
    return { completedCount, total, pct };
  };

  return (
    <div className="py-16 px-6 max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="eyebrow block mb-4">§ Learning &amp; Diagnostics</span>
          <h1 className="text-4xl font-display text-forest-deep mb-4">Learning Modules</h1>
          <p className="text-ink-soft text-lg">Master regulatory topics through structured interactive courses.</p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-4">
          <Link to="/my-learning" className="cursor-target px-5 py-2.5 bg-paper border border-forest text-forest rounded-full font-medium hover-lift">
            My Learning
          </Link>
          <Link to="/diagnostic-tests" className="cursor-target px-5 py-2.5 bg-forest text-white rounded-full font-medium hover-lift">
            Diagnostic Tests
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(mod => {
          const { completedCount, total, pct } = getCourseProgress(mod);

          return (
            <div key={mod.id} className="bg-white border border-line rounded-xl p-6 card-shadow hover-lift flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-mint text-forest font-semibold text-xs rounded-full uppercase tracking-wider">
                  {mod.code}
                </span>
                {mod.badge && (
                  <span className="px-2.5 py-0.5 bg-gold/20 text-forest text-xs font-bold rounded-full">
                    {mod.badge}
                  </span>
                )}
              </div>

              <div className="flex-grow">
                <h3 className="font-semibold text-xl text-forest-deep mb-3 line-clamp-2">{mod.title}</h3>
                <p className="text-xs text-ink-soft mb-4 line-clamp-3">{mod.description}</p>
                
                <div className="text-xs font-medium text-forest mb-4 flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-leaf" /> 
                  {mod.totalChapters} Chapters • {mod.totalLessons || mod.totalChapters} Lessons • {mod.totalQuestions || 0} MCQs
                </div>
              </div>

              <div className="space-y-3 mt-auto border-t border-line pt-4">
                <div className="flex justify-between text-xs font-medium text-ink-soft">
                  <span>Course Completion</span>
                  <span className="font-bold text-forest">{user ? `${pct}%` : '0%'}</span>
                </div>
                <div className="w-full bg-line h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${pct === 100 ? 'bg-leaf-bright' : 'bg-leaf'}`} 
                    style={{ width: user ? `${pct}%` : '0%' }} 
                  />
                </div>
                <button 
                  onClick={() => setSelectedCourse(mod)}
                  className="cursor-target mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-mint text-forest font-medium rounded-lg hover:bg-mint-deep transition-colors"
                >
                  <PlayCircle className="w-4 h-4" /> View Syllabus &amp; Learn
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Viewer Modal */}
      {selectedCourse && (
        <CourseViewerModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
