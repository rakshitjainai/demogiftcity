import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  X, 
  Eye,
  FileSpreadsheet,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

const TEMPLATES = [
  { 
    id: 1, 
    title: 'Board Resolution — Change of Company Name', 
    category: 'Corporate Governance', 
    format: 'DOCX',
    statute: 'Section 13 of Companies Act, 2013 & Rule 29 of Companies (Incorporation) Rules, 2014',
    filename: 'Board_Resolution_Change_of_Company_Name.docx',
    isAI: true,
    statusBadge: 'Draft — pending legal review',
    description: 'Standard draft resolution for change of name of a private or public company, including reservation of name via RUN/SPICe+ and approval of notice for EGM.',
    content: `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF [COMPANY NAME PRIVATE LIMITED] HELD ON [DATE] AT [TIME] AT THE REGISTERED OFFICE AT [ADDRESS].

APPROVAL FOR CHANGE OF NAME OF THE COMPANY:
"RESOLVED THAT pursuant to the provisions of Section 13 and other applicable provisions, if any, of the Companies Act, 2013 and the rules made thereunder, subject to the approval of the Central Government (Power delegated to Registrar of Companies) and the approval of shareholders in General Meeting by way of Special Resolution, the consent of the Board of Directors be and is hereby accorded to change the name of the Company from '[EXISTING NAME PRIVATE LIMITED]' to '[PROPOSED NAME PRIVATE LIMITED]' or any other name as may be approved by the Registrar of Companies.

RESOLVED FURTHER THAT any Director of the Company be and is hereby authorized to make an application to the Registrar of Companies (ROC) for reservation of the proposed name(s) and to file necessary forms including RUN / SPICe+ (INC-33/34) and MGT-14 as may be required under the Companies Act, 2013.

RESOLVED FURTHER THAT an Extraordinary General Meeting (EGM) of the shareholders of the Company be convened on [DATE OF EGM] at [TIME] at the Registered Office of the Company to pass necessary Special Resolution for change of name and consequent alteration of Memorandum of Association (MOA) and Articles of Association (AOA)."

Certified True Copy,
For [COMPANY NAME PRIVATE LIMITED]

_______________________
[Director Name]
Director (DIN: [DIN])`
  },
  { 
    id: 2, 
    title: 'Board Resolution — Appointment of Additional Director (Sec. 161)', 
    category: 'Corporate Governance', 
    format: 'DOCX',
    statute: 'Section 161(1), 152, 164 & 173 of Companies Act, 2013 read with Secretarial Standard-1 (SS-1)',
    filename: 'Board_Resolution_Appointment_Additional_Director.docx',
    isAI: false,
    statusBadge: 'Verified Sourced Content',
    sourceRef: 'Extracted from RegMate reviewed legal repository (Article #104)',
    description: 'Certified true copy format for appointing an Additional Director under Section 161(1) of Companies Act 2013, prior to ROC DIR-12 filing.',
    content: `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF [COMPANY NAME PRIVATE LIMITED] HELD ON [DATE] AT [TIME] AT THE REGISTERED OFFICE AT [ADDRESS].

APPOINTMENT OF MR./MS. [DIRECTOR NAME] AS AN ADDITIONAL DIRECTOR:
"RESOLVED THAT pursuant to the provisions of Section 161(1) and other applicable provisions, if any, of the Companies Act, 2013 read with the Articles of Association of the Company, Mr./Ms. [Director Name] (holding DIN: [DIN]), who has consented to act as Director and given declaration in Form DIR-8 that he/she is not disqualified under Section 164(2), be and is hereby appointed as an Additional Director of the Company with effect from [Effective Date].

RESOLVED FURTHER THAT Mr./Ms. [Director Name] shall hold office up to the date of the next Annual General Meeting (AGM) of the Company or the last date on which the AGM ought to have been held, whichever is earlier.

RESOLVED FURTHER THAT any Director of the Company be and is hereby authorized to file Form DIR-12 with the Registrar of Companies (ROC) within 30 days of appointment and do all such acts, deeds, and things as may be necessary to give effect to this resolution."

Certified True Copy,
For [COMPANY NAME PRIVATE LIMITED]

_______________________
[Chairman / Director Name]
Director (DIN: [DIN])`
  },
  { 
    id: 3, 
    title: 'Board Resolution — Appointment of First Auditor (Sec. 139(6))', 
    category: 'Corporate Governance', 
    format: 'DOCX',
    statute: 'Section 139(6) & Section 141 of Companies Act, 2013 read with Form ADT-1 rules',
    filename: 'Board_Resolution_Appointment_First_Auditor.docx',
    isAI: false,
    statusBadge: 'Verified Sourced Content',
    sourceRef: 'Extracted from RegMate reviewed legal repository (Article #114)',
    description: 'Board resolution format for appointing the first statutory auditor of a newly incorporated company within 30 days, supporting Form ADT-1 filing.',
    content: `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE FIRST MEETING OF THE BOARD OF DIRECTORS OF [COMPANY NAME PRIVATE LIMITED] HELD ON [DATE] AT [TIME] AT [REGISTERED OFFICE ADDRESS].

APPOINTMENT OF FIRST STATUTORY AUDITORS:
"RESOLVED THAT pursuant to the provisions of Section 139(6) and other applicable provisions, if any, of the Companies Act, 2013 and the rules made thereunder, M/s. [NAME OF CA FIRM], Chartered Accountants (Firm Registration No. [FRN]), having their office at [ADDRESS], who have furnished written consent and certificate under Section 141 confirming their eligibility, be and are hereby appointed as the First Statutory Auditors of the Company to hold office from the date of this meeting until the conclusion of the First Annual General Meeting of the Company at a remuneration to be fixed by the Board of Directors.

RESOLVED FURTHER THAT any Director of the Company be and is hereby authorized to file Form ADT-1 with the Registrar of Companies (ROC) within 15 days of appointment and to take all necessary statutory steps."

Certified True Copy,
For [COMPANY NAME PRIVATE LIMITED]

_______________________
[Director Name]
Director (DIN: [DIN])`
  },
  { 
    id: 4, 
    title: 'IFSC Entity Incorporation Checklist', 
    category: 'IFSC & GIFT City', 
    format: 'XLSX',
    statute: 'IFSCA (Fund Management / Finance Company / CMI) Regulations & GIFT SEZ Guidelines',
    filename: 'IFSC_Entity_Incorporation_Checklist.xlsx',
    isAI: true,
    statusBadge: 'Draft — pending legal review',
    description: 'Comprehensive 15-point diagnostic checklist covering SEZ co-developer approval, IFSCA registration, Net Worth certification, and office space allocation in GIFT IFSC.',
    items: [
      { id: 1, action: 'Name Approval (SPICe+)', req: "Include 'IFSC' or 'GIFT' prefix", status: 'Pending / Approved' },
      { id: 2, action: 'SEZ Application (Form F)', req: 'Submit to SEZ Development Commissioner', status: 'Submitted' },
      { id: 3, action: 'Co-Developer Allotment', req: 'Unit lease agreement in GIFT SEZ', status: 'Executed' },
      { id: 4, action: 'Net Worth Certificate', req: 'Certified by CA in USD / INR', status: 'Obtained' },
      { id: 5, action: 'Principal Officer Appt', req: 'Fit & Proper Criteria under IFSCA', status: 'Verified' },
      { id: 6, action: 'Compliance Officer Appt', req: 'Qualified CS / Legal Professional', status: 'Appointed' },
      { id: 7, action: 'IFSCA Reg Application', req: 'Online portal submission (Form A)', status: 'Submitted' },
      { id: 8, action: 'Business Plan (5-Yr)', req: 'Financial projections & GWP/AUM', status: 'Drafted' },
      { id: 9, action: 'Internal Audit Manual', req: 'Risk management & AML policy', status: 'Completed' },
      { id: 10, action: 'Bank Account Opening', req: 'IFSC Bank Unit (IBU) Account', status: 'Opened' },
      { id: 11, action: 'Statutory Deposit', req: 'Escrow deposit as per regulations', status: 'Transferred' },
      { id: 12, action: 'IT Infrastructure', req: 'Cyber-security audit compliance', status: 'Audited' },
      { id: 13, action: 'Annual SEZ Returns', req: 'Form APR filing setup', status: 'Configured' },
      { id: 14, action: 'Tax Exemption (80LA)', req: '100% tax holiday 10-yr window', status: 'Registered' },
      { id: 15, action: 'Board Approval', req: 'Resolution adopting IFSCA framework', status: 'Executed' }
    ],
    content: `IFSC ENTITY INCORPORATION & REGULATORY COMPLIANCE CHECKLIST
============================================================
Target Authority: International Financial Services Centres Authority (IFSCA) & GIFT SEZ Authority

ITEM | COMPLIANCE ACTION ITEM | MANDATORY REQUIREMENT | STATUS / DATE
----|------------------------|-----------------------|--------------
1   | Name Approval (SPICe+) | Include 'IFSC' or 'GIFT' prefix | [ ] Pending / Approved
2   | SEZ Application (Form F) | Submit to SEZ Development Commissioner | [ ] Submitted
3   | Co-Developer Allotment | Unit lease agreement in GIFT SEZ | [ ] Executed
4   | Net Worth Certificate | Certified by CA in USD / INR | [ ] Obtained
5   | Principal Officer Appt | Fit & Proper Criteria under IFSCA | [ ] Verified
6   | Compliance Officer Appt | Qualified CS / Legal Professional | [ ] Appointed
7   | IFSCA Reg Application | Online portal submission (Form A) | [ ] Submitted
8   | Business Plan (5-Yr) | Financial projections & GWP/AUM | [ ] Drafted
9   | Internal Audit Manual | Risk management & AML policy | [ ] Completed
10  | Bank Account Opening | IFSC Bank Unit (IBU) Account | [ ] Opened
11  | Statutory Deposit | Escrow deposit as per regulations | [ ] Transferred
12  | IT Infrastructure | Cyber-security audit compliance | [ ] Audited
13  | Annual SEZ Returns | Form APR filing setup | [ ] Configured
14  | Tax Exemption (80LA) | 100% tax holiday 10-yr window | [ ] Registered
15  | Board Approval | Resolution adopting IFSCA framework | [ ] Executed`
  },
  { 
    id: 5, 
    title: 'Insider Trading Policy Draft', 
    category: 'Capital Markets', 
    format: 'DOCX',
    statute: 'SEBI (Prohibition of Insider Trading) Regulations, 2015 [Reg. 9(1) & Schedule B]',
    filename: 'Insider_Trading_Policy_Draft.docx',
    isAI: true,
    statusBadge: 'Draft — pending legal review',
    description: 'Code of Conduct for prevention of insider trading, UPSI handling procedures, trading window closure timelines, and structural digital database (SDD) mandates.',
    content: `CODE OF CONDUCT FOR PREVENTION OF INSIDER TRADING AND PRESERVATION OF UPSI
[Drafted under SEBI (Prohibition of Insider Trading) Regulations, 2015]

1. OBJECTIVE & APPLICABILITY:
This Code aims to establish a framework for handling Unpublished Price Sensitive Information (UPSI) and regulating trading by Designated Persons and connected entities.

2. PRESERVATION OF UPSI:
(a) All information shall be handled on a "Need to Know" basis.
(b) UPSI shall be disclosed only to those who require the information to discharge their duty or legal obligations.
(c) Structural Digital Database (SDD) must contain names of persons sharing and receiving UPSI along with PAN/identifier.

3. TRADING WINDOW CLOSURE:
(a) Trading window shall be closed during the period when UPSI is unannounced.
(b) Designated Persons shall not trade during trading window closure (e.g. from end of quarter till 48 hours after financial results declaration).

4. PRE-CLEARANCE OF TRADES:
All Designated Persons intending to trade in securities exceeding Rs. 10 Lakhs in value shall obtain prior clearance from the Compliance Officer.

5. REPORTING & PENALTIES:
Any violation of this Code shall be reported to the Audit Committee and SEBI within statutory timelines.`
  },
  { 
    id: 6, 
    title: 'Statutory Due Diligence Questionnaire', 
    category: 'Checklists', 
    format: 'PDF',
    statute: 'Companies Act, 2013, SEBI Regulations, FEMA 1999 & Tax Compliance Audit',
    filename: 'Statutory_Due_Diligence_Questionnaire.pdf',
    isAI: true,
    statusBadge: 'Draft — pending legal review',
    description: 'Detailed 25-point compliance audit questionnaire covering corporate structure, litigation history, related party transactions, FEMA approvals, and IPR registrations.',
    content: `STATUTORY DUE DILIGENCE QUESTIONNAIRE FOR CORPORATE AUDIT
=========================================================

1. CORPORATE STRUCTURE & REGISTRATION:
   1.1 Copy of Certificate of Incorporation, MOA, and AOA.
   1.2 Details of shareholding pattern and register of members under Sec. 88.
   1.3 List of present Directors and key managerial personnel (KMP).

2. STATUTORY & ROC FILINGS:
   2.1 Status of annual ROC filings (AOC-4 & MGT-7) for last 3 financial years.
   2.2 Form DIR-12, MGT-14, and PAS-3 copies for all past corporate actions.
   2.3 Register of Charges and Search Report (CHG-1 / CHG-4).

3. RELATED PARTY TRANSACTIONS (RPT):
   3.1 Register of Contracts under Sec. 189.
   3.2 Audit Committee & Board approvals for RPTs under Sec. 188 / SEBI LODR.

4. FEMA & FOREIGN INVESTMENT:
   4.1 Details of FDI / ODI received or made by the Company.
   4.2 Form FC-GPR / FC-TRS filings and RBI UIN numbers.

5. LITIGATION & INTELLECTUAL PROPERTY:
   5.1 Summary of pending litigation against the Company or Directors.
   5.2 Registered trademarks, patents, and domain ownerships.`
  }
];

