import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, FileText, ArrowLeft } from 'lucide-react';
import { ACTS_DATA, getActName } from '../data/regulationsData';

// ─── Per-section Key Highlights ──────────────────────────────────────────────
// Keyed as `actSlug|sectionNum`. Falls back to number-keyed generic bullets.

const SECTION_HIGHLIGHTS = {
  // ══ Companies Act, 2013 ══
  'companies-act-2013|1': [
    'Establishes the short title, geographic extent (applies to whole of India), and the commencement date notified by the Central Government.',
    'Lays the constitutional basis upon which all subsequent provisions, rules, and notifications derive their legal force.',
    'Companies incorporated under earlier acts are automatically governed by this Act unless a specific saving clause applies.',
  ],
  'companies-act-2013|2': [
    'Contains over 90 defined terms — e.g., "associate company", "key managerial personnel", "listed company", and "promoter" — each carrying precise statutory weight.',
    'Definitions here control interpretation in every chapter; when a term is used without re-definition, this section governs.',
    'Ambiguities between the definition clause and general law must be resolved in favour of the Companies Act definition.',
  ],
  'companies-act-2013|3': [
    'A company may be formed for any lawful purpose by 7+ persons (public), 2+ persons (private), or 1 person (OPC).',
    'Section 3 read with Section 4 governs the foundational act of formation — the Memorandum of Association must conform to the model forms in Schedule I.',
    'Producer companies may be formed under a separate framework by 10+ individuals or 2+ producer institutions.',
  ],
  'companies-act-2013|4': [
    'The MoA must state: company name, state of registered office, objects, liability clause, and authorised capital.',
    'The objects clause restricts the company\'s activities — ultra vires transactions are void and cannot be ratified by shareholders.',
    'Any subscriber to the MoA who is a minor is not legally capable of becoming a member.',
  ],
  'companies-act-2013|5': [
    'Articles govern internal management — Table A (for companies limited by shares) is deemed incorporated unless excluded or modified.',
    'Printed articles must be signed by subscribers in the presence of a witness and lodged with the Registrar.',
    'Entrenchment provisions may be included, requiring a higher threshold for amendment than the default special resolution.',
  ],
  'companies-act-2013|92': [
    'Annual Return (MGT-7 / MGT-7A) must be filed within 60 days of the AGM with the Registrar.',
    'Contains details of registered office, principal business activities, share capital, debentures, members, promoters, directors and KMP.',
    'Listed companies and companies having paid-up share capital of ₹10 crore or more must attach a Secretarial Audit Report from a Practising CS.',
  ],
  'companies-act-2013|134': [
    'Board\'s Report must include: extract of Annual Return, number of Board meetings, Directors\' Responsibility Statement, particulars of loans/guarantees/investments, related party transactions, and CSR report.',
    'Financial statements must be approved by the Board and signed by at least two directors including the MD/WTD and the CFO and CS.',
    'The Directors\' Responsibility Statement under Section 134(5) is a mandatory compliance assertion — false statements attract liability under Section 447.',
  ],
  'companies-act-2013|135': [
    'Applicable to companies with net worth ≥ ₹500 crore, turnover ≥ ₹1000 crore, or net profit ≥ ₹5 crore in the immediately preceding financial year.',
    'Mandatory spend: at least 2% of average net profits of the preceding 3 years on CSR activities listed in Schedule VII.',
    'Unspent amounts must be transferred to an Unspent CSR Account within 30 days of the close of the financial year, and to the PM National Relief Fund within 6 months.',
  ],
  'companies-act-2013|139': [
    'First auditor to be appointed by the Board within 30 days of incorporation; ratified by shareholders at the first AGM.',
    'Individual auditor — maximum term of 5 consecutive years; firm — maximum 10 consecutive years. Cooling-off period of 5 years before re-appointment.',
    'Listed companies and specified classes of companies require mandatory rotation of auditors at prescribed intervals.',
  ],
  'companies-act-2013|149': [
    'Every public company must have at least 3 directors; every private company at least 2; OPC — at least 1.',
    'Listed companies must have at least one-third of Board as Independent Directors; their names are to be drawn from a databank maintained by the Government.',
    'Every listed company and every company meeting thresholds must have at least one woman director.',
  ],
  'companies-act-2013|447': [
    'Section 447 is the omnibus fraud provision — defines "fraud" broadly to cover concealment, false representation, and abuse of position.',
    'Penalty: imprisonment of 6 months–10 years AND fine of not less than the amount involved in the fraud, up to 3 times.',
    'Where the fraud involves ₹10 lakh or more or 1% of turnover (whichever is lower), it is cognizable and non-bailable.',
  ],

  // ══ SEBI LODR ══
  'sebi-lodr-2015|1': [
    'Came into force on 2 September 2015, superseding the Listing Agreement previously executed between listed entities and stock exchanges.',
    'Applies to all listed entities whose designated securities are listed on any recognized stock exchange in India.',
    'SEBI has authority to specify or relax requirements for any class of entities consistent with investor protection objectives.',
  ],
  'sebi-lodr-2015|2': [
    '"Listed entity" is defined broadly — includes companies, REITs, InvITs, and foreign issuers whose securities are listed on Indian exchanges.',
    '"Material information" means any information that is likely to have a bearing on the price of securities — the standard for Regulation 30 disclosures.',
    '"Related party" and "related party transaction" definitions align with AS-18/Ind AS 24 and Companies Act definitions for consistency.',
  ],
  'sebi-lodr-2015|17': [
    'Minimum 6 directors for listed entities; at least 50% must be non-executive; at least one-third must be independent (50% if non-executive chairperson is a promoter).',
    'No person can be a director in more than 8 listed companies; not more than 7 listed companies if they are a whole-time director in any.',
    'Board meetings: minimum 4 per year, with maximum gap of 120 days between two consecutive meetings.',
  ],
  'sebi-lodr-2015|23': [
    'All material related party transactions require prior approval of the audit committee and shareholders via ordinary resolution.',
    '"Material RPT" threshold: transactions exceeding ₹1000 crore or 10% of the annual consolidated turnover, whichever is lower.',
    'Related parties are not permitted to vote on resolutions approving their own transactions — mandatory abstention rule.',
  ],
  'sebi-lodr-2015|30': [
    'Regulation 30 mandates disclosure of events and information to stock exchanges within 24 hours of occurrence (30 minutes for scheduled events).',
    'Schedule III Part A lists events requiring disclosure with specific timelines: mergers, agreements, director/KMP changes, disputes, etc.',
    'Listed entities must have a Board-approved policy on materiality for disclosure purposes, available on the company website.',
  ],
  'sebi-lodr-2015|33': [
    'Quarterly and annual financial results must be submitted to stock exchanges within 45 days (standalone) and 60 days (consolidated) of quarter-end.',
    'Annual audited results must be submitted within 60 days of the end of the financial year.',
    'Results must be in XBRL format for companies specified by SEBI and must include a certificate of review from the statutory auditor.',
  ],

  // ══ FEMA ══
  'fema-1999|1': [
    'Replaced FERA 1973 with a liberalised framework — criminal enforcement replaced by civil penalties for most violations.',
    'Came into force on 1 June 2000; FEMA introduced the "current/capital account transaction" binary as the primary regulatory axis.',
    'Extends to the whole of India and applies extraterritorially to branches and agencies of persons resident in India.',
  ],
  'fema-1999|2': [
    '"Person resident in India" and "person resident outside India" are the foundational definitions determining regulatory obligations.',
    '"Authorised person" means an AD bank, money changer, offshore banking unit, or any other person authorised by RBI.',
    '"Current account transaction" and "capital account transaction" directly determine whether RBI prior approval is needed.',
  ],
  'fema-1999|3': [
    'No person shall deal in or transfer any foreign exchange or security except through an authorised person.',
    'Making any payment to or receiving payment from any person resident outside India for unauthorised purposes is prohibited.',
    'Violation of Section 3 is a civil offence — penalties are enforced by the Adjudicating Authority under Section 16.',
  ],
  'fema-1999|6': [
    'Capital account transactions are prohibited unless specifically permitted by RBI through FEMA Regulations or general/special permission.',
    'Schedule I of FEMA (Capital Account Transactions) lists permissible capital account transactions for persons resident in India.',
    'RBI has liberalised several capital account transactions under the Liberalised Remittance Scheme (LRS) for individuals up to USD 2,50,000 per financial year.',
  ],
  'fema-1999|13': [
    'Penalty for contravention: up to 3 times the sum involved, or up to ₹2 lakh where the amount is not quantifiable — per contravention.',
    'Continuing contraventions attract a further penalty of ₹5,000 per day for each day after the first.',
    'Proceedings before the Adjudicating Authority are civil in nature; no imprisonment for FEMA violations except through conversion proceedings under PMLA.',
  ],

  // ══ IBC ══
  'ibc-2016|1': [
    'Consolidates insolvency law for individuals, firms, and companies — replacing SICA, RDDBFI Act provisions, and the Presidency Towns Insolvency Act.',
    'Came into force in phases: corporate insolvency on 1 December 2016; personal insolvency provisions notified later.',
    'IBBI (Insolvency and Bankruptcy Board of India) constituted under Section 189 is the apex regulator.',
  ],
  'ibc-2016|2': [
    '"Corporate debtor", "financial creditor", "operational creditor", and "resolution applicant" are the key definitional pillars.',
    '"Insolvency commencement date" triggers the moratorium under Section 14 and defines the 180/270-day CIRP timeline.',
    '"Resolution professional" and "liquidator" carry distinct roles — the former manages CIRP; the latter manages liquidation.',
  ],
  'ibc-2016|7': [
    'A financial creditor may file an application before NCLT upon default of ₹1 crore or more.',
    'NCLT must either admit or reject the application within 14 days of filing (extendable for recorded reasons).',
    'Section 7 cannot be invoked for a mere anticipated default — actual default and a record of debt must exist.',
  ],
  'ibc-2016|14': [
    'Moratorium prohibits: institution of suits, transfer/encumbrance of assets, enforcement of security interests, and recovery proceedings against the corporate debtor.',
    'Supply of essential goods/services cannot be terminated during moratorium — key protection for operational continuity.',
    'Moratorium does not extend to third-party assets held in trust or security held by a financial creditor over collateral not owned by the corporate debtor.',
  ],
  'ibc-2016|29': [
    'Section 29A was inserted by the Insolvency and Bankruptcy Code (Amendment) Ordinance, 2017 to prevent defaulters from regaining control.',
    'Persons who are promoters or in management of a corporate debtor are ineligible to submit a resolution plan.',
    'The Supreme Court in Chitra Sharma v. Union of India upheld Section 29A as constitutionally valid and in public interest.',
  ],
  'ibc-2016|53': [
    'Section 53 establishes a strict waterfall mechanism for distribution of liquidation proceeds.',
    'Priority order: Insolvency resolution costs → secured creditors (up to security value) → workmen dues (24 months) → other employee dues → unsecured financial creditors → government dues → remaining secured creditors → preference/equity shareholders.',
    'No payment to a subordinate class unless the senior class is paid in full — strict adherence to the waterfall is mandatory.',
  ],
};

