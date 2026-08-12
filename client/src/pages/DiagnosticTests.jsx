import React from 'react';
import { Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DiagnosticTests() {
  return (
    <div className="py-16 px-6 max-w-5xl mx-auto animate-fade-in-up">
      <div className="mb-12">
        <span className="eyebrow block mb-4">§ Diagnostics</span>
        <h1 className="text-4xl font-display text-forest-deep mb-4">Diagnostic Tests</h1>
        <p className="text-ink-soft text-lg">Assess your organization's compliance readiness across key frameworks.</p>
      </div>

      <div className="space-y-6">
        {[
          { id: 'aml', title: 'AML/CFT Readiness Diagnostic', questions: 45, time: '60 mins', premium: true },
          { id: 'fema', title: 'FEMA Due Diligence Checklist', questions: 30, time: '45 mins', premium: true },
          { id: 'lodr', title: 'LODR Compliance Health Check', questions: 50, time: '90 mins', premium: false }
        ].map(test => (
          <div key={test.id} className="bg-white border border-line rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 card-shadow hover-lift group">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-mint rounded-full flex-shrink-0 flex items-center justify-center">
                <Activity className="w-6 h-6 text-leaf" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-xl text-forest-deep">{test.title}</h3>
                  {test.premium && (
                    <span className="bg-gold-soft text-forest-deep text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-ink-soft text-sm">
                  {test.questions} Questions • Estimated {test.time}
                </p>
              </div>
            </div>
            <Link to={test.premium ? "/membership" : "#"} className="cursor-target inline-flex items-center text-leaf font-semibold group-hover:text-leaf-bright transition-colors whitespace-nowrap">
              {test.premium ? 'Unlock to Start' : 'Start Diagnostic'} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
