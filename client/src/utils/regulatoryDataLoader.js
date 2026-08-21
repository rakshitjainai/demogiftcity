import { ACTS_DATA, getActDefinitions, getActSchedules } from '../data/regulationsData';

let cachedCmiData = null;

/**
 * Loads and parses the runtime IFSCA CMI 2025 JSON dataset from client/public/data/regulatory/
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
 * Normalizes the raw IFSCA CMI dataset into standardized Act/Chapter/Provision objects
 */
function normalizeCmiDataset(raw) {
  const instrument = raw.instrument || {
    instrument_id: 'ifsca-cmi-2025',
    regulation_id: 'IFSCA-CMI-2025',
    name: 'International Financial Services Centres Authority (Capital Market Intermediaries) Regulations, 2025',
    short_name: 'IFSCA (Capital Market Intermediaries) Regulations, 2025',
    regulator: 'International Financial Services Centres Authority (IFSCA)',
    notification_date: '2025-04-11',
    commencement_date: '2025-04-16',
    version: 'As amended up to 12 January 2026',
    chapters: 6,
    provisions: 47,
    schedule_rows: 3
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

    const chapObj = chaptersMap.get(chapKey);
    chapObj.provisions.push({
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
      related_provisions: p.related_provisions ? String(p.related_provisions).split(',').map(s => s.trim()) : [],
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
 * Retrieves all available statutory and regulatory instruments in RegLens
 */
export async function getAllRegulations() {
  const cmi = await loadIfscaCmiData();

  const baseList = [
    {
      slug: 'ifsca-cmi-2025',
      id: 'ifsca-cmi-2025',
      title: 'IFSCA (Capital Market Intermediaries) Regulations, 2025',
      short_name: 'IFSCA CMI 2025',
      regulator: 'IFSCA',
      versionDate: 'Consolidated to 12 Jan 2026',
      totalChapters: cmi ? cmi.chapters.length : 6,
      totalProvisions: cmi ? cmi.rawProvisions.length : 50,
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
      versionDate: 'Notified 11 April 2025',
      totalChapters: 7,
      totalProvisions: 42,
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

  return baseList;
}

/**
 * Retrieves a specific act by slug, checking runtime JSON first
 */
export async function getRegulationBySlug(slug) {
  if (slug === 'ifsca-cmi-2025' || slug === 'ifsca-cmi' || slug === 'cmi') {
    const cmi = await loadIfscaCmiData();
    if (cmi) return cmi;
  }

  // Fallback to regulationsData.js ACTS_DATA
  const act = ACTS_DATA[slug];
  if (!act) return null;

  return {
    id: slug,
    slug: slug,
    title: act.title,
    short_title: act.title,
    regulator: act.regulator || 'Regulatory Authority',
    versionDate: act.versionDate || 'Current',
    totalChapters: act.totalChapters || act.chapters?.length || 0,
    chapters: (act.chapters || []).map((ch, idx) => ({
      chapter_id: String(ch.num || idx + 1),
      chapter_number: String(ch.num || idx + 1),
      title: ch.title,
      provisions: (ch.sections || []).map((s) => ({
        provision_id: String(s.num),
        number: String(s.num),
        heading: s.title,
        text: s.content || s.text || '',
        simple_explanation: s.summary || s.simple_explanation || '',
        practical_point: s.practical_point || '',
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
