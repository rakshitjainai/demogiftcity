import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const shortcodeReplacements = [
  {
    tags: [/&#91;ifsca_cmi_quiz&#93;|&#91;ifsca_cmi_quiz\]|\[ifsca_cmi_quiz\]|&#91;csater_landing&#93;|\[csater_landing\]|&#91;csater_exam&#93;|\[csater_exam\]/gi],
    replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl text-white shadow-xl border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-400/20 border border-blue-400/40 rounded-full text-[11px] font-bold text-blue-300 uppercase tracking-wider">🧪 RegPractice Knowledge Test</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">IFSCA CMI Regulations Knowledge Test</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Assess your compliance readiness with 100 MCQs, real-time scoring, and instant statutory explanation reports.</p></div><a href="/practice/mock-tests" class="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Take Practice Test →</span></a></div>`
  },
  {
    tags: [/&#91;reglearn_cmi&#93;|&#91;reglearn_cmi\]|\[reglearn_cmi\]/gi],
    replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-forest-deep rounded-3xl text-white shadow-xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-[11px] font-bold text-amber-300 uppercase tracking-wider">✨ RegLearn Interactive Masterclass</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">IFSCA Capital Market Intermediaries (CMI) Regulations, 2025</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Master all 17 chapters, net worth frameworks, fit & proper criteria, and statutory returns with interactive lessons.</p></div><a href="/learn/ifsca-cmi" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Start Interactive Course →</span></a></div>`
  },
  {
    tags: [/&#91;reglearn_aif&#93;|&#91;reglearn_aif\]|\[reglearn_aif\]/gi],
    replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-amber-950 via-slate-900 to-forest-deep rounded-3xl text-white shadow-xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-[11px] font-bold text-amber-300 uppercase tracking-wider">🎓 RegLearn Interactive Course</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">SEBI (Alternative Investment Funds) Regulations, 2012</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Comprehensive 14-chapter course covering Category I, II & III AIFs, Angel Funds, PPM structuring, and accredited investors.</p></div><a href="/learn/sebi-aif" class="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Start AIF Masterclass →</span></a></div>`
  },
  {
    tags: [/&#91;reglearn&#93;|&#91;reglearn\]|\[reglearn\]/gi],
    replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-3xl text-white shadow-xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-400/20 border border-emerald-400/40 rounded-full text-[11px] font-bold text-emerald-300 uppercase tracking-wider">🎓 RegLearn Interactive Platform</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">IFSCA & SEBI Interactive Learning Modules</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Explore interactive regulatory courses with case scenarios, chapter challenges, and certification.</p></div><a href="/learn" class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Explore All Courses →</span></a></div>`
  },
  {
    tags: [/&#91;fme_quiz&#93;|&#91;fme_quiz\]|\[fme_quiz\]|&#91;ifsc_fme_mock_test&#93;|\[ifsc_fme_mock_test\]/gi],
    replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-forest-deep rounded-3xl text-white shadow-xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-400/20 border border-emerald-400/40 rounded-full text-[11px] font-bold text-emerald-300 uppercase tracking-wider">🧪 RegPractice Practitioner Quiz</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">IFSCA FME Regulations Practitioner Test</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Test your knowledge on FME registration thresholds, capital adequacy, and placement memoranda norms.</p></div><a href="/practice/quizzes" class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Take FME Quiz →</span></a></div>`
  },
  {
    tags: [/&#91;ifsca_aml_quiz&#93;|&#91;ifsca_aml_quiz\]|\[ifsca_aml_quiz\]|&#91;amlcft_diagnostic&#93;|\[amlcft_diagnostic\]/gi],
    replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 rounded-3xl text-white shadow-xl border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-400/20 border border-purple-400/40 rounded-full text-[11px] font-bold text-purple-300 uppercase tracking-wider">🛡️ RegTools Compliance Diagnostic</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">AML / CFT Readiness Diagnostic Tool</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Evaluate your entity's Anti-Money Laundering & Combating Financing of Terrorism compliance posture.</p></div><a href="/tools/aml-risk-assessment" class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Launch Diagnostic Tool →</span></a></div>`
  },
  {
    tags: [/&#91;statuteiq_quiz&#93;|&#91;statuteiq_quiz\]|\[statuteiq_quiz\]|&#91;statuteiq_rpt_quiz&#93;|\[statuteiq_rpt_quiz\]/gi],
    replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 rounded-3xl text-white shadow-xl border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-400/20 border border-blue-400/40 rounded-full text-[11px] font-bold text-blue-300 uppercase tracking-wider">📝 Secretarial Standards Quiz</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">Interactive Compliance & Secretarial Test</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Test your grasp of Secretarial Standard-1 (SS-1), Related Party Transactions, and Companies Act compliance.</p></div><a href="/practice/quizzes" class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Start Knowledge Quiz →</span></a></div>`
  },
  {
    tags: [/&#91;fme_diagnostic&#93;|&#91;fme_diagnostic\]|\[fme_diagnostic\]/gi],
    replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-teal-950 via-slate-900 to-forest-deep rounded-3xl text-white shadow-xl border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-400/20 border border-teal-400/40 rounded-full text-[11px] font-bold text-teal-300 uppercase tracking-wider">🔧 RegTools Diagnostic Tool</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">FME Enforcement Readiness Diagnostic</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Identify operational gaps, statutory return deadlines, and enforcement vulnerabilities for GIFT City FMEs.</p></div><a href="/tools/compliance-diagnostic" class="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Run Diagnostic Tool →</span></a></div>`
  },
  {
    tags: [/&#91;ifsc_compliance_calendar&#93;|&#91;ifsc_compliance_calendar\]|\[ifsc_compliance_calendar\]/gi],
    replacement: `<div class="my-8 p-6 sm:p-8 bg-gradient-to-br from-amber-950 via-slate-900 to-forest-deep rounded-3xl text-white shadow-xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 not-prose"><div class="space-y-2 max-w-xl"><div class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-[11px] font-bold text-amber-300 uppercase tracking-wider">📅 RegTools Compliance Calendar</div><h3 class="text-xl sm:text-2xl font-bold font-display text-white">GIFT IFSC Annual Compliance Calendar Builder</h3><p class="text-xs sm:text-sm text-slate-300 leading-relaxed">Customized compliance calendar with officer assignment, evidence logging, and statutory due date alerts.</p></div><a href="/tools/compliance-calendar" class="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"><span>Open Compliance Calendar →</span></a></div>`
  },
  {
    tags: [/&#91;ecl_pillars&#93;|&#91;ecl_keypoints&#93;|&#91;ecl_statband&#93;|&#91;ecl_takeaway&#93;|\[ecl_pillars\]|\[ecl_keypoints\]|\[ecl_statband\]|\[ecl_takeaway\]/gi],
    replacement: `<div class="my-6 p-5 bg-emerald-900/10 border border-emerald-600/30 rounded-2xl text-emerald-950 font-medium text-sm leading-relaxed not-prose flex items-start gap-3"><span class="text-emerald-600 font-bold text-lg">📌</span><div><strong class="font-bold block text-emerald-900 mb-1">Key Statutory Takeaway</strong>Executive guidance and regulatory framework summary for statutory compliance.</div></div>`
  }
];

function processPostsFile(filePath) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    console.error('File not found:', fullPath);
    return;
  }

  const posts = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  let modifiedCount = 0;

  posts.forEach(p => {
    let content = p.content || '';
    let changed = false;

    shortcodeReplacements.forEach(sr => {
      sr.tags.forEach(rgx => {
        if (rgx.test(content)) {
          content = content.replace(rgx, sr.replacement);
          changed = true;
        }
      });
    });

    // Strip residual <pre class="wp-block-code"><code> wrappers around converted div elements
    content = content.replace(/<pre class="wp-block-code"><code>\s*(<div class="my-8[\s\S]*?<\/div>)\s*<\/code><\/pre>/gi, '$1');

    if (changed) {
      p.content = content;
      modifiedCount++;
    }
  });

  fs.writeFileSync(fullPath, JSON.stringify(posts, null, 2));
  console.log(`Processed ${filePath} - Total Posts Sanitized: ${modifiedCount}`);
}

processPostsFile('src/data/posts.json');
processPostsFile('../server/data/wordpress-posts.json');
