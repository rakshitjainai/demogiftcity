import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Users, Calculator, ShieldAlert, ArrowRight } from 'lucide-react';

const TOOLS = [
  { slug: 'compliance-calendar', title: 'Compliance Calendar', icon: <Calendar className="w-6 h-6" />, desc: 'GIFT IFSC & statutory compliance deadline builder.' },
  { slug: 'annual-filing-tracker', title: 'Annual Filing Tracker', icon: <FileText className="w-6 h-6" />, desc: 'ROC filings (AOC-4, MGT-7, ADT-1, DIR-3 KYC) & due dates.' },
  { slug: 'board-meeting-planner', title: 'Board Meeting Planner', icon: <Users className="w-6 h-6" />, desc: 'Section 174 Quorum calculator, 120-day gap rule & agendas.' },
  { slug: 'esop-calculator', title: 'ESOP Calculator', icon: <Calculator className="w-6 h-6" />, desc: 'Statutory 1-year cliff vesting schedules & equity valuation.' },
  { slug: 'aml-risk-assessment', title: 'AML Risk Assessment', icon: <ShieldAlert className="w-6 h-6" />, desc: '10-point AML/CFT audit scorecard & diagnostic rating.' }
];

export default function ToolsIndex() {
  return (
    <div className="py-16 px-6 max-w-6xl mx-auto animate-fade-in-up">
      <div className="text-center mb-16">
        <span className="eyebrow block mb-4">§ Resources</span>
        <h1 className="text-4xl md:text-5xl font-display text-forest-deep mb-6">Compliance Tools</h1>
        <p className="text-xl text-ink-soft max-w-2xl mx-auto">
          Practical calculators, trackers, and planners to streamline your day-to-day operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map(tool => (
          <Link
            key={tool.slug}
            to={`/tools/${tool.slug}`}
            className="cursor-target group block bg-white border border-line rounded-xl p-8 card-shadow hover-lift"
          >
            <div className="w-12 h-12 bg-mint rounded-full flex items-center justify-center text-leaf mb-6 group-hover:bg-leaf group-hover:text-white transition-colors">
              {tool.icon}
            </div>
            <h2 className="text-2xl font-display text-forest-deep mb-3">{tool.title}</h2>
            <p className="text-ink-soft mb-6">{tool.desc}</p>
            <span className="inline-flex items-center text-leaf font-semibold text-sm group-hover:text-leaf-bright transition-colors">
              Open Tool <ArrowRight className="w-4 h-4 ml-2" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
