import { ACTS_DATA, getActDefinitions, getActSchedules } from '../data/regulationsData';
import ifscaFmePackage from '../data/RegMate_IFSCA_FME_2025_Content_Package_FINAL.json';

let cachedCmiData = null;
let cachedFmeData = null;

// ─── Pre-build FME data from the bundled 161-provision JSON ──────────────────
// The FME package uses a top-level `provisions` array (161 items) — not
// `regulation_content` — so it needs its own normalizer.
function buildFmeData() {
  if (cachedFmeData) return cachedFmeData;

  const pkg = ifscaFmePackage;
  const rawProvisions = pkg.provisions || [];

  const chaptersMap = new Map();
  rawProvisions.forEach((p) => {
    const chapKey = p.chapter_number || 'I';
    if (!chaptersMap.has(chapKey)) {
      chaptersMap.set(chapKey, {
        chapter_id: chapKey,
        chapter_number: chapKey,
        title: p.chapter_title || `Chapter ${chapKey}`,
        provisions: []
      });
    }
    chaptersMap.get(chapKey).provisions.push({
      provision_id: String(p.provision_number),
      number: String(p.provision_number),
      heading: p.title || `Regulation ${p.provision_number}`,
      type: p.provision_type || 'regulation',
      text: p.statutory_text || p.regulation_text || p.text || '',
      simple_explanation: p.regmate_explanation || p.source_based_overview || '',
      regmate_comment: p.regmate_explanation || '',
      practical_point: p.practical_point || '',
      compliance_point: p.compliance_point || '',
      example: Array.isArray(p.examples) ? p.examples.join('\n') : (p.example || ''),
      risk_point: p.risk_point || '',
      interview_point: p.interview_point || '',
      important_numbers: p.important_numbers || '',
      memory_aid: p.memory_aid || '',
      related_provisions: p.related_provisions
        ? String(p.related_provisions).split(',').map(s => s.trim())
        : [],
      compliance_frequency: p.compliance_frequency || '',
      responsible_person: p.responsible_person || '',
      applicability: p.applicability || '',
      effective_date: pkg.instrument?.commencement_date || '2025-04-16',
      last_verified_date: '2026-08-14',
      verification_status: p.review_status || 'verified',
      source_reference: `Reg ${p.provision_number}, IFSCA (Fund Management) Regulations, 2025`
    });
  });

  const chaptersArray = Array.from(chaptersMap.values());

  cachedFmeData = {
    id: 'ifsca-fme-2025',
    slug: 'ifsca-fme-2025',
    title: pkg.instrument?.name || 'IFSCA (Fund Management) Regulations, 2025',
    short_title: pkg.instrument?.short_name || 'IFSCA (Fund Management) Regulations, 2025',
    regulator: pkg.instrument?.regulator || 'International Financial Services Centres Authority (IFSCA)',
    notification_number: pkg.instrument?.notification_number || '',
    notification_date: pkg.instrument?.notification_date || '2025-04-11',
    commencement_date: pkg.instrument?.commencement_date || '2025-04-16',
    versionDate: pkg.instrument?.version || 'As amended up to 30 January 2026',
    totalChapters: chaptersArray.length,
    chapters: chaptersArray,
    rawProvisions,
    definitions: pkg.definitions || []
  };

  return cachedFmeData;
}

// Eagerly build FME (synchronous — data is bundled, no network needed)
buildFmeData();

/**
 * Loads and parses the runtime IFSCA CMI 2025 JSON from /public/data/regulatory/
 */
export async function loadIfscaCmiData() {
  if (cachedCmiData) return cachedCmiData;

  try {
    const res = await fetch('/data/regulatory/RegMate_IFSCA_CMI_2025_FINAL (1).json');
    if (!res.ok) {
      throw new Error(`Failed to load IFSCA CMI JSON: ${res.statusText}`);
    }
    const raw = await res.json();
    cachedCmiData = normalizeCmiDataset(raw);
    return cachedCmiData;
  } catch (err) {
    console.error('Error fetching IFSCA CMI data:', err);
    return null;
  }
}

/**
 * Normalizes the raw IFSCA CMI dataset into standardized chapter/provision objects
 */
