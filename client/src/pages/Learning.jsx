import React, { useState } from 'react';
import { PlayCircle, CheckCircle, BookOpen, ChevronRight, X, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LEARNING_MODULES } from '../data/mockData';

export default function Learning() {
  const [selectedModule, setSelectedModule] = useState(null);

  return (
    <div className="py-16 px-6 max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="eyebrow block mb-4">§ Learning & Diagnostics</span>
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
        {LEARNING_MODULES.map(mod => (
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
              <div className="text-xs font-medium text-forest mb-6 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-leaf" /> {mod.chapters?.length || mod.lessons} Chapters • Self-Paced
              </div>
            </div>
            
            <div className="space-y-3 mt-auto border-t border-line pt-4">
              <div className="flex justify-between text-xs font-medium text-ink-soft">
                <span>Course Progress</span>
                <span className="font-bold text-forest">{mod.progress}%</span>
              </div>
              <div className="w-full bg-line h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${mod.progress === 100 ? 'bg-leaf-bright' : 'bg-leaf'}`} 
                  style={{ width: `${mod.progress}%` }} 
                />
              </div>
              <button 
                onClick={() => setSelectedModule(mod)}
                className="cursor-target mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-mint text-forest font-medium rounded-lg hover:bg-mint-deep transition-colors"
              >
                <PlayCircle className="w-4 h-4" /> View Course Outline & Syllabus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Outline Modal Drawer */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto p-8 flex flex-col shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between pb-6 border-b border-line mb-6">
              <div>
                <span className="px-3 py-1 bg-mint text-forest font-bold text-xs rounded-full uppercase">
                  {selectedModule.code}
                </span>
                <h2 className="text-2xl font-display text-forest-deep mt-2">{selectedModule.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedModule(null)}
                className="cursor-target p-2 rounded-full hover:bg-paper text-ink-soft hover:text-forest"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-ink-soft mb-6">{selectedModule.description}</p>

            <div className="flex items-center justify-between bg-paper border border-line p-4 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-gold" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-forest">Verifiable Certificate</div>
                  <div className="text-xs text-ink-soft">Complete all chapters & passing score to claim</div>
                </div>
              </div>
              <Link 
                to="/my-learning"
                onClick={() => setSelectedModule(null)}
                className="cursor-target px-4 py-2 bg-forest text-white text-xs font-medium rounded-lg hover:bg-leaf"
              >
                Start Course
              </Link>
            </div>

            <h3 className="font-semibold text-lg text-forest-deep mb-4 flex items-center justify-between">
              <span>Chapter Syllabus ({selectedModule.chapters?.length || 0} Modules)</span>
            </h3>

            <div className="space-y-3 flex-grow">
              {selectedModule.chapters?.map((ch) => (
                <div key={ch.num} className="border border-line rounded-xl p-4 bg-paper hover:bg-white hover:border-leaf transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-gold uppercase tracking-wider">Chapter {ch.num}</span>
                      <h4 className="font-semibold text-forest-deep text-base mt-0.5">{ch.title}</h4>
                      <p className="text-xs text-ink-soft mt-1">{ch.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-ink-soft flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