// Fallback per section number (act-agnostic)
const FALLBACK_HIGHLIGHTS = {
  1: [
    'Establishes the short title, territorial extent, and official commencement date of the legislation.',
    'Forms the constitutional bedrock from which all subordinate rules, notifications, and circulars derive authority.',
    'Entities formed before this legislation are automatically subject to its provisions via savings clauses.',
  ],
  2: [
    'Provides precise statutory definitions for all key terms used throughout the legislation.',
    'Resolves interpretive conflicts — when a term is used without re-definition elsewhere, this clause governs.',
    'Definitions align with related legislation to ensure consistent regulatory application across statutes.',
  ],
  3: [
    'Delineates exactly which persons, entities, and transactions fall within the operative scope.',
    'Identifies carve-outs, exclusions, and threshold-based applicability triggers.',
    'Territorial and extraterritorial application of the provisions are specified in this clause.',
  ],
  4: [
    'The authority may issue general or specific exemptions to specified classes of entities by notification.',
    'Exemptions typically operate as non-obstante provisions, overriding default compliance requirements.',
    'Entities seeking exemption must satisfy eligibility conditions and may be subject to continued oversight.',
  ],
  5: [
    'Prescribes general procedural standards for forms, formats, timelines, and modes of filing.',
    'Non-compliance with prescribed formats may render filings defective and attract penalties.',
    'Procedural rules can be amended by the authority without amending the parent statute.',
  ],
};