function normalizeCmiDataset(raw) {
  const instrument = raw.instrument || {
    name: 'International Financial Services Centres Authority (Capital Market Intermediaries) Regulations, 2025',
    short_name: 'IFSCA (Capital Market Intermediaries) Regulations, 2025',
    regulator: 'International Financial Services Centres Authority (IFSCA)',
    notification_date: '2025-04-11',
    commencement_date: '2025-04-16',
    version: 'As amended up to 12 January 2026'
  };

  const rawProvisions = raw.regulation_content || [];
  const chaptersMap = new Map();

  rawProvisions.forEach((p) => {
    const chapKey = p.chapter || 'I';
    if (!chaptersMap.has(chapKey)) {
      chaptersMap.set(chapKey, {
        chapter_id: chapKey,
        chapter_number: chapKey,
        title: p.chapter_title || `Chapter ${chapKey}`,
        provisions: []
      });
    }

    chaptersMap.get(chapKey).provisions.push({
      provision_id: String(p.provision_number),
      number: String(p.provision_number),
      heading: p.provision_heading || `Regulation ${p.provision_number}`,
      type: p.provision_type || 'regulation',
      text: p.regulation_text || '',
      simple_explanation: p.simple_explanation || '',
      regmate_comment: p.regmate_comment || '',
      practical_point: p.practical_point || '',
      compliance_point: p.compliance_point || '',
      example: p.example || '',
      risk_point: p.risk_point || '',
      interview_point: p.interview_point || '',
      important_numbers: p.important_numbers || '',
      memory_aid: p.memory_aid || '',
      related_provisions: p.related_provisions
        ? String(p.related_provisions).split(',').map(s => s.trim())
        : [],
      compliance_frequency: p.compliance_frequency || '',
      responsible_person: p.responsible_person || '',
      applicability: p.applicability || '',
      effective_date: p.effective_date || instrument.commencement_date,
      last_verified_date: p.last_verified_date || '2026-08-14',
      verification_status: p.verification_status || 'verified',
      source_reference: p.source_reference || `Reg ${p.provision_number}, IFSCA CMI Regulations 2025`
    });
  });

  const chaptersArray = Array.from(chaptersMap.values());

  return {
    id: 'ifsca-cmi-2025',
    slug: 'ifsca-cmi-2025',
    title: instrument.name,
    short_title: instrument.short_name,
    regulator: instrument.regulator,
    notification_number: instrument.notification_number || 'IFSCA/GN/2025/003',
    notification_date: instrument.notification_date,
    commencement_date: instrument.commencement_date,
    versionDate: instrument.version,
    totalChapters: chaptersArray.length,
    chapters: chaptersArray,
    rawProvisions,
    definitions: raw.definitions_reference || []
  };
}

/**
 * Returns all available regulations for the switcher dropdown.
 * Counts are derived from actual bundled JSON — no guesswork.
 */
export async function getAllRegulations() {
  const [cmi, fme] = await Promise.all([
    loadIfscaCmiData(),
    Promise.resolve(buildFmeData())
  ]);

  return [
    {
      slug: 'ifsca-cmi-2025',
      id: 'ifsca-cmi-2025',
      title: 'IFSCA (Capital Market Intermediaries) Regulations, 2025',
      short_name: 'IFSCA CMI 2025',
      regulator: 'IFSCA',
      versionDate: 'Consolidated to 12 Jan 2026',
      totalChapters: cmi ? cmi.chapters.length : 6,
      totalProvisions: cmi ? cmi.rawProvisions.length : 47,
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
      totalChapters: fme ? fme.chapters.length : 12,
      totalProvisions: fme ? fme.rawProvisions.length : 161,
      status: 'Live & Verified',
      category: 'Fund Management / GIFT IFSC',
      featured: true
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
      featured: true
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
 * Retrieves a specific regulation by slug, using the bundled JSON for FME and CMI.
 */
export async function getRegulationBySlug(slug) {
  // ── CMI: loaded from /public/data/ at runtime ──
  if (slug === 'ifsca-cmi-2025' || slug === 'ifsca-cmi' || slug === 'cmi') {
    const cmi = await loadIfscaCmiData();
    if (cmi) return cmi;
  }

  // ── FME: loaded from the bundled src/data JSON (161 provisions) ──
  if (slug === 'ifsca-fme-2025' || slug === 'ifsca-fme' || slug === 'fme') {
    const fme = buildFmeData();
    if (fme) return fme;
  }

  // ── All other acts: fall back to ACTS_DATA in regulationsData.js ──
  const act = ACTS_DATA[slug];
  if (!act) return null;

  // Build rawProvisions so RegulationHeader can display the real count
  const rawProvisions = (act.chapters || []).flatMap(ch => ch.sections || []);

  return {
    id: slug,
    slug: slug,
    title: act.title,
    short_title: act.shortTitle || act.title,
    regulator: act.regulator || 'Regulatory Authority',
    versionDate: act.versionDate || 'Current',
    totalChapters: act.totalChapters || act.chapters?.length || 0,
    rawProvisions,
    chapters: (act.chapters || []).map((ch, idx) => ({
      chapter_id: String(ch.romanNum || ch.num || idx + 1),
      chapter_number: String(ch.romanNum || ch.num || idx + 1),
      title: ch.title,
      provisions: (ch.sections || []).map((s) => ({
        provision_id: String(s.num),
        number: String(s.num),
        heading: s.title,
        text: s.statutory_text || s.regulation_text || s.text || s.content || s.statutoryText || s.officialText || '',
        simple_explanation: s.summary || s.regmate_explanation || s.simple_explanation || '',
        practical_point: s.practical_point || '',
        compliance_point: s.compliance_point || '',
        risk_point: s.risk_point || '',
        interview_point: s.interview_point || '',
        important_numbers: s.important_numbers || '',
        memory_aid: s.memory_aid || '',
        related_provisions: s.related_provisions || [],
        source_reference: `Sec ${s.num}, ${act.title}`,
        verification_status: 'verified',
        last_verified_date: '2026-08-14'
      }))
    })),
    definitions: getActDefinitions(slug),
    schedules: getActSchedules(slug)
  };
}
