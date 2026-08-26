import { ACTS_DATA, getActDefinitions, getActSchedules } from '../data/regulationsData.js';
import ifscaFmePackage from '../data/RegMate_IFSCA_FME_2025_Content_Package_FINAL.json';
import ifscaCmiPackage from '../data/RegMate_IFSCA_CMI_2025_FINAL.json';

const ROMAN_MAP = {
  'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6,
  'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12,
  'XIII': 13, 'XIV': 14, 'XV': 15, 'XVI': 16, 'XVII': 17, 'XVIII': 18,
  'XIX': 19, 'XX': 20, 'XXI': 21, 'XXII': 22, 'XXIII': 23, 'XXIV': 24,
  'XXV': 25, 'XXVI': 26, 'XXVII': 27, 'XXVIII': 28, 'XXIX': 29, 'XXX': 30
};

const NUM_TO_ROMAN = Object.entries(ROMAN_MAP).reduce((acc, [roman, num]) => {
  acc[num] = roman;
  return acc;
}, {});

/**
 * Normalizes any slug alias to its canonical regulation slug.
 */
export function normalizeRegulationSlug(slug) {
  if (!slug) return 'ifsca-cmi-2025';
  const clean = String(slug).toLowerCase().trim();
  const aliasMap = {
    'ifsca-cmi-2025': 'ifsca-cmi-2025',
    'ifsca-cmi': 'ifsca-cmi-2025',
    'cmi': 'ifsca-cmi-2025',
    'cmi-2025': 'ifsca-cmi-2025',

    'ifsca-fme-2025': 'ifsca-fme-2025',
    'ifsca-fme': 'ifsca-fme-2025',
    'fme': 'ifsca-fme-2025',
    'fme-2025': 'ifsca-fme-2025',

    'ifsca-listing-2024': 'ifsca-listing-2024',
    'listing-2024': 'ifsca-listing-2024',
    'listing': 'ifsca-listing-2024',
    'ifsca-listing': 'ifsca-listing-2024',

    'ifsca-finance-company-2021': 'ifsca-finance-company-2021',
    'finance-company-2021': 'ifsca-finance-company-2021',
    'finance-company': 'ifsca-finance-company-2021',

    'ifsca-registration-insurance-business-2021': 'ifsca-registration-insurance-business-2021',
    'insurance-business-2021': 'ifsca-registration-insurance-business-2021',
    'insurance-business': 'ifsca-registration-insurance-business-2021',

    'ifsca-pension-fund-2026': 'ifsca-pension-fund-2026',
    'pension-fund-2026': 'ifsca-pension-fund-2026',
    'pension-fund': 'ifsca-pension-fund-2026',

    'ifsca-mga-2026': 'ifsca-mga-2026',
    'mga-2026': 'ifsca-mga-2026',
    'mga': 'ifsca-mga-2026',

    'companies-act-2013': 'companies-act-2013',
    'companies-act': 'companies-act-2013',

    'sebi-aif-2012': 'sebi-aif-2012',
    'sebi-aif': 'sebi-aif-2012',

    'sebi-lodr-2015': 'sebi-lodr-2015',
    'sebi-lodr': 'sebi-lodr-2015'
  };

  return aliasMap[clean] || clean;
}

/**
 * Normalizes a chapter input (e.g., "chapter-1", "I", "1", "Chapter II") to standardized chapter keys.
 */
export function normalizeChapterId(chapVal) {
  if (chapVal === null || chapVal === undefined) return { raw: 'I', roman: 'I', num: 1 };
  const str = String(chapVal).replace(/^chapter[-_\s]*/i, '').trim();
  const upper = str.toUpperCase();
  if (ROMAN_MAP[upper]) {
    return { raw: str, roman: upper, num: ROMAN_MAP[upper] };
  }
  const parsed = parseInt(str, 10);
  if (!isNaN(parsed) && parsed > 0) {
    return { raw: str, roman: NUM_TO_ROMAN[parsed] || String(parsed), num: parsed };
  }
  return { raw: str, roman: upper, num: 1 };
}

