import React, { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ComplianceCalendarBuilder from '../components/ComplianceCalendarBuilder';
import AnnualFilingTracker from '../components/AnnualFilingTracker';
import BoardMeetingPlanner from '../components/BoardMeetingPlanner';
import EsopCalculator from '../components/EsopCalculator';
import AmlRiskAssessment from '../components/AmlRiskAssessment';
import { useAuth } from '../context/AuthContext';
import LockOverlay from '../components/LockOverlay';

const RegReadyAssessment = React.lazy(() => import('./RegReadyAssessment'));

export default function ToolDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <LockOverlay
        type="login"
        title="Login Required for Compliance Tools"
        message="Accessing interactive compliance calculators, trackers, and planners requires an authenticated RegMate account. Please log in or sign up to continue."
        redirectPath="/login"
      />
    );
  }

  const renderToolComponent = () => {
    switch (slug) {
      case 'compliance-calendar':
        return <ComplianceCalendarBuilder />;
      case 'annual-filing-tracker':
        return <AnnualFilingTracker />;
      case 'board-meeting-planner':
        return <BoardMeetingPlanner />;
      case 'esop-calculator':
        return <EsopCalculator />;
      case 'aml-risk-assessment':
        return <AmlRiskAssessment />;
      case 'compliance-diagnostic':
      case 'regready-assessment':
      case 'ifsca-cmi-compliance-readiness-assessment':
        return (
          <Suspense fallback={<div className="p-8 text-center text-xs font-mono font-bold text-ink-soft">Loading Diagnostic...</div>}>
            <RegReadyAssessment />
          </Suspense>
        );
      default:
        return (
          <div className="bg-white border border-line rounded-2xl p-12 text-center card-shadow">
            <h2 className="text-2xl font-display text-forest-deep mb-3">Tool Not Found</h2>
            <p className="text-ink-soft mb-6">The requested compliance tool could not be located.</p>
            <Link to="/tools" className="cursor-target inline-flex items-center px-6 py-2.5 bg-forest text-white rounded-xl font-medium">
              Back to Compliance Tools
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto animate-fade-in-up">
      <Link to="/tools" className="cursor-target inline-flex items-center text-ink-soft hover:text-leaf font-medium mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Compliance Tools
      </Link>
      {renderToolComponent()}
    </div>
  );
}