const CATEGORIES = ['All', 'Corporate Governance', 'IFSC & GIFT City', 'Capital Markets', 'Checklists'];

export default function Templates() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [copied, setCopied] = useState(false);

  const filtered = activeCategory === 'All' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === activeCategory);

  // ─── 1. DOCX NATIVE FILE GENERATOR ─────────────────────────────────────────
  const downloadDocxFile = async (template) => {
    const lines = template.content.split('\n');
    const paragraphs = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        paragraphs.push(new Paragraph({ text: '' }));
        return;
      }

      if (trimmed.startsWith('CERTIFIED TRUE COPY') || trimmed.startsWith('CODE OF CONDUCT')) {
        paragraphs.push(
          new Paragraph({
            text: trimmed,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 }
          })
        );
      } else if (trimmed.endsWith(':') || trimmed.startsWith('APPROVAL FOR') || trimmed.startsWith('APPOINTMENT OF')) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: trimmed, bold: true, size: 22 })],
            spacing: { before: 180, after: 80 }
          })
        );
      } else if (trimmed.startsWith('"RESOLVED') || trimmed.startsWith('RESOLVED')) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: trimmed, italic: true, size: 20 })],
            indent: { left: 360, right: 360 },
            spacing: { before: 120, after: 120 }
          })
        );
      } else {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: trimmed, size: 20 })],
            spacing: { after: 80 }
          })
        );
      }
    });

    const doc = new Document({
      sections: [{ children: paragraphs }]
    });

    const blob = await Packer.toBlob(doc);
    saveBlob(blob, template.filename);
  };

  // ─── 2. XLSX NATIVE SPREADSHEET GENERATOR ───────────────────────────────────
  const downloadXlsxFile = (template) => {
    const wb = XLSX.utils.book_new();
    
    const rows = [
      ['ITEM #', 'COMPLIANCE ACTION ITEM', 'MANDATORY REGULATORY REQUIREMENT', 'STATUS / VERIFICATION DATE']
    ];

    if (template.items && template.items.length > 0) {
      template.items.forEach(i => {
        rows.push([i.id, i.action, i.req, i.status]);
      });
    } else {
      rows.push([1, 'Sample Action Item', 'Mandatory Statutory Requirement', 'Pending']);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Set column widths
    ws['!cols'] = [
      { wch: 10 },
      { wch: 35 },
      { wch: 55 },
      { wch: 25 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'IFSC Checklist');
    XLSX.writeFile(wb, template.filename);
  };

  // ─── 3. PDF NATIVE DOCUMENT GENERATOR ──────────────────────────────────────
  const downloadPdfFile = (template) => {
    const doc = new jsPDF();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(template.title, 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Statute Ref: ${template.statute}`, 14, 25);
    doc.setDrawColor(200);
    doc.line(14, 28, 196, 28);

    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(20);

    const splitText = doc.splitTextToSize(template.content, 180);
    let y = 35;
    
    splitText.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 14, y);
      y += 5;
    });

    doc.save(template.filename);
  };

  // Helper function to download Blob
  const saveBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Master Format Router
  const handleDownload = async (template, e) => {
    if (e) e.stopPropagation();

    if (template.format === 'XLSX') {
      downloadXlsxFile(template);
    } else if (template.format === 'PDF') {
      downloadPdfFile(template);
    } else {
      await downloadDocxFile(template);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-16 px-6 max-w-6xl mx-auto animate-fade-in-up">
      
      {/* Header */}
      <div className="text-center mb-12">
        <span className="eyebrow block mb-4">§ Resources & Statutory Tools</span>
        <h1 className="text-4xl md:text-5xl font-display text-forest-deep mb-6">Templates & Checklists</h1>
        <p className="text-xl text-ink-soft max-w-2xl mx-auto">
          Ready-to-use professional board resolutions, IFSC compliance checklists, and statutory draft policies.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`cursor-target px-5 py-2 rounded-full font-medium transition-colors cursor-pointer ${
              activeCategory === cat 
                ? 'bg-forest text-white' 
                : 'bg-white border border-line text-ink-soft hover:bg-mint hover:text-forest'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(template => (
          <div 
            key={template.id} 
            onClick={() => setSelectedTemplate(template)}
            className="bg-white border border-line rounded-2xl p-6 card-shadow hover:border-leaf transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-mint rounded-xl flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-white transition-colors">
                  {template.format === 'XLSX' ? (
                    <FileSpreadsheet className="w-5 h-5" />
                  ) : template.format === 'PDF' ? (
                    <FileCheck2 className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${
                    template.format === 'XLSX' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    template.format === 'PDF' ? 'bg-red-50 text-red-800 border-red-200' :
                    'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                    {template.format}
                  </span>

                  {/* Review Status Badge */}
                  {template.isAI ? (
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" /> Draft — pending review
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Sourced
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-lg text-forest-deep mb-2 line-clamp-2 group-hover:text-leaf transition-colors">
                {template.title}
              </h3>
              <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed mb-3">
                {template.description}
              </p>
              <span className="text-[11px] font-semibold text-leaf block">
                {template.category}
              </span>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button 
                onClick={(e) => handleDownload(template, e)}
                className="cursor-target flex-1 py-2.5 bg-forest text-white rounded-xl font-bold text-xs hover:bg-leaf transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download {template.format}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }}
                className="cursor-target p-2.5 bg-paper border border-line text-forest rounded-xl font-bold text-xs hover:bg-mint transition-colors cursor-pointer"
                title="Preview Template"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Preview & Download Drawer */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-3xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-mint text-forest border border-leaf/20">
                    {selectedTemplate.category}
                  </span>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-paper border border-line text-ink">
                    {selectedTemplate.format}
                  </span>

                  {/* Review Status Badge */}
                  {selectedTemplate.isAI ? (
                    <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Draft — pending legal review
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Sourced Content
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-display text-forest-deep">{selectedTemplate.title}</h2>
                <p className="text-xs text-ink-soft mt-1">Ref: {selectedTemplate.statute}</p>
                {selectedTemplate.sourceRef && (
                  <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">{selectedTemplate.sourceRef}</p>
                )}
              </div>

              <button 
                onClick={() => setSelectedTemplate(null)}
                className="p-2 rounded-full hover:bg-paper transition-colors text-ink-soft cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Template Body / Preview Box */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900 text-slate-100 rounded-2xl p-5 font-mono text-xs leading-relaxed border border-slate-800">
              <pre className="whitespace-pre-wrap font-mono">{selectedTemplate.content}</pre>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(selectedTemplate.content)}
                  className="px-4 py-2 bg-paper border border-line text-forest font-bold text-xs rounded-xl hover:bg-mint transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-paper border border-line text-ink-soft font-semibold text-xs rounded-xl hover:bg-mint transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>

              <button
                onClick={() => handleDownload(selectedTemplate)}
                className="w-full sm:w-auto px-6 py-2.5 bg-forest text-white font-bold text-xs rounded-xl hover:bg-leaf transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Native {selectedTemplate.format} File
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