/**
 * Normalizes a provision identifier (e.g., "reg-1", "section-4", "1", "4(1)")
 */
export function normalizeProvisionNumber(provVal) {
  if (provVal === null || provVal === undefined) return '1';
  return String(provVal)
    .replace(/^(section|sec|regulation|reg)[-_\s]*/i, '')
    .trim();
}

/**
 * Normalizes a provision object to guarantee all required fields exist.
 */
function normalizeProvisionObject(p, actTitle, fallbackCommencement) {
  const number = String(p.provision_number || p.number || p.num || p.provision_id || '');
  const heading = p.provision_heading || p.heading || p.title || p.regulation_name || (number ? `Regulation ${number}` : 'Provision');
  const text = p.statutory_text || p.regulation_text || p.text || p.content || p.statutoryText || p.officialText || '';
  const explanation = p.simple_explanation || p.summary || p.regmate_explanation || p.source_based_overview || '';
  const comment = p.regmate_comment || p.regmate_explanation || '';

  let relatedProvisions = [];
  if (Array.isArray(p.related_provisions)) {
    relatedProvisions = p.related_provisions;
  } else if (typeof p.related_provisions === 'string' && p.related_provisions.trim()) {
    relatedProvisions = p.related_provisions.split(',').map(s => s.trim()).filter(Boolean);
  }

  let example = '';
  if (Array.isArray(p.examples)) {
    example = p.examples.join('\n');
  } else if (Array.isArray(p.example)) {
    example = p.example.join('\n');
  } else {
    example = p.example || '';
  }

  return {
    provision_id: number,
    number,
    heading,
    title: heading,
    type: p.provision_type || 'regulation',
    text,
    statutory_text: text,
    simple_explanation: explanation,
    regmate_comment: comment,
    practical_point: p.practical_point || '',
    compliance_point: p.compliance_point || '',
    example,
    risk_point: p.risk_point || '',
    interview_point: p.interview_point || '',
    important_numbers: p.important_numbers || '',
    memory_aid: p.memory_aid || '',
    related_provisions: relatedProvisions,
    compliance_frequency: p.compliance_frequency || '',
    responsible_person: p.responsible_person || '',
    applicability: p.applicability || '',
    effective_date: p.effective_date || fallbackCommencement || '',
    last_verified_date: p.last_verified_date || '2026-08-14',
    verification_status: p.verification_status || p.review_status || 'verified',
    source_reference: p.source_reference || `Sec ${number}, ${actTitle || 'Regulation'}`
  };
}

/**
 * Returns all available regulations for the catalog / dropdown.
 */
