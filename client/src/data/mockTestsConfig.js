// client/src/data/mockTestsConfig.js
/**
 * ─── CANONICAL MOCK TESTS CONFIGURATION (SINGLE SOURCE OF TRUTH) ─────────────
 * Authoritative specification for all 5 full-length regulatory mock tests.
 */

export const CANONICAL_MOCK_TESTS = [
  {
    id: 'fme-mock-test',
    courseId: 'ifsca-fme',
    courseSlug: 'ifsca-fme',
    course: 'IFSCA Fund Management',
    title: 'IFSCA (Fund Management) Regulations, 2025 — Full Length Mock Test',
    shortTitle: 'IFSCA FME Full Length Mock Test',
    track: 'RegReady — FME / Fund Management',
    slug: 'fme-full-length-mock-test',
    route: '/practice/mock-tests/fme-full-length-mock-test',
    questionCount: 100,
    durationMinutes: 90,
    accessType: '2 Free Questions • Full Simulation with Pass',
    badge: 'IFSCA FME 2025',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'Complete 100-question computer-based mock exam covering AIF Concepts & Structures, Retail Schemes, and the IFSCA Regulatory Framework.',
    marking: 'Negative Marking (−0.25)',
    passBenchmarkPct: 70,
    sku: 'REGREADY_FME_001',
    priceInr: 499,
  },
  {
    id: 'cmi-mock-test',
    courseId: 'ifsca-cmi',
    courseSlug: 'ifsca-cmi',
    course: 'IFSCA Capital Market Intermediaries',
    title: 'IFSCA CMI Regulations — Full Length Mock Test',
    shortTitle: 'IFSCA CMI Full Length Mock Test',
    track: 'RegReady — CMI / Capital Market Intermediaries',
    slug: 'cmi-full-length-mock-test',
    route: '/practice/mock-tests/cmi-full-length-mock-test',
    questionCount: 100,
    durationMinutes: 90,
    accessType: '2 Free Questions • Full Simulation with Pass',
    badge: 'IFSCA CMI 2025',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    desc: 'Simulated 100-question timed examination covering CMI registration categories, fit-and-proper criteria, conduct of business, and governance.',
    marking: 'Negative Marking (−0.25)',
    passBenchmarkPct: 50,
    sku: 'ifsca-cmi',
    priceInr: 499,
  },
  {
    id: 'sebi-aif-mock-test',
    courseId: 'sebi-aif',
    courseSlug: 'sebi-aif',
    course: 'SEBI Alternative Investment Funds',
    title: 'SEBI (Alternative Investment Funds) Regulations, 2012 — Full Length Mock Test',
    shortTitle: 'SEBI AIF Full Length Mock Test',
    track: 'RegReady — SEBI AIF / Alternative Investment Funds',
    slug: 'sebi-aif-full-length-mock-test',
    route: '/practice/mock-tests/sebi-aif-full-length-mock-test',
    questionCount: 50,
    durationMinutes: 90,
    accessType: '2 Free Questions • Full Simulation with Pass',
    badge: 'SEBI AIF 2012',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    desc: 'Full-length regulatory simulation on Category I, II & III AIFs, Angel Funds, PPM structuring, accredited investors, and regulatory returns.',
    marking: 'Negative Marking (−0.25)',
    passBenchmarkPct: 60,
    sku: 'sebi-aif',
    priceInr: 499,
  },
  {
    id: 'companies-act-mock-test',
    courseId: 'companies-act',
    courseSlug: 'companies-act',
    course: 'Companies Act 2013',
    title: 'Companies Act 2013: Essential Secretarial Compliance — Full Length Mock Test',
    shortTitle: 'Companies Act Full Length Mock Test',
    track: 'RegReady — Corporate Law / MCA 2013',
    slug: 'companies-act-full-length-mock-test',
    route: '/practice/mock-tests/companies-act-full-length-mock-test',
    questionCount: 15,
    durationMinutes: 90,
    accessType: '2 Free Questions • Full Simulation with Pass',
    badge: 'MCA 2013',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    desc: 'Rigorous statutory mock examination on post-incorporation compliances, board meetings, director disqualifications, SS-1/SS-2, and MCA V3 filings.',
    marking: 'Negative Marking (−0.25)',
    passBenchmarkPct: 60,
    sku: 'companies-act',
    priceInr: 499,
  },
  {
    id: 'sebi-lodr-mock-test',
    courseId: 'sebi-lodr',
    courseSlug: 'sebi-lodr',
    course: 'SEBI LODR 2015',
    title: 'SEBI (Listing Obligations and Disclosure Requirements) 2015 — Full Length Mock Test',
    shortTitle: 'SEBI LODR Full Length Mock Test',
    track: 'RegReady — Capital Markets / SEBI LODR',
    slug: 'sebi-lodr-full-length-mock-test',
    route: '/practice/mock-tests/sebi-lodr-full-length-mock-test',
    questionCount: 12,
    durationMinutes: 90,
    accessType: '2 Free Questions • Full Simulation with Pass',
    badge: 'SEBI LODR 2015',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    desc: 'Comprehensive compliance simulation covering corporate governance, independent director thresholds, audit committee mandates, RPTs, and event disclosures.',
    marking: 'Negative Marking (−0.25)',
    passBenchmarkPct: 60,
    sku: 'sebi-lodr',
    priceInr: 499,
  }
];

export const MOCK_TEST_ALIASES = {
  'fme': 'fme-full-length-mock-test',
  'fme-mock-test': 'fme-full-length-mock-test',
  'ifsca-fme': 'fme-full-length-mock-test',
  'fme-full-length-mock-test': 'fme-full-length-mock-test',

  'cmi': 'cmi-full-length-mock-test',
  'cmi-mock-test': 'cmi-full-length-mock-test',
  'ifsca-cmi': 'cmi-full-length-mock-test',
  'cmi-full-length-mock-test': 'cmi-full-length-mock-test',

  'sebi-aif': 'sebi-aif-full-length-mock-test',
  'aif': 'sebi-aif-full-length-mock-test',
  'aif-mock-test': 'sebi-aif-full-length-mock-test',
  'sebi-aif-full-length-mock-test': 'sebi-aif-full-length-mock-test',

  'companies-act': 'companies-act-full-length-mock-test',
  'mca': 'companies-act-full-length-mock-test',
  'ca-mock-test': 'companies-act-full-length-mock-test',
  'companies-act-full-length-mock-test': 'companies-act-full-length-mock-test',

  'sebi-lodr': 'sebi-lodr-full-length-mock-test',
  'lodr': 'sebi-lodr-full-length-mock-test',
  'lodr-mock-test': 'sebi-lodr-full-length-mock-test',
  'sebi-lodr-full-length-mock-test': 'sebi-lodr-full-length-mock-test'
};

export function getCanonicalMockTest(slug) {
  if (!slug) return null;
  const canonicalSlug = MOCK_TEST_ALIASES[slug.toLowerCase().trim()];
  if (!canonicalSlug) return null;
  return CANONICAL_MOCK_TESTS.find(t => t.slug === canonicalSlug) || null;
}

export function isValidMockTestSlug(slug) {
  if (!slug) return false;
  return Boolean(MOCK_TEST_ALIASES[slug.toLowerCase().trim()]);
}
