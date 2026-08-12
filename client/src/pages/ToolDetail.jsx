import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import ComplianceCalendarBuilder from '../components/ComplianceCalendarBuilder';

export default function ToolDetail() {
  const { slug } = useParams();
  const title = slug ? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Tool';

  const [mockValue, setMockValue] = useState('');

  if (slug === 'compliance-calendar') {
    return (
      <div className="py-12 px-6 max-w-7xl mx-auto animate-fade-in-up">
        <Link to="/tools" className="cursor-target inline-flex items-center text-ink-soft hover:text-leaf font-medium mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Compliance Tools
        </Link>
        <ComplianceCalendarBuilder />
      </div>
    );
  }

  const toolContent = {
    'annual-filing-tracker': {
      desc: 'Track annual return filings (AOC-4, MGT-7) step-by-step and ensure full compliance before ROC deadlines.',
      inputs: ['Company Type', 'AGM Date'],
      result: 'Your filing milestones will appear here.'
    },
    'board-meeting-planner': {
      desc: 'Plan board meeting agendas, verify quorum requirements, and generate compliant draft minutes under SS-1.',
      inputs: ['Meeting Type', 'Number of Directors'],
      result: 'Your agenda and quorum checklist will be generated here.'
    },
    'esop-calculator': {
      desc: 'Calculate vesting schedules, perquisite value, and taxation on Employee Stock Options accurately.',
      inputs: ['Grant Date', 'Number of Options'],
      result: 'Your vesting schedule and tax implications will appear here.'
    },
    'aml-risk-assessment': {
      desc: 'Use our 15-point audit score card to evaluate your Anti-Money Laundering policies, KYC verification, and PEP screening.',
      inputs: ['Business Category', 'Risk Appetite'],
      result: 'Your AML diagnostic score will be calculated here.'
    }
  };

  const currentTool = toolContent[slug] || {
    desc: 'Configure your parameters below to generate insights and reports.',
    inputs: ['Company Type', 'Financial Year'],
    result: 'Set parameters and generate results to view them here.'
  };

  return (
    <div className="py-16 px-6 max-w-5xl mx-auto animate-fade-in-up">
      <Link to="/tools" className="cursor-target inline-flex items-center text-ink-soft hover:text-leaf font-medium mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
      </Link>
      
      <div className="mb-12">
        <span className="eyebrow block mb-4">§ Interactive Tool</span>
        <h1 className="text-4xl md:text-5xl font-display text-forest-deep mb-4">{title}</h1>
        <p className="text-xl text-ink-soft max-w-2xl">{currentTool.desc}</p>
      </div>

      <div className="bg-white border border-line rounded-2xl p-8 card-shadow flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 border-r border-line pr-8">
          <h3 className="font-semibold text-lg text-forest-deep mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-leaf" /> Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1">{currentTool.inputs[0]}</label>
              <select className="cursor-target w-full border border-line rounded-lg p-2.5 bg-paper text-ink focus:outline-none focus:border-leaf">
                <option>Select option...</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1">{currentTool.inputs[1]}</label>
              <select className="cursor-target w-full border border-line rounded-lg p-2.5 bg-paper text-ink focus:outline-none focus:border-leaf">
                <option>Select option...</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1">Additional Notes</label>
              <input 
                type="text" 
                className="cursor-target w-full border border-line rounded-lg p-2.5 bg-paper text-ink focus:outline-none focus:border-leaf"
                value={mockValue}
                onChange={(e) => setMockValue(e.target.value)}
                placeholder="Enter value..."
              />
            </div>
            <button className="cursor-target w-full py-3 bg-forest text-white rounded-lg font-medium hover-lift mt-4">
              Generate
            </button>
          </div>
        </div>
        
        <div className="md:w-2/3 flex flex-col justify-center items-center py-12 bg-paper rounded-xl border border-line border-dashed">
           <div className="text-center text-ink-soft p-6">
             <CalculatorIcon className="w-16 h-16 mx-auto mb-4 text-line" />
             <p className="text-lg">{currentTool.result}</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function CalculatorIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <line x1="8" y1="6" x2="16" y2="6"></line>
      <line x1="16" y1="14" x2="16" y2="14.01"></line>
      <line x1="16" y1="10" x2="16" y2="10.01"></line>
      <line x1="16" y1="18" x2="16" y2="18.01"></line>
      <line x1="12" y1="14" x2="12" y2="14.01"></line>
      <line x1="12" y1="10" x2="12" y2="10.01"></line>
      <line x1="12" y1="18" x2="12" y2="18.01"></line>
      <line x1="8" y1="14" x2="8" y2="14.01"></line>
      <line x1="8" y1="10" x2="8" y2="10.01"></line>
      <line x1="8" y1="18" x2="8" y2="18.01"></line>
    </svg>
  )
}