export async function getAllRegulations() {
  return [
    {
      slug: 'ifsca-cmi-2025',
      id: 'ifsca-cmi-2025',
      title: 'IFSCA (Capital Market Intermediaries) Regulations, 2025',
      short_name: 'IFSCA CMI 2025',
      regulator: 'IFSCA',
      versionDate: 'Consolidated to 12 Jan 2026',
      totalChapters: 6,
      totalProvisions: 47,
      status: 'Live & Verified',
      category: 'Capital Markets / GIFT IFSC',
      featured: true
    },
    {
      slug: 'ifsca-fme-2025',
      id: 'ifsca-fme-2025',
      title: 'IFSCA (Fund Management) Regulations, 2025',
      short_name: 'IFSCA FME 2025',
      regulator: 'IFSCA',
      versionDate: 'As amended up to 30 January 2026',
      totalChapters: 12,
      totalProvisions: 161,
      status: 'Live & Verified',
      category: 'Fund Management / GIFT IFSC',
      featured: true
    },
    {
      slug: 'ifsca-listing-2024',
      id: 'ifsca-listing-2024',
      title: 'IFSCA (Listing) Regulations, 2024',
      short_name: 'IFSCA Listing 2024',
      regulator: 'IFSCA',
      versionDate: 'As amended up to 14 October 2025',
      totalChapters: 14,
      totalProvisions: 131,
      status: 'Live & Verified',
      category: 'Listing & Exchanges / GIFT IFSC',
      featured: true
    },
    {
      slug: 'ifsca-finance-company-2021',
      id: 'ifsca-finance-company-2021',
      title: 'IFSCA (Finance Company) Regulations, 2021',
      short_name: 'IFSCA Finance Company 2021',
      regulator: 'IFSCA',
      versionDate: 'Consolidated to 2026',
      totalChapters: 5,
      totalProvisions: 25,
      status: 'Live & Verified',
      category: 'Banking & NBFCs / GIFT IFSC',
      featured: false
    },
    {
      slug: 'ifsca-registration-insurance-business-2021',
      id: 'ifsca-registration-insurance-business-2021',
      title: 'IFSCA (Registration of Insurance Business) Regulations, 2021',
      short_name: 'IFSCA Insurance Business 2021',
      regulator: 'IFSCA',
      versionDate: 'Consolidated to 2026',
      totalChapters: 6,
      totalProvisions: 32,
      status: 'Live & Verified',
      category: 'Insurance / GIFT IFSC',
      featured: false
    },
    {
      slug: 'ifsca-pension-fund-2026',
      id: 'ifsca-pension-fund-2026',
      title: 'IFSCA (Pension Fund) Regulations, 2026',
      short_name: 'IFSCA Pension Fund 2026',
      regulator: 'IFSCA',
      versionDate: 'Notified 2026',
      totalChapters: 9,
      totalProvisions: 48,
      status: 'Live & Verified',
      category: 'Pension & Retirement / GIFT IFSC',
      featured: false
    },
    {
      slug: 'ifsca-mga-2026',
      id: 'ifsca-mga-2026',
      title: 'IFSCA (Managing General Agents) Regulations, 2026',
      short_name: 'IFSCA MGA 2026',
      regulator: 'IFSCA',
      versionDate: 'Notified 2026',
      totalChapters: 6,
      totalProvisions: 38,
      status: 'Live & Verified',
      category: 'Insurance Intermediaries / GIFT IFSC',
      featured: false
    },
    {
      slug: 'companies-act-2013',
      id: 'companies-act-2013',
      title: 'Companies Act, 2013',
      short_name: 'Companies Act 2013',
      regulator: 'Ministry of Corporate Affairs (MCA)',
      versionDate: 'Consolidated up to 2026',
      totalChapters: 29,
      totalProvisions: 470,
      status: 'Live & Verified',
      category: 'Corporate Law',
      featured: false
    },
    {
      slug: 'sebi-aif-2012',
      id: 'sebi-aif-2012',
      title: 'SEBI (Alternative Investment Funds) Regulations, 2012',
      short_name: 'SEBI AIF 2012',
      regulator: 'SEBI',
      versionDate: 'Amended up to 2026',
      totalChapters: 6,
      totalProvisions: 35,
      status: 'Live & Verified',
      category: 'Securities & Capital Markets',
      featured: false
    },
    {
      slug: 'sebi-lodr-2015',
      id: 'sebi-lodr-2015',
      title: 'SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015',
      short_name: 'SEBI LODR 2015',
      regulator: 'SEBI',
      versionDate: 'Amended up to 2026',
      totalChapters: 12,
      totalProvisions: 104,
      status: 'Live & Verified',
      category: 'Listed Companies',
      featured: false
    }
  ];
}

/**
 * Loads and normalizes a regulation by slug synchronously or asynchronously.
 */
