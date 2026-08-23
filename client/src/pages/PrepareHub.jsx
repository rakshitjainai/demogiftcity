import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, CheckCircle2, ArrowRight, ShieldCheck,
  Building2, Scale, Users, Sparkles, Award, BookOpen, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PrepareHub() {
  const { isMember } = useAuth();

  const tracks = [
    {
      id: 'fme',
      title: 'FME / Fund Management',
      regulator: 'IFSCA / GIFT City',
      status: 'Live & Comprehensive',
      isLive: true,
      badge: 'Flagship Track',
      desc: 'Master fund structuring, venture capital schemes, portfolio manager regulations, principal officer interview traps, and mock scenario discussions.',
      questions: '150+ Technical & Scenario Q&As',
      link: '/prepare/fme',
      color: 'border-emerald-300 bg-emerald-50/50'
    },
    {
      id: 'listed-cs',
      title: 'Listed Company Company Secretary',
      regulator: 'MCA / SEBI LODR',
      status: 'Coming Soon',
      isLive: false,
      badge: 'In Production',
      desc: 'Master LODR disclosures, board evaluation protocols, insider trading frameworks, and audit committee compliance interrogation scenarios.',
      questions: '120+ Practical Scenarios',
      link: '#',
      color: 'border-blue-200 bg-blue-50/30'
    },
    {
      id: 'private-public',
      title: 'Private & Public Company Advisory',
      regulator: 'Companies Act, 2013',
      status: 'Coming Soon',
      isLive: false,
      badge: 'In Production',
      desc: 'Master private placements, related party approvals, deposits, charges, and statutory audit compliance workflows.',
      questions: '100+ Real Case Scenarios',
      link: '#',
      color: 'border-amber-200 bg-amber-50/30'
    },
    {
      id: 'ifsc-roles',
      title: 'GIFT IFSC Key Managerial Roles',
      regulator: 'IFSCA Unified Framework',
      status: 'Coming Soon',
      isLive: false,
      badge: 'In Production',
      desc: 'Roles for Compliance Officers, Principal Officers, and Directors in Broker-Dealers, Custodians, and Ancillary Units.',
      questions: '110+ Role-Specific Scenarios',
      link: '#',
      color: 'border-purple-200 bg-purple-50/30'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#042C1D] via-[#0B4D33] to-[#073321] text-white p-8 sm:p-10 mb-10 shadow-xl border border-emerald-900/50">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-400/40 text-sky-300 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Briefcase size={14} className="text-sky-400" /> RegReady Ecosystem
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              Role-Specific Regulatory Preparation
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-normal leading-relaxed">
              Prepare for senior regulatory, compliance, and secretarial roles. Practice with technical scenario questions, cross-regulatory trap questions, and model answers curated by practicing professionals.
            </p>
          </div>
        </div>

        {/* Value Proposition Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white rounded-2xl border border-[var(--line)] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-3">
              <Scale size={20} />
            </div>
            <h2 className="text-base font-bold text-[var(--forest-deep)] mb-1">
              Strictly Technical & Regulatory
            </h2>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              No generic HR fluff. Pure focus on regulatory provisions, legal interpretations, and live compliance case scenarios.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[var(--line)] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 mb-3">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-base font-bold text-[var(--forest-deep)] mb-1">
              "How To Approach" Framework
            </h2>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              Step-by-step structural guidelines for articulating complex regulatory concepts during authority and board interviews.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[var(--line)] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 mb-3">
              <Sparkles size={20} />
            </div>
            <h2 className="text-base font-bold text-[var(--forest-deep)] mb-1">
              Model Answers & Traps
            </h2>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              In-depth model answers highlighting common traps, subtle circular amendments, and statutory exemptions.
            </p>
          </div>
        </div>

        {/* Tracks Grid */}
        <h2 className="text-2xl font-serif font-bold text-[var(--forest-deep)] mb-6">
          Professional Preparation Tracks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`p-6 sm:p-7 rounded-2xl border ${track.color} shadow-sm bg-white hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-[var(--mint)] text-[var(--forest)] text-[11px] font-bold uppercase tracking-wider rounded-md">
                    {track.regulator}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    track.isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {track.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[var(--forest-deep)] mb-2 font-serif">
                  {track.title}
                </h3>
                <p className="text-[13.5px] text-[var(--ink-soft)] leading-relaxed mb-4">
                  {track.desc}
                </p>

                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--leaf)] mb-6">
                  <BookOpen size={14} />
                  <span>{track.questions}</span>
                </div>
              </div>

              {track.isLive ? (
                <Link
                  to={track.link}
                  className="inline-flex items-center justify-between px-4 py-2.5 bg-[var(--forest)] hover:bg-[var(--leaf)] text-white text-sm font-semibold rounded-xl transition-colors group shadow-sm"
                >
                  <span>Launch {track.title} Track</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100 text-gray-500 text-sm font-medium rounded-xl">
                  <span>Launching Soon</span>
                  <span className="text-xs text-gray-400">Track in Review</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
