import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Clock, HelpCircle } from 'lucide-react';

const TOPICS = [
  {
    id: 'sebi-aif-regulations',
    title: 'SEBI AIF Regulations',
    desc: 'Category I, II & III AIFs, Angel Funds, PPM rules and accredited investors.',
    badge: 'Featured',
    questions: 5,
    timeMin: 10,
    difficulty: 'Intermediate',
    color: 'bg-emerald-50 border-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    iconColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'corporate-laws',
    title: 'Corporate Laws',
    desc: 'Companies Act 2013: board meetings, AGMs, ROC filings and director duties.',
    questions: 5,
    timeMin: 10,
    difficulty: 'Intermediate',
    color: 'bg-blue-50 border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-800',
    iconColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'ifsc-regulations',
    title: 'IFSC Regulations',
    desc: 'GIFT City framework — FME, CMI, IFSCA structure and net worth requirements.',
    questions: 5,
    timeMin: 10,
    difficulty: 'Advanced',
    color: 'bg-teal-50 border-teal-200',
    badgeColor: 'bg-teal-100 text-teal-800',
    iconColor: 'bg-teal-100 text-teal-700',
  },
  {
    id: 'capital-markets',
    title: 'Capital Markets',
    desc: 'SEBI LODR, PIT regulations, Takeover Code and minimum public shareholding.',
    questions: 5,
    timeMin: 10,
    difficulty: 'Advanced',
    color: 'bg-indigo-50 border-indigo-200',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    iconColor: 'bg-indigo-100 text-indigo-700',
  },
  {
    id: 'ipr',
    title: 'Intellectual Property',
    desc: 'Patents, trademarks, copyrights, designs and geographical indication frameworks.',
    questions: 5,
    timeMin: 10,
    difficulty: 'Foundational',
    color: 'bg-purple-50 border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-800',
    iconColor: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'general-laws',
    title: 'General Laws',
    desc: 'Contract Act, Arbitration Act, Limitation Act and Secretarial Standards.',
    questions: 5,
    timeMin: 10,
    difficulty: 'Foundational',
    color: 'bg-amber-50 border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-800',
    iconColor: 'bg-amber-100 text-amber-700',
  },
];

const DIFFICULTY_COLORS = {
  Foundational: 'text-emerald-700 bg-emerald-50',
  Intermediate: 'text-amber-700 bg-amber-50',
  Advanced: 'text-rose-700 bg-rose-50',
};

export default function Quizzes() {
  return (
    <div className="py-10 sm:py-14 px-4 sm:px-6 max-w-6xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-mint border border-leaf/30 rounded-full text-[11px] font-bold text-forest uppercase tracking-wider mb-4">
          <HelpCircle className="w-3.5 h-3.5" /> Topic-wise Quizzes
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-forest-deep mb-3">Practice with Quizzes</h1>
        <p className="text-base sm:text-lg text-ink-soft max-w-2xl leading-relaxed">
          Topic-wise diagnostic quizzes across the areas that matter most to compliance professionals.
          Each quiz offers instant explanations after every answer.
        </p>
      </div>

      {/* Quiz Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {TOPICS.map((topic) => (
          <Link
            key={topic.id}
            to={`/practice/quizzes/${topic.id}`}
            className={`block bg-white border rounded-2xl p-5 sm:p-6 card-shadow hover-lift group transition-all focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-offset-2`}
          >
            {/* Icon + Badge row */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${topic.iconColor}`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {topic.badge && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${topic.badgeColor}`}>
                    {topic.badge}
                  </span>
                )}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[topic.difficulty] || 'text-ink-soft bg-gray-50'}`}>
                  {topic.difficulty}
                </span>
              </div>
            </div>

            {/* Title + Desc */}
            <h3 className="font-bold text-base sm:text-lg text-forest-deep mb-1.5 leading-snug group-hover:text-forest transition-colors">
              {topic.title}
            </h3>
            <p className="text-ink-soft text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">{topic.desc}</p>

            {/* Meta row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-ink-soft">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-forest" />
                  {topic.questions} questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-forest" />
                  {topic.timeMin} min
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-forest group-hover:gap-2 transition-all">
                Start <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-8 sm:mt-10 p-4 sm:p-5 bg-mint rounded-2xl border border-mint-deep text-center">
        <p className="text-sm text-forest font-medium">
          2 questions free · <Link to="/membership" className="underline underline-offset-2 font-bold hover:text-forest-deep transition-colors">Upgrade to unlock all questions</Link>
        </p>
      </div>
    </div>
  );
}
