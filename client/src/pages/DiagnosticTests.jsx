import React from 'react';
import { Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LockOverlay from '../components/LockOverlay';

export default function DiagnosticTests() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <LockOverlay
        type="login"
        title="Login Required for Diagnostic Tests"
        message="Accessing organizational compliance diagnostic tests requires an authenticated RegMate account. Please log in or sign up to continue."
        redirectPath="/login"
      />
    );
  }
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
          { id: 'lodr', title: 'LODR Compliance Health Check', questions: 50, time: '90 mins', premium: true }
        ].map(test => (
          <div key={test.id} className="bg-white border border-line rounded-xl p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 card-shadow hover-lift group">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-mint rounded-full flex-shrink-0 flex items-center justify-center">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-leaf" />
              </div>
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-1.5 flex-wrap">
                  <h3 className="font-semibold text-lg sm:text-xl text-forest-deep">{test.title}</h3>
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
            <Link
              to={test.premium ? "/membership" : "#"}
              className="cursor-target inline-flex items-center justify-center sm:justify-start text-leaf font-semibold group-hover:text-leaf-bright transition-colors whitespace-nowrap min-h-[44px] px-4 py-2.5 rounded-lg hover:bg-mint sm:px-0 sm:py-0 sm:rounded-none sm:hover:bg-transparent"
            >
              {test.premium ? 'Unlock to Start' : 'Start Diagnostic'} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
