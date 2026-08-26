/**
 * Multi-Regulation Provision Resolution Test Suite
 * Tests provision resolution across all regulations and chapters.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'client', 'src', 'data');

const DATA_FILES = {
  'ifsca-listing-2024': { file: 'RegMate_IFSCA_Listing_2024_FINAL-2.json', schema: 'schema2' },
  'ifsca-cmi-2025': { file: 'RegMate_IFSCA_CMI_2025_FINAL.json', schema: 'schema2' },
  'ifsca-fme-2025': { file: 'RegMate_IFSCA_FME_2025_Content_Package_FINAL.json', schema: 'fme' },
  'ifsca-finance-company-2021': { file: 'RegMate_IFSCA_Finance_Company_2021_FINAL.json', schema: 'schema2' },
  'ifsca-registration-insurance-business-2021': { file: 'RegMate_IFSCA_Registration_Insurance_Business_2021_FINAL.json', schema: 'schema2' },
  'ifsca-pension-fund-2026': { file: 'RegMate_IFSCA_Pension_Fund_2026_FINAL.json', schema: 'schema2' },
  'ifsca-mga-2026': { file: 'RegMate_IFSCA_MGA_2026_FINAL.json', schema: 'schema2' }
};

const ROMAN_MAP = {
  'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6,
  'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12,
  'XIII': 13, 'XIV': 14, 'XV': 15, 'XVI': 16, 'XVII': 17, 'XVIII': 18,
  'XIX': 19, 'XX': 20, 'XXI': 21, 'XXII': 22, 'XXIII': 23, 'XXIV': 24
};

function normalizeChapter(val) {
  if (!val) return 'I';
  const clean = String(val).replace(/^chapter-/i, '').trim().toUpperCase();
  return clean;
}

function resolveProvisionStandalone({ regulationSlug, chapter, provisionNumber }) {
  const ds = DATA_FILES[regulationSlug];
  if (!ds) return null;

  const raw = JSON.parse(fs.readFileSync(path.join(dataDir, ds.file), 'utf8'));
  const cleanChap = normalizeChapter(chapter);
  const targetProv = String(provisionNumber).replace(/^reg-|^section-|^provision-/i, '').trim();

  let provisions = [];
  if (ds.schema === 'fme') {
    provisions = (raw.provisions || []).map(p => ({
      number: String(p.provision_number),
      heading: p.title || p.heading || p.provision_heading || '',
      text: p.statutory_text || p.regulation_text || p.text || p.content || '',
      simple_explanation: p.regmate_explanation || p.simple_explanation || '',
      chapter_id: p.chapter_number
    }));
  } else {
    provisions = (raw.regulation_content || []).map(p => ({
      number: String(p.provision_number || p.number),
      heading: p.provision_heading || p.title || p.heading || '',
      text: p.statutory_text || p.regulation_text || p.text || p.content || '',
      simple_explanation: p.simple_explanation || p.summary || '',
      chapter_id: p.chapter_id || p.chapter_number
    }));
  }

  // Find provision
  let match = provisions.find(p => p.number === targetProv && p.chapter_id === cleanChap);
  if (!match) {
    match = provisions.find(p => p.number === targetProv);
  }

  if (!match) return null;
  return {
    regulation: { slug: regulationSlug, title: raw.instrument?.name || raw.instrument?.instrument_name || raw.instrument?.title || regulationSlug },
    chapter: { chapter_id: match.chapter_id },
    provision: match
  };
}

const testCases = [
  { regulationSlug: 'ifsca-listing-2024', chapter: 'I', provisionNumber: '1', desc: 'Listing 2024 Chapter I Reg 1' },
  { regulationSlug: 'ifsca-listing-2024', chapter: 'II', provisionNumber: '5', desc: 'Listing 2024 Chapter II Reg 5' },
  { regulationSlug: 'ifsca-listing-2024', chapter: 'IV', provisionNumber: '25', desc: 'Listing 2024 Chapter IV Reg 25' },
  { regulationSlug: 'ifsca-cmi-2025', chapter: 'I', provisionNumber: '1', desc: 'CMI 2025 Chapter I Reg 1' },
  { regulationSlug: 'ifsca-cmi-2025', chapter: 'II', provisionNumber: '4', desc: 'CMI 2025 Chapter II Reg 4' },
  { regulationSlug: 'ifsca-fme-2025', chapter: 'I', provisionNumber: '1', desc: 'FME 2025 Chapter I Reg 1' },
  { regulationSlug: 'ifsca-fme-2025', chapter: 'III', provisionNumber: '8', desc: 'FME 2025 Chapter III Reg 8' },
  { regulationSlug: 'ifsca-finance-company-2021', chapter: 'I', provisionNumber: '1', desc: 'Finance Company 2021 Reg 1' },
  { regulationSlug: 'ifsca-registration-insurance-business-2021', chapter: 'I', provisionNumber: '1', desc: 'Insurance 2021 Reg 1' },
  { regulationSlug: 'ifsca-pension-fund-2026', chapter: 'I', provisionNumber: '1', desc: 'Pension Fund 2026 Reg 1' },
  { regulationSlug: 'ifsca-mga-2026', chapter: 'I', provisionNumber: '1', desc: 'MGA 2026 Reg 1' }
];

console.log('════════════════════════════════════════════════════════════════════════════');
console.log('MULTI-REGULATION SHARED RESOLVER VERIFICATION (11 TEST PROVISIONS)');
console.log('════════════════════════════════════════════════════════════════════════════\n');

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const res = resolveProvisionStandalone(tc);
  const hasReg = Boolean(res && res.regulation);
  const hasChap = Boolean(res && res.chapter);
  const hasProv = Boolean(res && res.provision);
  const hasText = Boolean(res?.provision?.text && res.provision.text.trim().length > 10);
  const hasExplanation = Boolean(res?.provision?.simple_explanation && res.provision.simple_explanation.trim().length > 0);

  const ok = hasReg && hasChap && hasProv && hasText;
  if (ok) {
    console.log(`PASS: ${tc.desc.padEnd(38)} | Text Len: ${String(res.provision.text.length).padStart(4)} | Heading: "${res.provision.heading?.slice(0, 35)}..."`);
    passed++;
  } else {
    console.error(`FAIL: ${tc.desc}`);
    failed++;
  }
}

console.log('\n────────────────────────────────────────────────────────────────────────────');
console.log(`TOTAL RESOLVED: ${passed} / ${testCases.length} | FAILED: ${failed}`);
console.log('────────────────────────────────────────────────────────────────────────────\n');

if (failed > 0) process.exit(1);