function getHighlights(actSlug, sNum) {
  const key = `${actSlug}|${sNum}`;
  if (SECTION_HIGHLIGHTS[key]) return SECTION_HIGHLIGHTS[key];
  if (FALLBACK_HIGHLIGHTS[sNum]) return FALLBACK_HIGHLIGHTS[sNum];
  return [
    `Governs provision ${sNum} within the applicable framework — scope and applicability defined by the parent chapter.`,
    'Compliance obligations extend to all regulated entities unless a specific exclusion or exemption applies.',
    'Detailed procedural guidance is issued by the regulatory authority via rules, circulars, and guidance notes.',
  ];
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SectionDetail() {
  const { actSlug, chapter, sectionNum } = useParams();

  const actName = getActName(actSlug);
  const cleanChapter = chapter?.replace('chapter-', '') || '1';
  const chapterNum = parseInt(cleanChapter, 10) || 1;
  const cleanSection = sectionNum?.replace('section-', '') || '1';
  const sNum = parseInt(cleanSection, 10) || 1;

  // Get real section title from data
  const actData = ACTS_DATA[actSlug];
  const chapterData = actData?.chapters.find(c => c.num === chapterNum);
  const chapterTitle = chapterData?.title || `Chapter ${chapterNum}`;
  const sectionData = chapterData?.sections.find(s => String(s.num) === String(sNum));
  const sectionTitle = sectionData?.title || `Provision ${sNum}`;

  // Prev/Next sections within this chapter
  const allSections = chapterData?.sections || [];
  const secIdx = allSections.findIndex(s => String(s.num) === String(sNum));
  const prevSec = secIdx > 0 ? allSections[secIdx - 1] : null;
  const nextSec = secIdx < allSections.length - 1 ? allSections[secIdx + 1] : null;

  const highlights = getHighlights(actSlug, sNum);

  return (
    <div className="py-16 px-6 max-w-5xl mx-auto animate-fade-in-up">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-ink-soft mb-8 flex-wrap">
        <Link to="/interactive-regulations" className="cursor-target hover:text-leaf font-medium">
          Interactive Regulations
        </Link>
        <span>/</span>
        <Link to={`/interactive-regulations/${actSlug}/${chapter}`} className="cursor-target hover:text-leaf font-medium">
          {actName} — Ch. {chapterNum}
        </Link>
        <span>/</span>
        <span className="text-forest-deep font-semibold">Section {sNum}</span>
      </div>

      {/* Header */}
      <div className="mb-10 bg-white border border-line rounded-2xl p-8 card-shadow">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="px-3 py-1 bg-mint text-forest font-semibold text-xs rounded-full uppercase tracking-wider">
            {actName}
          </span>
          <span className="px-3 py-1 bg-gold/20 text-forest font-semibold text-xs rounded-full">
            Chapter {chapterNum} — {chapterTitle}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display text-forest-deep mb-3">
          Section {sNum}
        </h1>
        <p className="text-xl text-ink font-medium mb-4">{sectionTitle}</p>
        <p className="text-ink-soft text-base">
          Statutory section breakdown, key definitions, cross-references, and compliance notes.
        </p>
      </div>

      <div className="space-y-6">
        {/* Key Highlights — per-section data */}
        <div className="bg-paper border border-line rounded-xl p-6">
          <h3 className="font-semibold text-forest-deep text-lg mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" /> Key Highlights &amp; Scope
          </h3>
          <ul className="space-y-3 text-sm text-ink-soft">
            {highlights.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-leaf font-bold mt-0.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Full Text — Coming Soon */}
        <div className="bg-white border border-line rounded-2xl p-8 card-shadow">
          <div className="flex items-center justify-between pb-6 border-b border-line mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-leaf" />
              <h3 className="text-xl font-semibold text-forest-deep">Statutory Text &amp; Commentary</h3>
            </div>
            <span className="px-3 py-1 bg-mint text-forest font-semibold text-xs rounded-full">
              Codex Annotated View
            </span>
          </div>
          <div className="bg-mint-deep border border-leaf/20 rounded-xl p-8 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-forest mx-auto" />
            <h4 className="text-xl font-display text-forest-deep">Full Text &amp; Commentary Coming Soon</h4>
            <p className="text-sm text-ink-soft max-w-xl mx-auto">
              We are actively structuring the complete legal text of{' '}
              <strong>Section {sNum} — {sectionTitle}</strong>{' '}
              with cross-references, precedent case law, and practitioner insights by{' '}
              <strong>CS Prashant Kumar</strong>.
            </p>
          </div>
        </div>

        {/* Prev / Next section navigation (real titles) */}
        <div className="flex items-center justify-between pt-2">
          {prevSec ? (
            <Link
              to={`/interactive-regulations/${actSlug}/${chapter}/section-${prevSec.num}`}
              className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-paper border border-line rounded-xl text-forest font-medium hover:bg-mint transition-colors text-sm max-w-xs"
            >
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">§ {prevSec.num} — {prevSec.title.length > 35 ? prevSec.title.slice(0, 35) + '…' : prevSec.title}</span>
            </Link>
          ) : (
            <Link
              to={`/interactive-regulations/${actSlug}/${chapter}`}
              className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-paper border border-line rounded-xl text-forest font-medium hover:bg-mint transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Chapter
            </Link>
          )}

          {nextSec ? (
            <Link
              to={`/interactive-regulations/${actSlug}/${chapter}/section-${nextSec.num}`}
              className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-forest text-white rounded-xl font-medium hover:bg-leaf transition-colors shadow-sm text-sm max-w-xs"
            >
              <span className="truncate">§ {nextSec.num} — {nextSec.title.length > 35 ? nextSec.title.slice(0, 35) + '…' : nextSec.title}</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          ) : (
            <Link
              to={`/interactive-regulations/${actSlug}/${chapter}`}
              className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-forest text-white rounded-xl font-medium hover:bg-leaf transition-colors shadow-sm text-sm"
            >
              All Sections <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
