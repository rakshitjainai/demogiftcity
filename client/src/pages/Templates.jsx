import React, { useState } from 'react';
import { FileText, Download, Filter } from 'lucide-react';

const TEMPLATES = [
  { id: 1, title: 'Board Resolution — Change of Company Name', category: 'Corporate Governance', format: 'DOCX' },
  { id: 2, title: 'Board Resolution — Appointment of Additional Director (Sec. 161)', category: 'Corporate Governance', format: 'DOCX' },
  { id: 3, title: 'Board Resolution — Appointment of First Auditor (Sec. 139(6))', category: 'Corporate Governance', format: 'DOCX' },
  { id: 4, title: 'IFSC Entity Incorporation Checklist', category: 'IFSC & GIFT City', format: 'XLSX' },
  { id: 5, title: 'Insider Trading Policy Draft', category: 'Capital Markets', format: 'DOCX' },
  { id: 6, title: 'Due Diligence Questionnaire', category: 'Checklists', format: 'PDF' }
];

const CATEGORIES = ['All', 'Corporate Governance', 'IFSC & GIFT City', 'Capital Markets', 'Checklists'];

export default function Templates() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === activeCategory);

  return (
    <div className="py-16 px-6 max-w-6xl mx-auto animate-fade-in-up">
      <div className="text-center mb-12">
        <span className="eyebrow block mb-4">§ Resources</span>
        <h1 className="text-4xl md:text-5xl font-display text-forest-deep mb-6">Templates & Checklists</h1>
        <p className="text-xl text-ink-soft max-w-2xl mx-auto">
          Ready-to-use professional resources, drafted and reviewed by experts.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`cursor-target px-5 py-2 rounded-full font-medium transition-colors ${
              activeCategory === cat 
                ? 'bg-forest text-white' 
                : 'bg-white border border-line text-ink-soft hover:bg-mint hover:text-forest hover-lift'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(template => (
          <div key={template.id} className="bg-white border border-line rounded-xl p-6 card-shadow hover-lift flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-mint-deep rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-leaf" />
              </div>
              <span className="text-xs font-bold bg-paper border border-line px-2 py-1 rounded text-ink-soft">
                {template.format}
              </span>
            </div>
            <h3 className="font-semibold text-lg text-forest-deep mb-2 line-clamp-2">{template.title}</h3>
            <p className="text-sm text-ink-soft mb-6 mt-auto">{template.category}</p>
            
            <button className="cursor-target w-full py-2.5 bg-paper border border-forest text-forest rounded-lg font-medium hover:bg-mint transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