export async function getRegulationBySlug(rawSlug) {
  const slug = normalizeRegulationSlug(rawSlug);
  const act = ACTS_DATA[slug];
  if (!act) return null;

  const actTitle = act.title || act.shortTitle || slug;
  const commencement = act.commencement_date || act.versionDate || '';

  const normalizedChapters = (act.chapters || []).map((ch, idx) => {
    const rawChapStr = String(ch.romanNum || ch.num || idx + 1);
    const chapNorm = normalizeChapterId(rawChapStr);
    const sectionsList = ch.sections || ch.provisions || [];

    const provisions = sectionsList.map(s => normalizeProvisionObject(s, actTitle, commencement));

    return {
      chapter_id: chapNorm.roman || String(ch.num || idx + 1),
      chapter_number: chapNorm.roman || String(ch.num || idx + 1),
      numeric_id: chapNorm.num || (idx + 1),
      title: ch.title || `Chapter ${chapNorm.roman}`,
      provisions
    };
  });

  const rawProvisions = act.rawProvisions && act.rawProvisions.length > 0
    ? act.rawProvisions.map(p => normalizeProvisionObject(p, actTitle, commencement))
    : normalizedChapters.flatMap(c => c.provisions);

  return {
    id: slug,
    slug: slug,
    title: actTitle,
    short_title: act.shortTitle || actTitle,
    regulator: act.regulator || 'International Financial Services Centres Authority (IFSCA)',
    versionDate: act.versionDate || 'Current & Consolidated',
    notification_number: act.notification_number || '',
    notification_date: act.notification_date || '',
    commencement_date: commencement,
    totalChapters: normalizedChapters.length,
    chapters: normalizedChapters,
    rawProvisions,
    definitions: getActDefinitions(slug) || act.definitions || [],
    schedules: getActSchedules(slug) || act.schedules || []
  };
}

/**
 * Robust Centralized Content Resolver.
 * Resolves a specific regulatory provision across all instruments, chapters, and numbering formats.
 *
 * @param {Object} params
 * @param {string} params.regulationSlug - E.g., 'ifsca-listing-2024', 'ifsca-cmi-2025', 'fme'
 * @param {string|number} [params.chapter] - E.g., 'I', 'chapter-1', 1, 'Chapter IV'
 * @param {string|number} [params.provisionNumber] - E.g., '1', 'reg-4', 12
 * @returns {Promise<{ regulation: Object, chapter: Object, provision: Object } | null>}
 */
export async function resolveProvision({ regulationSlug, chapter, provisionNumber }) {
  const regulation = await getRegulationBySlug(regulationSlug);
  if (!regulation || !regulation.chapters || regulation.chapters.length === 0) {
    return null;
  }

  const cleanProvNum = normalizeProvisionNumber(provisionNumber || '1');
  const chapNorm = chapter ? normalizeChapterId(chapter) : null;

  let targetChapter = null;
  let targetProvision = null;

  // 1. Try finding by matching chapter first
  if (chapNorm) {
    targetChapter = regulation.chapters.find(c =>
      String(c.chapter_id).toUpperCase() === chapNorm.roman ||
      String(c.chapter_number).toUpperCase() === chapNorm.roman ||
      c.numeric_id === chapNorm.num ||
      String(c.chapter_id) === String(chapNorm.raw)
    );

    if (targetChapter) {
      targetProvision = targetChapter.provisions.find(p => String(p.number) === cleanProvNum);
    }
  }

  // 2. If provision not found in specified chapter, scan all chapters (provision number identity)
  if (!targetProvision) {
    for (const ch of regulation.chapters) {
      const found = ch.provisions.find(p => String(p.number) === cleanProvNum);
      if (found) {
        targetProvision = found;
        targetChapter = ch;
        break;
      }
    }
  }

  // 3. If still not found, fallback to first provision of target chapter or first provision of regulation
  if (!targetChapter) {
    targetChapter = regulation.chapters[0];
  }
  if (!targetProvision && targetChapter && targetChapter.provisions.length > 0) {
    targetProvision = targetChapter.provisions[0];
  }

  return {
    regulation,
    chapter: targetChapter,
    provision: targetProvision
  };
}
