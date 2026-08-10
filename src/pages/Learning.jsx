import React from 'react';
import { PlayCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MODULES = [
  { id: 1, title: 'Basics of SEBI LODR', progress: 100, status: 'completed' },
  { id: 2, title: 'FEMA Compliances for Startups', progress: 45, status: 'in-progress' },
  { id: 3, title: 'GIFT City: Setting up an AIF', progress: 0, status: 'not-started' }
];

export default function Learning() {
  return (
    <div className="py-16 px-6 max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="eyebrow block mb-4">§ Learning & Diagnostics</span>
          <h1 className="text-4xl font-display text-forest-deep mb-4">Learning Modules</h1>
          <p className="text-ink-soft text-lg">Master regulatory topics through structured courses.</p>
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
        {MODULES.map(mod => (
          <div key={mod.id} className="bg-white border border-line rounded-xl p-6 card-shadow hover-lift flex flex-col h-full">
            <div className="flex-grow">
              <h3 className="font-semibold text-xl text-forest-deep mb-3 line-clamp-2">{mod.title}</h3>
              <p className="text-sm text-ink-soft mb-6">4 Lessons • 2 Hours</p>
            </div>
            
            <div className="space-y-3 mt-auto">
              <div className="flex justify-between text-xs font-medium text-ink-soft">
                <span>{mod.progress}% Complete</span>
              </div>
              <div className="w-full bg-line h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${mod.progress === 100 ? 'bg-leaf-bright' : 'bg-leaf'}`} 
                  style={{ width: `${mod.progress}%` }} 
                />
              </div>
              <button className="cursor-target mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-mint text-forest font-medium rounded-lg hover:bg-mint-deep transition-colors">
                {mod.progress === 100 ? <><CheckCircle className="w-4 h-4" /> Review</> : <><PlayCircle className="w-4 h-4" /> {mod.progress > 0 ? 'Continue' : 'Start'} Module</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
