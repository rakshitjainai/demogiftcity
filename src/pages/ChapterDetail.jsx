import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, BookOpen, ChevronRight } from 'lucide-react';

const ACT_NAMES = {
  'companies-act-2013': 'Companies Act, 2013',
  'sebi-lodr-2015': 'SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015',
  'fema-1999': 'Foreign Exchange Management Act, 1999',
  'ibc-2016': 'Insolvency and Bankruptcy Code, 2016',
};

export default function ChapterDetail() {
  const { actSlug, chapter } = useParams();
  const actName = ACT_NAMES[actSlug] || actSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const chapterNum = chapter?.replace('chapter-', '') || '1';

  const sampleSections = [
    { num: 1, title: 'Preliminary — Short Title and Definitions' },
    { num: 2, title: 'Interpretation and Scope' },
    { num: 3, title: 'Application of Provisions' },
    { num: 4, title: 'Exemptions and Special Cases' },
    { num: 5, title: 'General Rules and Procedures' },
  ];

  return (
    <div className="py-16 px-6 max-w-5xl mx-auto animate-fade-in-up">
      <Link to="/interactive-regulations" className="cursor-target inline-flex items-center text-ink-soft hover:text-leaf font-medium mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Interactive Regulations
      </Link>

      <div className="mb-10">
        <span className="eyebrow block mb-3">§ {actName}</span>
        <h1 className="text-3xl md:text-4xl font-display text-forest-deep mb-4">Chapter {chapterNum}</h1>
        <p className="text-ink-soft text-lg">
          Browse sections within Chapter {chapterNum} of the {actName}.
        </p>
      </div>

      {/* Sections list */}
      <div className="bg-white border border-line rounded-2xl overflow-hidden card-shadow">
        <div className="px-6 py-4 bg-mint border-b border-line flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-forest" />
          <h3 className="font-semibold text-forest-deep">Sections in this Chapter</h3>
        </div>
        <ul className="divide-y divide-line">
          {sampleSections.map(sec => (
            <li key={sec.num}>
              <button className="cursor-target w-full text-left px-6 py-4 flex items-center justify-between hover:bg-mint transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-paper border border-line flex items-center justify-center flex-shrink-0 group-hover:bg-mint-deep group-hover:border-leaf transition-colors">
                    <FileText className="w-4 h-4 text-ink-soft group-hover:text-leaf transition-colors" />
                  </div>
                  <div>
                    <span className="font-medium text-ink group-hover:text-forest-deep transition-colors">
                      Section {sec.num}
                    </span>
                    <span className="text-sm text-ink-soft ml-2">— {sec.title}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-line group-hover:text-leaf transition-colors" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Coming Soon notice */}
      <div className="mt-8 bg-mint-deep border border-leaf/20 rounded-xl p-6 text-center">
        <p className="text-ink-soft text-sm">
          <strong className="text-forest-deep">Full section content coming soon.</strong> We're actively structuring the text of this chapter 
          with annotations, cross-references, and practitioner notes by CS Prashant Kumar.
        </p>
      </div>
    </div>
  );
}
