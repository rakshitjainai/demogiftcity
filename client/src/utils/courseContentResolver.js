import coursesData from '../data/courses.json' with { type: 'json' };

/**
 * ─── Canonical Course Slug & ID Normalizer ──────────────────────────────────
 * Maps any variant (slug, route param, code, query alias) to its canonical identifier.
 */
export function normalizeCourseSlug(rawId) {
  if (!rawId) return null;
  const clean = String(rawId).toLowerCase().trim();

  // Companies Act 2013 mappings
  if (['companies-act', 'companies-act-2013', 'mca-ca2013', 'ca2013', 'mca', 'mod-companies', 'companies'].includes(clean)) {
    return 'companies-act';
  }

  // IFSCA CMI mappings
  if (['ifsca-cmi', 'ifsca-cmi-2025', 'cmi', 'cmi-2025', 'mod-ifsca-cmi', 'ifsca_cmi'].includes(clean)) {
    return 'ifsca-cmi';
  }

  // IFSCA FME mappings
  if (['ifsca-fme', 'ifsca-fme-2025', 'fme', 'fme-2025', 'fme-regulations', 'mod-ifsca-fme', 'ifsca_fme'].includes(clean)) {
    return 'ifsca-fme';
  }

  // SEBI AIF mappings
  if (['sebi-aif', 'sebi-aif-2012', 'sebi_aif', 'aif', 'mod-sebi-aif'].includes(clean)) {
    return 'sebi-aif';
  }

  // SEBI LODR mappings
  if (['sebi-lodr', 'sebi-lodr-2015', 'sebi_lodr', 'lodr', 'mod-lodr'].includes(clean)) {
    return 'sebi-lodr';
  }

  return clean;
}

/**
 * Normalizes card structures safely
 */
function normalizeCards(cards) {
  if (!cards) return [];
  if (Array.isArray(cards)) return cards;
  if (typeof cards === 'string') {
    return cards.split('||').map((rawCard, idx) => {
      const cardStr = rawCard.trim();
      if (!cardStr) return null;
      const parts = cardStr.split('|').map(p => p.trim());
      let title = '';
      let law = '';
      let means = '';
      let watch = '';
      let tag = `Point ${idx + 1}`;

      parts.forEach(part => {
        const u = part.toUpperCase();
        if (u.startsWith('LAW')) law = part.replace(/^LAW\s*:?/i, '').trim();
        else if (u.startsWith('PLAIN')) means = part.replace(/^PLAIN\s*:?/i, '').trim();
        else if (u.startsWith('WATCH')) watch = part.replace(/^WATCH\s*:?/i, '').trim();
        else if (u.startsWith('TITLE')) title = part.replace(/^TITLE\s*:?/i, '').trim();
        else if (u.startsWith('TAG')) tag = part.replace(/^TAG\s*:?/i, '').trim();
        else if (!law) law = part;
      });

      return { tag, title: title || tag, law, means, watch };
    }).filter(Boolean);
  }
  return [];
}

// ─── Companies Act 2013 Curriculum Package ──────────────────────────────────
const COMPANIES_ACT_CHAPTERS = [
  {
    id: 'ca_ch_1',
    chapterNo: 1,
    title: 'Post-Incorporation Compliances & Bank Account Setup',
    band: 'Core Statutory Mandate',
    sourceRef: 'Section 10A, Companies Act, 2013 & Rule 23A of Companies (Incorporation) Rules, 2014',
    understandBody: 'Following incorporation under the SPICe+ framework, a company must open a current bank account and ensure all subscribers credit their agreed share capital. Under Section 10A, a company cannot commence any business or exercise borrowing powers until the directors file Form INC-20A within 180 days with verification of paid-up capital and registered office.',
    understandCalloutTitle: 'WHY THIS MATTERS',
    understandCalloutBody: 'Failure to file Form INC-20A within 180 days leads to a company penalty of ₹50,000, ₹1,000/day on officers in default, automated flagging as "Non-Active" in MCA V3, and potential strike-off proceedings by the ROC under Section 248.',
    walkthroughBody: '1. Receive Certificate of Incorporation and PAN/TAN.\n2. Open corporate current bank account using Board resolution and constitutional documents.\n3. Subscribers deposit initial share capital via traceable banking channels.\n4. Directors execute digital declaration in Form INC-20A with bank statement attachment.\n5. Obtain ROC approval before executing contracts or loans.',
    walkthroughCalloutTitle: 'PRACTITIONER WATCHOUT',
    walkthroughCalloutBody: 'Do not enter into borrowing agreements or commercial leases prior to INC-20A certification. The ROC actively cross-verifies bank statement credit dates against incorporation dates.',
    practiceQuestion: 'Within how many days from the date of incorporation must a company with share capital file Form INC-20A (Declaration of Commencement of Business)?',
    practiceOptions: [
      'Option A: Within 30 days',
      'Option B: Within 60 days',
      'Option C: Within 90 days',
      'Option D: Within 180 days'
    ],
    practiceAnswer: 3,
    practiceExplain: 'Section 10A(1)(a) of the Companies Act, 2013 stipulates that Form INC-20A must be filed with the ROC within 180 days from the date of incorporation.',
    rememberBody: '180 days statutory clock for Form INC-20A; banking proof of subscriber capital is mandatory; non-filing freezes borrowing powers and risks Section 248 strike-off.',
    rememberComplianceTip: 'Prioritize opening the corporate bank account in Week 1 to avoid last-minute INC-20A delays.'
  },
  {
    id: 'ca_ch_2',
    chapterNo: 2,
    title: 'First Board Meeting & Secretarial Standard-1 (SS-1)',
    band: 'Corporate Governance',
    sourceRef: 'Section 173(1), Companies Act, 2013 & ICSI Secretarial Standard-1 (SS-1)',
    understandBody: 'Every newly incorporated company must hold its first Board Meeting within 30 days of incorporation in accordance with Section 173(1) and SS-1. Core agenda items include noting the Certificate of Incorporation, appointment of first statutory auditor, disclosure of director interests in Form MBP-1, adoption of common seal (if any), and approval of bank account signatories.',
    understandCalloutTitle: 'STATUTORY REQUIREMENT',
    understandCalloutBody: 'Notice of the meeting must be given in writing at least 7 days in advance to every director at their registered address, unless shorter notice is approved with at least one Independent Director (or majority) present.',
    walkthroughBody: '1. Issue formal notice and agenda with serial numbering 7 days prior.\n2. Collect signed Form MBP-1 (general disclosure of interest) and DIR-2 from all directors.\n3. Pass formal resolutions approving bank operations, preliminary expenses, and auditor appointment.\n4. Draft and circulate draft minutes within 15 days; finalize and sign within 30 days in the permanent Minutes Book.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'Maintaining signed physical or electronically secured minutes under SS-1 is a mandatory legal record strictly inspected during due diligence and MCA audits.',
    practiceQuestion: 'Under Section 173(1), within what timeframe must every newly incorporated company hold its first Board of Directors meeting?',
    practiceOptions: [
      'Option A: Within 15 days of incorporation',
      'Option B: Within 30 days of incorporation',
      'Option C: Within 45 days of incorporation',
      'Option D: Within 60 days of incorporation'
    ],
    practiceAnswer: 1,
    practiceExplain: 'Section 173(1) mandates that every company shall hold the first meeting of the Board of Directors within thirty days of the date of its incorporation.',
    rememberBody: 'First Board Meeting within 30 days; 7 days written notice required; collect Form MBP-1 disclosures; record and sign minutes within 30 days permanently.',
    rememberComplianceTip: 'Ensure MBP-1 forms are collected from every director at the very first meeting to prevent Section 184 non-disclosure liabilities.'
  },
  {
    id: 'ca_ch_3',
    chapterNo: 3,
    title: 'Appointment of First Statutory Auditor (Form ADT-1)',
    band: 'Statutory Audit & Reporting',
    sourceRef: 'Section 139(6), Companies Act, 2013 & Rule 4(2) of Companies (Audit and Auditors) Rules, 2014',
    understandBody: 'Under Section 139(6), the Board of Directors must appoint the first statutory auditor of a non-government company within 30 days of incorporation. If the Board fails to do so, it must inform the members, who shall appoint the auditor within 90 days at an Extraordinary General Meeting (EGM). The auditor holds office until the conclusion of the first AGM.',
    understandCalloutTitle: 'WHY THIS MATTERS',
    understandCalloutBody: 'The auditor must be a Chartered Accountant in practice or audit firm eligible under Section 141. The company must obtain written consent and a certificate of eligibility confirming compliance with statutory ceiling limits before appointment.',
    walkthroughBody: '1. Obtain written consent letter and eligibility certificate under Section 141 from proposed CA firm.\n2. Convene Board Meeting within 30 days and pass resolution appointing the auditor.\n3. File Form ADT-1 with the ROC within 15 days of appointment with consent letter and Board resolution.\n4. Auditor prepares audited financials for the first financial year adopted at the 1st AGM.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'While Section 139(6) does not explicitly penalize non-filing of ADT-1 for first auditors in some circulars, filing ADT-1 on MCA V3 is standard industry best practice to ensure unambiguous audit credentials on public records.',
    practiceQuestion: 'If the Board of Directors fails to appoint the first statutory auditor within 30 days of incorporation, within how many days must members appoint the auditor at an EGM?',
    practiceOptions: [
      'Option A: Within 30 days',
      'Option B: Within 60 days',
      'Option C: Within 90 days',
      'Option D: Within 120 days'
    ],
    practiceAnswer: 2,
    practiceExplain: 'Section 139(6) provides that if the Board fails to appoint the first auditor within 30 days, members of the company shall appoint within 90 days at an EGM.',
    rememberBody: 'Board appoints first auditor in 30 days; members in 90 days if Board fails; auditor tenure runs until conclusion of 1st AGM; obtain Section 141 eligibility certificate.',
    rememberComplianceTip: 'Always obtain the CA firm’s peer review certificate and Section 141 ceiling certificate before passing the Board resolution.'
  },
  {
    id: 'ca_ch_4',
    chapterNo: 4,
    title: 'Share Certificate Issuance & State Stamp Duty',
    band: 'Capital & Shareholding',
    sourceRef: 'Section 56(4), Companies Act, 2013 & Indian Stamp Act, 1899',
    understandBody: 'Under Section 56(4), every company must deliver share certificates to all subscribers within 60 days of incorporation. Certificates in Form SH-1 must be signed by two directors (and CS if appointed) and sealed. In addition, state stamp duty on share allotment must be paid within 30 days of certificate issuance (e.g. online through the SHCIL / e-stamping portal).',
    understandCalloutTitle: 'CRITICAL COMPLIANCE RISK',
    understandCalloutBody: 'Non-payment of stamp duty on share certificates is one of the most common diligence defects. Unstamped certificates are inadmissible in legal proceedings and attract penalties up to 10 times the original duty.',
    walkthroughBody: '1. Prepare Form SH-1 share certificates with distinctive numbers and folio numbers.\n2. Affix signatures of two directors and company secretary (or authorized signatory).\n3. Update Register of Members in Form MGT-1 and Share Certificate Register.\n4. Calculate state-specific stamp duty on total issue value.\n5. Pay stamp duty via SHCIL / Revenue Authority within 30 days and preserve receipt.',
    walkthroughCalloutTitle: 'PRACTITIONER WATCHOUT',
    walkthroughCalloutBody: 'In states like Maharashtra and Delhi, stamp duty payment on share certificates is entirely digitized. Ensure the challan and certificate stamping date align precisely.',
    practiceQuestion: 'Under Section 56(4)(a), within what maximum timeframe must share certificates be delivered to subscribers from the date of incorporation?',
    practiceOptions: [
      'Option A: Within 30 days',
      'Option B: Within 60 days',
      'Option C: Within 90 days',
      'Option D: Within 180 days'
    ],
    practiceAnswer: 1,
    practiceExplain: 'Section 56(4)(a) mandates delivery of share certificates to subscribers within 2 months (60 days) from the date of incorporation.',
    rememberBody: '60 days to issue share certificates (Form SH-1); 30 days to pay state stamp duty; update MGT-1 register; unstamped certificates attract 10x penalty.',
    rememberComplianceTip: 'Issue share certificates immediately following receipt of subscriber funds to ensure timely stamping.'
  },
  {
    id: 'ca_ch_5',
    chapterNo: 5,
    title: 'Director Disqualifications, DIN & Annual DIR-3 KYC',
    band: 'Director Governance',
    sourceRef: 'Section 164(2), Section 167 & Rule 12A of Companies (Appointment and Qualification of Directors) Rules, 2014',
    understandBody: 'Directors must maintain an active Director Identification Number (DIN) and complete mandatory annual DIR-3 KYC (or DIR-3 KYC-WEB) by 30th September each year. Section 164(2) disqualifies a director for 5 years across all companies if any company on whose board they serve fails to file financial statements or annual returns for 3 consecutive financial years.',
    understandCalloutTitle: 'STATUTORY CONSEQUENCE',
    understandCalloutBody: 'Under Section 167(1)(a), a disqualification under Section 164(2) results in automatic vacation of the office of director in all other companies where the individual holds directorships.',
    walkthroughBody: '1. Track annual DIN KYC deadlines (30th September annually).\n2. File DIR-3 KYC with OTP verification of director mobile and personal email.\n3. If DIN is deactivated, pay ₹5,000 late fee to reactivate.\n4. Verify annual filing status of all peer directorships to prevent Section 164(2) spillover disqualification.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'A deactivated DIN prevents the digital signature token from signing any MCA V3 form, halting all corporate ROC filings for that company.',
    practiceQuestion: 'Under Section 164(2)(a), what continuous period of default in filing financial statements or annual returns triggers a 5-year director disqualification?',
    practiceOptions: [
      'Option A: 1 financial year',
      'Option B: 2 consecutive financial years',
      'Option C: 3 consecutive financial years',
      'Option D: 5 consecutive financial years'
    ],
    practiceAnswer: 2,
    practiceExplain: 'Section 164(2)(a) provides that failure to file financial statements or annual returns for any continuous period of 3 financial years results in disqualification for 5 years.',
    rememberBody: 'DIR-3 KYC due by 30 September yearly; 3 years non-filing triggers 5-year disqualification under Sec 164(2); DIN deactivation locks all MCA filings.',
    rememberComplianceTip: 'Perform a quarterly DIN audit for all board members to ensure active compliance across external entities.'
  },
  {
    id: 'ca_ch_6',
    chapterNo: 6,
    title: 'Related Party Transactions & Approvals (Section 188)',
    band: 'Corporate Compliance',
    sourceRef: 'Section 188 & Section 177, Companies Act, 2013 & Rule 15 of Companies (Meetings of Board and its Powers) Rules, 2014',
    understandBody: 'Contracts with related parties (directors, relatives, KMP, holding/subsidiary entities) for sale of goods, property, leasing, or professional services require prior Board approval. Transactions exceeding statutory prescribed thresholds require prior Ordinary Resolution in General Meeting. Transactions entered in the ordinary course of business on an arm\'s length basis are fully exempt from Section 188(1) approval.',
    understandCalloutTitle: 'EXEMPTION TEST',
    understandCalloutBody: 'To claim the ordinary course & arm\'s length exemption, the company must possess documented benchmarking, third-party pricing quotes, and demonstrable business custom.',
    walkthroughBody: '1. Identify related parties per Section 2(76) and maintain MBP-4 register.\n2. Audit Committee reviews and grants prior approval or omnibus approval under Section 177.\n3. If not at arm\'s length, present to Board; interested directors must recuse themselves from voting.\n4. If value exceeds 10% of turnover/net worth thresholds, seek shareholder approval by Ordinary Resolution.\n5. Disclose all RPTs in Board\'s Report (Form AOC-2) and notes to accounts.',
    walkthroughCalloutTitle: 'PRACTITIONER WATCHOUT',
    walkthroughCalloutBody: 'Interested shareholders cannot vote on Section 188 resolutions in general meetings (except in private companies where 90%+ members are relatives).',
    practiceQuestion: 'Which of the following related party contracts is EXEMPT from Board and General Meeting approval under Section 188(1)?',
    practiceOptions: [
      'Option A: Contracts with unlisted subsidiaries',
      'Option B: Transactions entered in ordinary course of business on an arm\'s length basis',
      'Option C: Any transaction valued below ₹50 Lakhs',
      'Option D: Contracts approved verbally by the Managing Director'
    ],
    practiceAnswer: 1,
    practiceExplain: 'Section 188(1) fourth proviso explicitly states that nothing in this sub-section shall apply to any transactions entered into by the company in its ordinary course of business other than transactions which are not on an arm’s length basis.',
    rememberBody: 'Section 188 covers sale, purchase, leasing, and services with related parties; arm\'s length + ordinary course is exempt; interested directors cannot vote; disclose in AOC-2.',
    rememberComplianceTip: 'Maintain contemporaneous transfer pricing and market quotes to substantiate the arm\'s length defense.'
  },
  {
    id: 'ca_ch_7',
    chapterNo: 7,
    title: 'Board Meetings, Quorum & Video Conferencing',
    band: 'Corporate Governance',
    sourceRef: 'Section 173, Section 174 & Rule 3 of Companies (Meetings of Board and its Powers) Rules, 2014',
    understandBody: 'Companies must hold at least 4 Board meetings every year with a maximum gap of 120 days between two consecutive meetings. Quorum for a Board meeting is 1/3rd of total strength or 2 directors, whichever is higher. Participation through video conferencing is fully recognized provided roll call, audio-visual recording, and security procedures under Rule 3 are complied with.',
    understandCalloutTitle: 'SMALL COMPANY EXEMPTION',
    understandCalloutBody: 'One Person Companies (OPC), Small Companies, and Startups need to hold only 1 Board meeting in each half of a calendar year with a minimum gap of 90 days between meetings.',
    walkthroughBody: '1. Prepare annual Board calendar ensuring max 120-day interval.\n2. Issue 7-day written notice with agenda notes.\n3. Verify quorum (minimum 2 directors or 1/3rd) at commencement and throughout the meeting.\n4. Record attendance and roll call for video conference attendees.\n5. Circulate draft minutes within 15 days; finalize and sign within 30 days.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'Interested directors are not counted towards quorum for that specific agenda item unless the company is a private company and the director discloses interest under Section 184.',
    practiceQuestion: 'What is the maximum permissible time gap between two consecutive Board Meetings under Section 173(1)?',
    practiceOptions: [
      'Option A: 60 days',
      'Option B: 90 days',
      'Option C: 120 days',
      'Option D: 180 days'
    ],
    practiceAnswer: 2,
    practiceExplain: 'Section 173(1) mandates that not more than one hundred and twenty (120) days shall intervene between two consecutive meetings of the Board.',
    rememberBody: 'Minimum 4 Board meetings per year; maximum 120-day gap; quorum is 1/3rd or 2 directors; video conferencing requires audio-visual recording and roll call.',
    rememberComplianceTip: 'Lock board meeting dates at the beginning of each calendar quarter to guarantee compliance with the 120-day limit.'
  },
  {
    id: 'ca_ch_8',
    chapterNo: 8,
    title: 'General Meetings & Secretarial Standard-2 (SS-2)',
    band: 'Shareholder Relations',
    sourceRef: 'Section 96, Section 100, Section 101, Companies Act, 2013 & ICSI Secretarial Standard-2 (SS-2)',
    understandBody: 'Every company must hold an Annual General Meeting (AGM) each year. The 1st AGM must be held within 9 months from the close of the first financial year; subsequent AGMs must be held within 6 months from FY close with max 15 months between AGMs. A General Meeting requires at least 21 clear days\' notice in writing or by electronic mode unless shorter notice is approved by 95% of entitled members.',
    understandCalloutTitle: 'CORE COMPLIANCE RULE',
    understandCalloutBody: 'Every notice of general meeting setting out special business must annex an explanatory statement under Section 102 disclosing material facts, director interests, and rationale.',
    walkthroughBody: '1. Board approves draft notice, Directors\' Report, and audited financial statements.\n2. Issue 21 clear days\' notice (excluding day of dispatch and meeting day, +48h for post).\n3. Convene AGM, verify shareholder quorum, and conduct voting (show of hands or e-voting/poll).\n4. Record and enter minutes in the General Meeting Minutes Book within 30 days.\n5. File adopted financials (AOC-4) within 30 days and Annual Return (MGT-7/7A) within 60 days.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'AGMs must be called during business hours (9 a.m. to 6 p.m.) on any day that is not a National Holiday, at the registered office or within the same city/town.',
    practiceQuestion: 'What is the statutory notice period required for calling an Annual General Meeting under Section 101(1)?',
    practiceOptions: [
      'Option A: 7 clear days',
      'Option B: 14 clear days',
      'Option C: 21 clear days',
      'Option D: 30 clear days'
    ],
    practiceAnswer: 2,
    practiceExplain: 'Section 101(1) requires that a general meeting of a company may be called by giving not less than clear twenty-one days’ notice either in writing or through electronic mode.',
    rememberBody: 'AGM within 6 months of FY end; 21 clear days notice; Section 102 explanatory statement required for special business; file AOC-4 in 30 days and MGT-7 in 60 days.',
    rememberComplianceTip: 'Calculate "clear days" strictly by omitting the date of notice service, date of meeting, and 48 hours for dispatch.'
  },
  {
    id: 'ca_ch_9',
    chapterNo: 9,
    title: 'Loans to Directors & Inter-Corporate Investments (Sec 185/186)',
    band: 'Financial Regulation',
    sourceRef: 'Section 185 & Section 186, Companies Act, 2013 & Companies (Meetings of Board and its Powers) Rules, 2014',
    understandBody: 'Section 185 prohibits loans, guarantees, or security to directors or their interested entities (with exceptions for loans to MD/WTD per service conditions and special resolution approval for entities where director is interested). Section 186 regulates inter-corporate loans, investments, and guarantees, capping them at 60% of paid-up capital + free reserves + securities premium or 100% of free reserves + securities premium, whichever is more. Exceeding this limit requires prior Special Resolution.',
    understandCalloutTitle: 'STATUTORY REGISTER',
    understandCalloutBody: 'Every company making loans, investments, or giving guarantees must maintain a permanent Register in Form MBP-2 and disclose complete particulars in financial statements.',
    walkthroughBody: '1. Review proposed transaction against Section 185 prohibitions.\n2. Compute aggregate limits under Section 186(2) against latest audited balance sheet.\n3. If within limits, obtain unanimous consent of all directors present at Board Meeting.\n4. If exceeding limits, convene General Meeting to pass Special Resolution.\n5. Ensure interest rate is not lower than prevailing yield of 1, 3, 5, or 10-year Government security.\n6. Enter details in Form MBP-2 within 7 days.',
    walkthroughCalloutTitle: 'PRACTITIONER WATCHOUT',
    walkthroughCalloutBody: 'No loan or investment can be made by a company that is in default of paying interest or principal on public deposits under Section 186(8).',
    practiceQuestion: 'What is the ceiling threshold under Section 186(2) beyond which inter-corporate loans and investments require prior approval by Special Resolution?',
    practiceOptions: [
      'Option A: 50% of paid up capital',
      'Option B: 60% of paid-up capital + free reserves + securities premium (or 100% of free reserves + securities premium)',
      'Option C: 75% of total net worth',
      'Option D: 100% of annual turnover'
    ],
    practiceAnswer: 1,
    practiceExplain: 'Section 186(2) provides that no company shall directly or indirectly give loan/investment exceeding 60% of paid-up share capital, free reserves and securities premium, or 100% of free reserves and securities premium, whichever is higher, without Special Resolution.',
    rememberBody: 'Section 185 restricts loans to directors; Section 186 caps inter-corporate loans at 60%/100% threshold; unanimous Board approval required; maintain MBP-2 register.',
    rememberComplianceTip: 'Never execute inter-corporate loans without an interest rate pegged at or above the corresponding Government Security yield.'
  },
  {
    id: 'ca_ch_10',
    chapterNo: 10,
    title: 'Acceptance of Deposits & Annual Form DPT-3',
    band: 'Statutory Compliance',
    sourceRef: 'Section 73 to 76, Companies Act, 2013 & Companies (Acceptance of Deposits) Rules, 2014',
    understandBody: 'Private companies are prohibited from accepting public deposits but may accept deposits from members up to 100% of paid-up capital and free reserves (or unlimited for eligible startups for 10 years). Under Rule 16/16A, EVERY company (except government entities) must file annual Form DPT-3 on or before 30th June for deposits as well as all receipts not considered as deposits (e.g. director loans, vendor advances, bank borrowings).',
    understandCalloutTitle: 'UNIVERSAL FILING MANDATE',
    understandCalloutBody: 'Even companies with ZERO public deposits must file Form DPT-3 under the "Receipt of money not considered as deposit" category annually.',
    walkthroughBody: '1. Extract outstanding balances of loans, advances, credit facilities, and director advances as on 31st March.\n2. Obtain director declaration that loans were not funded from borrowed funds.\n3. Classify receipts under Rule 2(1)(c) (exempted categories).\n4. Complete and digitally sign Form DPT-3 with statutory auditor certificate (if required).\n5. File with ROC on or before 30th June annually.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'Director loans are only exempt from deposit definitions if the director submits a written declaration confirming the money was from their personal funds.',
    practiceQuestion: 'What is the mandatory annual deadline for filing Form DPT-3 (Return of Deposits / Particulars of Transactions not considered as Deposit) with the ROC?',
    practiceOptions: [
      'Option A: 30th April',
      'Option B: 30th June',
      'Option C: 30th September',
      'Option D: 30th October'
    ],
    practiceAnswer: 1,
    practiceExplain: 'Rule 16 of Companies (Acceptance of Deposits) Rules mandates that Form DPT-3 must be filed on or before the 30th day of June every year with information as on 31st March.',
    rememberBody: 'Form DPT-3 due by 30th June annually; covers all outstanding loans and advances; director declaration required for personal funds; non-filing attracts ₹5,000 + ₹500/day fine.',
    rememberComplianceTip: 'Collect written source-of-funds declarations from directors simultaneously with each loan advance.'
  },
  {
    id: 'ca_ch_11',
    chapterNo: 11,
    title: 'Annual Filings: Form AOC-4 & Financial Statements',
    band: 'Financial Reporting',
    sourceRef: 'Section 137, Companies Act, 2013 & Rule 12 of Companies (Accounts) Rules, 2014',
    understandBody: 'Under Section 137, every company must file its adopted financial statements (Balance Sheet, Statement of Profit & Loss, Cash Flow Statement, Notes to Accounts, and Board\'s Report) with the ROC in Form AOC-4 within 30 days of the AGM. Listed companies and companies with paid-up capital of ₹5 Cr+ or turnover of ₹100 Cr+ must file in AOC-4 XBRL format.',
    understandCalloutTitle: 'PER-DAY LATE PENALTY',
    understandCalloutBody: 'Under Section 403, delayed filing of Form AOC-4 incurs an additional statutory fee of ₹100 per day of delay without any upper ceiling.',
    walkthroughBody: '1. Board approves draft financials and signs Board\'s Report per Section 134.\n2. Statutory auditor issues Independent Auditor\'s Report with CARO (where applicable).\n3. Members adopt financials at AGM.\n4. Prepare Form AOC-4 / AOC-4 XBRL with all attachments (Directors\' Report, AOC-1, AOC-2, Auditor Report).\n5. File with ROC within 30 days of AGM.',
    walkthroughCalloutTitle: 'PRACTITIONER WATCHOUT',
    walkthroughCalloutBody: 'If the AGM is not held, financial statements along with reasons for not holding the AGM must still be filed within 30 days of the latest date the AGM should have been held.',
    practiceQuestion: 'Within how many days from the date of the AGM must Form AOC-4 (Financial Statements) be filed with the ROC?',
    practiceOptions: [
      'Option A: Within 15 days',
      'Option B: Within 30 days',
      'Option C: Within 60 days',
      'Option D: Within 90 days'
    ],
    practiceAnswer: 1,
    practiceExplain: 'Section 137(1) requires that financial statements adopted at the AGM shall be filed with the Registrar within thirty days of the date of the annual general meeting.',
    rememberBody: 'AOC-4 due within 30 days of AGM; ₹100/day late fee with no upper cap; attach Board\'s Report, AOC-1, and Auditor\'s Report; XBRL for large entities.',
    rememberComplianceTip: 'Finalize financial statements and audit clearance at least 3 weeks before the AGM to ensure unhurried AOC-4 filing.'
  },
  {
    id: 'ca_ch_12',
    chapterNo: 12,
    title: 'Annual Return: Form MGT-7 & MGT-7A',
    band: 'Secretarial Reporting',
    sourceRef: 'Section 92, Section 88, Companies Act, 2013 & Companies (Management and Administration) Rules, 2014',
    understandBody: 'Every company must file its Annual Return in Form MGT-7 (or Form MGT-7A for Small Companies and OPCs) with the ROC within 60 days of the AGM. The Annual Return details the registered office, principal business activities, shareholding pattern, indebtedness, members, debenture holders, promoters, directors, and KMP remuneration.',
    understandCalloutTitle: 'CS CERTIFICATION MANDATE',
    understandCalloutBody: 'For listed companies and companies having paid-up capital of ₹10 Cr+ or turnover of ₹50 Cr+, the Annual Return must be certified by a Practicing Company Secretary (PCS) in Form MGT-8.',
    walkthroughBody: '1. Collate closing register of members (MGT-1), share transfers, and board attendance records as of 31st March.\n2. Reconcile share capital and indebtedness with audited balance sheet.\n3. For small companies/OPCs, complete simplified Form MGT-7A signed by director.\n4. For standard companies, obtain PCS certification where required.\n5. File on MCA V3 within 60 days of AGM.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'Ensure shareholding percentages in MGT-7 reconcile 100% with the Foreign Liabilities and Assets (FLA) return and BEN-2 SBO filings.',
    practiceQuestion: 'What is the statutory deadline for filing the Annual Return (Form MGT-7/MGT-7A) with the ROC following the AGM?',
    practiceOptions: [
      'Option A: Within 30 days',
      'Option B: Within 45 days',
      'Option C: Within 60 days',
      'Option D: Within 90 days'
    ],
    practiceAnswer: 2,
    practiceExplain: 'Section 92(4) mandates that every company shall file its Annual Return in Form MGT-7/MGT-7A within sixty days from the date on which the annual general meeting is held.',
    rememberBody: 'MGT-7 due within 60 days of AGM; MGT-7A for small companies and OPCs; MGT-8 PCS certification for ₹10 Cr+ capital; ₹100/day late fee applies.',
    rememberComplianceTip: 'Keep MGT-1 member register continuously updated after every board allotment or transfer to avoid year-end bottlenecks.'
  },
  {
    id: 'ca_ch_13',
    chapterNo: 13,
    title: 'Significant Beneficial Ownership (SBO - Section 90 & BEN-2)',
    band: 'Transparency & Anti-Money Laundering',
    sourceRef: 'Section 90, Companies Act, 2013 & Companies (Significant Beneficial Owners) Rules, 2018',
    understandBody: 'Section 90 requires companies to identify Significant Beneficial Owners (SBOs) — individuals holding directly or indirectly 10%+ shares, voting rights, distributable dividends, or exercising significant influence/control. SBOs must declare their interest in Form BEN-1, and the company must file Form BEN-2 with the ROC within 30 days of receiving the declaration.',
    understandCalloutTitle: 'CRITICAL OBLIGATION',
    understandCalloutBody: 'Companies have a positive statutory duty to give notice in Form BEN-4 to any person/member suspected of being an SBO. Failure to identify SBOs attracts hefty company penalties and NCLT action.',
    walkthroughBody: '1. Screen non-individual shareholders (corporate bodies, trusts, partnerships).\n2. Trace natural persons holding ultimate ownership or control of 10%+.\n3. Issue notice in Form BEN-4 to non-individual shareholders.\n4. Receive declaration in Form BEN-1 from the SBO within 30 days.\n5. File Form BEN-2 with the ROC within 30 days and maintain Register in Form BEN-3.',
    walkthroughCalloutTitle: 'PRACTITIONER WATCHOUT',
    walkthroughCalloutBody: 'If a shareholder fails to respond to Form BEN-4, the company must apply to the NCLT within 15 days for an order directing restrictions on transfer or dividend rights on those shares.',
    practiceQuestion: 'What is the threshold of indirect/direct shareholding or voting rights that defines a Significant Beneficial Owner (SBO) under Rule 2(1)(h)?',
    practiceOptions: [
      'Option A: 5% or more',
      'Option B: 10% or more',
      'Option C: 25% or more',
      'Option D: 51% or more'
    ],
    practiceAnswer: 1,
    practiceExplain: 'Rule 2(1)(h) defines an SBO as an individual who, acting alone or together through one or more persons/trusts, possesses not less than 10 per cent of shares, voting rights, or distributable dividends.',
    rememberBody: '10% threshold defines an SBO; SBO files BEN-1; company files BEN-2 within 30 days; maintain BEN-3 register; issue BEN-4 inquiry notices to corporate shareholders.',
    rememberComplianceTip: 'Perform SBO screening immediately whenever a corporate shareholder or foreign holding entity is incorporated into the cap table.'
  },
  {
    id: 'ca_ch_14',
    chapterNo: 14,
    title: 'FEMA & Foreign Investment Post-Incorporation Compliances',
    band: 'Cross-Border Regulation',
    sourceRef: 'Foreign Exchange Management Act, 1999 & FEMA (Non-Debt Instruments) Rules, 2019',
    understandBody: 'When a company issues shares to non-resident subscribers or receives Foreign Direct Investment (FDI), it must comply with FEMA reporting. Form FC-GPR must be filed on the RBI FIRMS portal within 30 days of allotment, supported by a CS Certificate, KYC from the Authorised Dealer Bank, and a Valuation Certificate (DCF method). Additionally, every company with FDI must file the annual FLA Return by 15th July.',
    understandCalloutTitle: 'MANDATORY CS CERTIFICATION',
    understandCalloutBody: 'Form FC-GPR requires a mandatory Certificate from a Practicing Company Secretary certifying that all provisions of the Companies Act, sectoral FDI caps, and pricing guidelines have been satisfied.',
    walkthroughBody: '1. Inward remittance received via AD Category-I Bank; bank issues Foreign Inward Remittance Certificate (FIRC) and KYC.\n2. Board allots shares within 60 days of remittance.\n3. Obtain valuation certificate from Chartered Accountant / Merchant Banker.\n4. Obtain CS Compliance Certificate.\n5. File Form FC-GPR on the RBI FIRMS/SMF portal within 30 days of allotment.\n6. File annual Foreign Liabilities and Assets (FLA) Return on the RBI FLAIR portal by 15th July.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'Delayed FEMA filings are not curable by simple ROC condonation — they require formal compounding proceedings before the Reserve Bank of India.',
    practiceQuestion: 'Within how many days from the date of allotment of equity shares to a foreign investor must Form FC-GPR be filed on the RBI FIRMS portal?',
    practiceOptions: [
      'Option A: Within 15 days',
      'Option B: Within 30 days',
      'Option C: Within 60 days',
      'Option D: Within 90 days'
    ],
    practiceAnswer: 1,
    practiceExplain: 'Under FEMA NDI Rules, Form FC-GPR must be filed with the Reserve Bank of India through the FIRMS portal within 30 days from the date of allotment of shares.',
    rememberBody: 'Form FC-GPR due within 30 days of allotment; CS certificate and valuation mandatory; annual FLA Return by 15th July; non-compliance triggers RBI compounding.',
    rememberComplianceTip: 'Allot shares within 60 days of receiving inward remittance to prevent violation of Section 42 private placement rules.'
  },
  {
    id: 'ca_ch_15',
    chapterNo: 15,
    title: 'Corporate Social Responsibility (CSR - Section 135)',
    band: 'Corporate Sustainability',
    sourceRef: 'Section 135, Companies Act, 2013 & Companies (CSR Policy) Rules, 2014',
    understandBody: 'Section 135 applies to every company having Net Worth of ₹500 Cr+, Turnover of ₹1,000 Cr+, or Net Profit of ₹5 Cr+ in the immediately preceding financial year. Qualifying companies must constitute a CSR Committee and spend at least 2% of their average net profits over the preceding 3 financial years on Schedule VII CSR activities. Unspent amounts relating to ongoing projects must be transferred to a dedicated Unspent CSR Account within 30 days of FY close.',
    understandCalloutTitle: 'STATUTORY PENALTY FOR DEFAULT',
    understandCalloutBody: 'Failure to transfer unspent CSR funds attracts a company penalty of up to ₹1 Crore (or twice the unspent amount) and 1/10th of the unspent amount on every officer in default.',
    walkthroughBody: '1. Compute net profit under Section 198 for preceding 3 financial years.\n2. Determine 2% statutory minimum spending target.\n3. Formulate and approve CSR Policy and annual action plan through the CSR Committee.\n4. Execute activities directly or through registered implementing agencies (Form CSR-1).\n5. Unspent funds for ongoing projects transferred to "Unspent CSR Account" within 30 days; other unspent funds to Schedule VII Fund within 6 months.\n6. Disclose CSR Annual Report in Form CSR-2 and Board\'s Report.',
    walkthroughCalloutTitle: 'PRACTITIONER WATCHOUT',
    walkthroughCalloutBody: 'CSR Committee constitution is not mandatory if the annual CSR obligation does not exceed ₹50 Lakhs; the Board may discharge committee functions directly.',
    practiceQuestion: 'Which of the following is an eligibility trigger for mandatory CSR compliance under Section 135(1) of the Companies Act, 2013?',
    practiceOptions: [
      'Option A: Net Profit of ₹1 Crore or more',
      'Option B: Net Profit of ₹5 Crores or more',
      'Option C: Turnover of ₹100 Crores or more',
      'Option D: Paid-up Capital of ₹50 Crores or more'
    ],
    practiceAnswer: 1,
    practiceExplain: 'Section 135(1) applies to any company having Net Worth of ₹500 Cr or more, or Turnover of ₹1,000 Cr or more, or Net Profit of ₹5 Cr or more in the immediately preceding financial year.',
    rememberBody: 'CSR triggers at ₹500 Cr NW / ₹1,000 Cr Turnover / ₹5 Cr Net Profit; 2% spend of 3-year average net profit; transfer unspent project funds in 30 days; file Form CSR-2.',
    rememberComplianceTip: 'Ensure all partner NGOs hold valid Form CSR-1 registration and 80G/12A certificates before disbursing CSR grants.'
  }
];

// ─── SEBI LODR Curriculum Package ───────────────────────────────────────────
const SEBI_LODR_CHAPTERS = [
  {
    id: 'lodr_ch_1',
    chapterNo: 1,
    title: 'Board Composition & Independent Directors',
    band: 'Corporate Governance',
    sourceRef: 'Regulation 17 & 17A, SEBI (LODR) Regulations, 2015',
    understandBody: 'Regulation 17 mandates an optimum combination of executive and non-executive directors, with at least 50% non-executive directors and at least one woman director (an independent woman director for top 1000 listed entities). If the chairperson is executive or promoter-related, at least 50% of the board must comprise independent directors.',
    understandCalloutTitle: 'WHY THIS MATTERS',
    understandCalloutBody: 'Defects in board composition trigger automatic fines under SEBI SOP circulars (₹2,000 to ₹10,000 per day of default), freezing of promoter shareholding, and notice from stock exchanges.',
    walkthroughBody: '1. Review board composition against top 500/1000/2000 market cap thresholds.\n2. Ensure required ratio of Independent Directors (1/3rd or 1/2).\n3. Maintain maximum directorship limits under Reg 17A (max 7 listed entities; max 3 listed entities if serving as whole-time director).\n4. Obtain annual independence declarations under Reg 25(8).',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'Casual vacancies of Independent Directors must be filled by the Board at the earliest and not later than 3 months or the immediate next Board meeting.',
    practiceQuestion: 'Under Regulation 17(1)(b), what proportion of the Board must comprise Independent Directors if the Chairperson is a promoter or executive director?',
    practiceOptions: [
      'Option A: At least 1/4th of the Board',
      'Option B: At least 1/3rd of the Board',
      'Option C: At least 1/2 (50%) of the Board',
      'Option D: At least 2/3rds of the Board'
    ],
    practiceAnswer: 2,
    practiceExplain: 'Regulation 17(1)(b) mandates that where the chairperson of the board of directors is a promoter or an executive director, at least half (50%) of the board of directors shall consist of independent directors.',
    rememberBody: 'At least 50% non-executive directors; independent woman director for top 1000; 50% independent directors if chairperson is executive/promoter; max 7 listed directorships.',
    rememberComplianceTip: 'Monitor board vacancies dynamically to ensure replacement appointments occur well within the 3-month window.'
  },
  {
    id: 'lodr_ch_2',
    chapterNo: 2,
    title: 'Audit Committee Mandates & Composition',
    band: 'Governance & Oversight',
    sourceRef: 'Regulation 18, SEBI (LODR) Regulations, 2015',
    understandBody: 'Every listed entity must constitute a qualified Audit Committee consisting of a minimum of 3 directors, with at least 2/3rds being independent directors. All members must be financially literate and at least one member must have accounting or related financial management expertise. The chairperson must be an independent director and present at the AGM.',
    understandCalloutTitle: 'CORE POWERS',
    understandCalloutBody: 'The Audit Committee has mandatory oversight of financial reporting, statutory and internal auditor appointments, internal control evaluation, and prior review of all Related Party Transactions (RPTs).',
    walkthroughBody: '1. Verify 2/3rd independent director majority and financial literacy of all members.\n2. Hold at least 4 meetings a year with a maximum gap of 120 days.\n3. Quorum is 2 members or 1/3rd (whichever is greater), with minimum 2 independent directors present.\n4. Audit Committee reviews quarterly and annual financial statements prior to Board submission.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'Only independent members of the Audit Committee can approve Related Party Transactions and omnibus approvals.',
    practiceQuestion: 'What is the minimum proportion of Independent Directors required on the Audit Committee of a listed entity under Regulation 18(1)(b)?',
    practiceOptions: [
      'Option A: At least 1/3rd',
      'Option B: At least 1/2',
      'Option C: At least 2/3rds',
      'Option D: 100% Independent Directors'
    ],
    practiceAnswer: 2,
    practiceExplain: 'Regulation 18(1)(b) provides that at least two-thirds of the members of audit committee shall be independent directors.',
    rememberBody: 'Minimum 3 directors; 2/3rds independent; chairperson must be independent; at least 4 meetings/year; review all financial results and RPTs.',
    rememberComplianceTip: 'Ensure the Company Secretary acts as the secretary to the Audit Committee per Regulation 18(1)(e).'
  },
  {
    id: 'lodr_ch_3',
    chapterNo: 3,
    title: 'Related Party Transactions Framework (Regulation 23)',
    band: 'Corporate Compliance',
    sourceRef: 'Regulation 23, SEBI (LODR) Regulations, 2015',
    understandBody: 'Regulation 23 mandates a comprehensive RPT policy. All RPTs and subsequent material modifications require prior approval of the Audit Committee (with only independent members voting). Material RPTs (exceeding ₹1,000 Cr or 10% of annual consolidated turnover) require prior approval of shareholders by Ordinary Resolution where related parties cannot vote.',
    understandCalloutTitle: 'DISCLOSURE MANDATE',
    understandCalloutBody: 'Listed entities must submit RPT disclosures in the prescribed format to stock exchanges every 6 months within 15 days from publication of standalone and consolidated financial results.',
    walkthroughBody: '1. Maintain a master database of all related parties per Indian Accounting Standards (Ind AS 24) and Section 2(76).\n2. Formulate Audit Committee omnibus approval policy with ₹1 Cr per transaction cap for unforeseen items.\n3. Benchmark all contracts for arm\'s length validity.\n4. If threshold exceeds ₹1,000 Cr or 10% turnover, seek prior shareholder approval.\n5. Publish semi-annual RPT disclosures on stock exchange and company website.',
    walkthroughCalloutTitle: 'PRACTITIONER WATCHOUT',
    walkthroughCalloutBody: 'SEBI\'s amended definition of related parties includes any person holding 10%+ equity shares (directly or indirectly) in the listed entity.',
    practiceQuestion: 'Under Regulation 23, what threshold defines a "Material Related Party Transaction" requiring prior shareholder approval?',
    practiceOptions: [
      'Option A: Value exceeding ₹100 Crores',
      'Option B: Value exceeding ₹500 Crores or 5% of turnover',
      'Option C: Value exceeding ₹1,000 Crores or 10% of annual consolidated turnover',
      'Option D: Value exceeding 20% of net worth'
    ],
    practiceAnswer: 2,
    practiceExplain: 'Regulation 23(1) provides that a transaction with a related party shall be considered material if it exceeds ₹1,000 crore or 10 per cent of the annual consolidated turnover of the listed entity, whichever is lower.',
    rememberBody: 'Audit Committee (independent members only) prior approval; material RPT threshold is ₹1,000 Cr or 10% turnover; shareholder ordinary resolution required; 6-month exchange filings.',
    rememberComplianceTip: 'Review the omnibus approval utilization at every quarterly Audit Committee meeting.'
  },
  {
    id: 'lodr_ch_4',
    chapterNo: 4,
    title: 'Prior Intimations & Closure of Trading Window',
    band: 'Continuous Disclosure',
    sourceRef: 'Regulation 29, SEBI (LODR) Regulations, 2015 & SEBI (PIT) Regulations, 2015',
    understandBody: 'Listed entities must provide prior intimation to stock exchanges for Board meetings considering financial results (at least 5 clear days in advance, excluding date of intimation and meeting) and other corporate actions such as buybacks, dividends, capital alteration, or fundraising (at least 2 working days in advance). Trading window under PIT closes from the end of the quarter until 48 hours after financial results become public.',
    understandCalloutTitle: 'WHY THIS MATTERS',
    understandCalloutBody: 'Failure to give timely prior intimation leads to stock exchange fines and potential insider trading investigations by SEBI under the PIT framework.',
    walkthroughBody: '1. Calculate exact 5 clear days window for financial results board meeting intimation.\n2. Issue formal exchange notice and publish on company website.\n3. Issue Trading Window Closure notice to all designated persons effective from end of quarter.\n4. Re-open trading window exactly 48 hours after financial results are published on stock exchanges.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'Intimation of dividend recommendation must specify the record date or book closure dates in accordance with Regulation 42.',
    practiceQuestion: 'Under Regulation 29(2), how many clear days of prior intimation must be given to stock exchanges for a Board meeting considering financial results?',
    practiceOptions: [
      'Option A: At least 2 working days',
      'Option B: At least 3 clear days',
      'Option C: At least 5 clear days',
      'Option D: At least 7 clear days'
    ],
    practiceAnswer: 2,
    practiceExplain: 'Regulation 29(2) mandates that prior intimation for financial results board meetings shall be given at least 5 clear days in advance (excluding the date of the intimation and date of the meeting).',
    rememberBody: '5 clear days notice for financial results; 2 working days for dividends/fundraising; trading window closed from quarter-end until 48h post-results.',
    rememberComplianceTip: 'Send the prior intimation simultaneously to all stock exchanges where the company’s securities are listed.'
  },
  {
    id: 'lodr_ch_5',
    chapterNo: 5,
    title: 'Disclosure of Material Events & Information (Regulation 30)',
    band: 'Market Integrity',
    sourceRef: 'Regulation 30 & Schedule III, SEBI (LODR) Regulations, 2015',
    understandBody: 'Regulation 30 requires listed entities to disclose all material events to stock exchanges. Part A events are deemed material without any materiality threshold (e.g. acquisitions, scheme of arrangement, fraud/defaults, KMP changes within 24h, or board decisions within 30 min of meeting closure). Part B events apply a quantitative materiality threshold (2% of turnover, 2% of net worth, or 5% of 3-year average profit/loss).',
    understandCalloutTitle: 'TIME-CRITICAL FILING',
    understandCalloutBody: 'Board meeting outcomes (dividends, financial results, fund raising) must be disclosed within 30 minutes of the closure of the Board meeting.',
    walkthroughBody: '1. Establish Board-approved Policy on Determination of Materiality.\n2. Authorize KMPs (MD, CFO, CS) to determine materiality and make disclosures.\n3. Disclose Part A events within 12 hours (if emanating from internal decision) or 24 hours (external events).\n4. Verify quantitative thresholds for civil litigations, tax disputes, and commercial contracts under Part B.\n5. Respond to market rumors within 24 hours when confirmed by exchange queries.',
    walkthroughCalloutTitle: 'PRACTITIONER WATCHOUT',
    walkthroughCalloutBody: 'Top 100 listed entities (extended to top 250) must confirm, deny, or clarify market rumors reported in mainstream media within 24 hours.',
    practiceQuestion: 'Within what timeframe must the outcome of a Board Meeting considering dividends or financial results be disclosed to stock exchanges under Regulation 30(6)?',
    practiceOptions: [
      'Option A: Within 30 minutes of closure of the meeting',
      'Option B: Within 2 hours of closure of the meeting',
      'Option C: Within 12 hours of closure of the meeting',
      'Option D: Within 24 hours of closure of the meeting'
    ],
    practiceAnswer: 0,
    practiceExplain: 'Regulation 30(6) requires that the listed entity shall disclose the outcome of the Board meeting within thirty (30) minutes of the closure of the meeting.',
    rememberBody: 'Part A events deemed material; 30-min window for board outcomes; quantitative test: 2% turnover / 2% NW / 5% profit; rumor verification within 24h.',
    rememberComplianceTip: 'Pre-draft standard outcome disclosure templates before the Board meeting begins.'
  },
  {
    id: 'lodr_ch_6',
    chapterNo: 6,
    title: 'Financial Results & Limited Review Reports (Reg 33)',
    band: 'Periodic Disclosures',
    sourceRef: 'Regulation 33, SEBI (LODR) Regulations, 2015',
    understandBody: 'Listed entities must submit quarterly and year-to-date standalone (and consolidated) financial results to stock exchanges within 45 days of the end of each quarter. For the final quarter, annual audited results must be submitted within 60 days of financial year end. Quarterly results must be accompanied by a Limited Review Report (LRR) by statutory auditors.',
    understandCalloutTitle: 'CEO/CFO CERTIFICATION',
    understandCalloutBody: 'The Chief Executive Officer and Chief Financial Officer must give a joint certification to the Board confirming that the financial statements present a true and fair view and contain no misleading statements.',
    walkthroughBody: '1. Audit Committee reviews financial results and recommends to Board.\n2. Board of Directors approves and signs financials.\n3. Statutory auditors issue Limited Review Report or Audit Report.\n4. Submit to stock exchanges within 30 minutes of board meeting and publish in 1 English national daily + 1 regional language newspaper within 48 hours.\n5. Upload to company website simultaneously.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'If modified audit opinions exist, Statement on Impact of Audit Qualifications must accompany the financial results in prescribed Annexure I.',
    practiceQuestion: 'Within how many days from the end of the quarter must a listed entity submit its quarterly financial results under Regulation 33(3)(a)?',
    practiceOptions: [
      'Option A: Within 15 days',
      'Option B: Within 30 days',
      'Option C: Within 45 days',
      'Option D: Within 60 days'
    ],
    practiceAnswer: 2,
    practiceExplain: 'Regulation 33(3)(a) mandates that quarterly financial results shall be submitted to the stock exchange within 45 days of end of each quarter, other than the last quarter.',
    rememberBody: 'Quarterly results in 45 days; annual results in 60 days; Limited Review Report mandatory; CEO/CFO certification; publish in newspapers within 48h.',
    rememberComplianceTip: 'Coordinate audit sign-off at least 2 days ahead of the 45-day deadline to prevent filing delays.'
  },
  {
    id: 'lodr_ch_7',
    chapterNo: 7,
    title: 'Secretarial Audit & Annual Compliance Report (Reg 24A)',
    band: 'Secretarial Oversight',
    sourceRef: 'Regulation 24A, SEBI (LODR) Regulations, 2015',
    understandBody: 'Every listed entity and its material unlisted subsidiaries must annex a Secretarial Audit Report in Form MR-3 given by a Practicing Company Secretary (PCS) to its annual report. In addition, listed entities must submit an Annual Secretarial Compliance Report (ASCR) issued by a PCS to stock exchanges within 60 days of financial year end.',
    understandCalloutTitle: 'MATERIAL SUBSIDIARY OBLIGATION',
    understandCalloutBody: 'The Secretarial Audit requirement applies equally to material unlisted subsidiaries incorporated in India.',
    walkthroughBody: '1. Board appoints PCS for secretarial audit and secretarial compliance review.\n2. PCS audits compliance across SEBI Act, SCRA, Depositories Act, LODR, and circulars.\n3. PCS issues Annual Secretarial Compliance Report noting observations and actions taken.\n4. File ASCR with stock exchanges within 60 days of FY close.\n5. Annex Form MR-3 to the annual report.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'The ASCR format includes specific columns tracking prior year qualifications and remedial actions taken by management.',
    practiceQuestion: 'Within how many days from the end of the financial year must the Annual Secretarial Compliance Report (ASCR) be submitted to stock exchanges?',
    practiceOptions: [
      'Option A: Within 30 days',
      'Option B: Within 45 days',
      'Option C: Within 60 days',
      'Option D: Within 90 days'
    ],
    practiceAnswer: 2,
    practiceExplain: 'Under Regulation 24A, listed entities must submit an annual secretarial compliance report issued by a PCS to stock exchanges within sixty days from the end of each financial year.',
    rememberBody: 'Form MR-3 secretarial audit in annual report; ASCR filed in 60 days of FY end; applies to listed entity and material unlisted Indian subsidiaries.',
    rememberComplianceTip: 'Conduct half-yearly pre-audits with the PCS to clear compliance observations before the year-end report.'
  },
  {
    id: 'lodr_ch_8',
    chapterNo: 8,
    title: 'Shareholding Pattern & Statement of Deviations (Reg 31 & 32)',
    band: 'Periodic Reporting',
    sourceRef: 'Regulation 31 & Regulation 32, SEBI (LODR) Regulations, 2015',
    understandBody: 'Listed entities must submit a quarterly Shareholding Pattern in the prescribed format within 21 days from the end of each quarter. 100% of promoter and promoter group shareholding must be maintained in dematerialized form. In addition, if public issue or rights issue proceeds remain unutilized, a Statement of Deviation/Variation in Form Reg 32 must be submitted quarterly to the Audit Committee and exchanges.',
    understandCalloutTitle: 'DEMAT MANDATE',
    understandCalloutBody: 'Any share transfer or promoter shareholding in physical form violates SEBI rules; 100% dematerialization of promoter holdings is mandatory for listing compliance.',
    walkthroughBody: '1. Obtain benpos (beneficiary position) file from depositories (NSDL & CDSL) as on quarter end.\n2. Reconcile promoter, institutional, non-institutional, and public holdings.\n3. Prepare XBRL shareholding filing with foreign portfolio investor and SBO disclosures.\n4. Submit to stock exchanges within 21 days.\n5. If funds raised, submit Reg 32 deviation statement until full utilization.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'Special disclosure tables are mandatory for shares held by employee trusts, foreign ownership, and significant beneficial owners.',
    practiceQuestion: 'Within how many days from the end of each quarter must the Shareholding Pattern be submitted under Regulation 31(1)(b)?',
    practiceOptions: [
      'Option A: Within 15 days',
      'Option B: Within 21 days',
      'Option C: Within 30 days',
      'Option D: Within 45 days'
    ],
    practiceAnswer: 1,
    practiceExplain: 'Regulation 31(1)(b) provides that the shareholding pattern shall be submitted quarterly within 21 days from the end of each quarter.',
    rememberBody: 'Shareholding pattern in 21 days; 100% promoter holdings in demat; Statement of Deviations for capital issue proceeds; reconcile with benpos.',
    rememberComplianceTip: 'Reconcile NSDL and CDSL totals with the ROC paid-up share capital before generating the XBRL payload.'
  },
  {
    id: 'lodr_ch_9',
    chapterNo: 9,
    title: 'Nomination & Remuneration Committee (NRC - Reg 19)',
    band: 'Governance & Remuneration',
    sourceRef: 'Regulation 19, SEBI (LODR) Regulations, 2015',
    understandBody: 'The Board must constitute a Nomination and Remuneration Committee (NRC) consisting of at least 3 directors, all of whom must be non-executive directors and at least 2/3rds independent directors. The chairperson must be an independent director. The NRC formulates criteria for director qualifications, board diversity, performance evaluation, and policy on KMP remuneration.',
    understandCalloutTitle: 'STATUTORY QUORUM',
    understandCalloutBody: 'Quorum for an NRC meeting is 2 members or 1/3rd of the members (whichever is greater), with at least one independent director present.',
    walkthroughBody: '1. Formulate policy on director appointments, fit and proper criteria, and gender diversity.\n2. Conduct annual performance evaluation of the Board, committees, and individual directors.\n3. Recommend compensation packages for Executive Directors and KMPs.\n4. Meet at least once a year and record minutes.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'The chairperson of the listed entity (whether executive or non-executive) may be appointed as a member of the NRC but cannot chair the committee.',
    practiceQuestion: 'Who among the following CANNOT chair the Nomination and Remuneration Committee (NRC) of a listed entity?',
    practiceOptions: [
      'Option A: Independent Director',
      'Option B: Senior Independent Woman Director',
      'Option C: Chairperson of the listed entity',
      'Option D: A non-executive independent director'
    ],
    practiceAnswer: 2,
    practiceExplain: 'Regulation 19(2) explicitly provides that the chairperson of the listed entity, whether executive or non-executive, shall not chair the Nomination and Remuneration Committee.',
    rememberBody: 'Minimum 3 directors; all non-executive; 2/3rds independent; chairperson cannot chair NRC; formulates director evaluation and remuneration policy.',
    rememberComplianceTip: 'Document individual board evaluation sheets with quantifiable metrics prior to the annual report sign-off.'
  },
  {
    id: 'lodr_ch_10',
    chapterNo: 10,
    title: 'Stakeholders Relationship & Risk Management Committees',
    band: 'Stakeholder Governance',
    sourceRef: 'Regulation 20 & Regulation 21, SEBI (LODR) Regulations, 2015',
    understandBody: 'Regulation 20 requires a Stakeholders Relationship Committee (SRC) to resolve grievances of security holders, chaired by a non-executive director with at least 3 directors (at least 1 independent). Regulation 21 requires top 1000 listed entities to constitute a Risk Management Committee (RMC), majority comprising board members (at least 1 independent), meeting at least twice a year.',
    understandCalloutTitle: 'CYBERSECURITY & RISK MANDATE',
    understandCalloutBody: 'The RMC must specifically monitor cyber security risks, environmental and governance risks, and operational resilience.',
    walkthroughBody: '1. SRC reviews quarterly investor grievance reports (SCORES portal) within 21 days under Reg 13(3).\n2. RMC reviews company-wide risk matrix, hedging strategies, and IT security twice annually.\n3. Maintain maximum 180-day gap between RMC meetings.\n4. Disclose risk management framework in the Annual Report.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'All investor complaints on SEBI SCORES must be resolved and action taken reports filed within 21 calendar days.',
    practiceQuestion: 'Under Regulation 21(3A), how many times must the Risk Management Committee (RMC) meet in a financial year?',
    practiceOptions: [
      'Option A: At least once a year',
      'Option B: At least twice a year',
      'Option C: At least 4 times a year',
      'Option D: Once every quarter'
    ],
    practiceAnswer: 1,
    practiceExplain: 'Regulation 21(3A) mandates that the Risk Management Committee shall meet at least twice in a year, with not more than 180 days intervening between two meetings.',
    rememberBody: 'SRC handles investor grievances; RMC mandatory for top 1000 listed entities; RMC meets twice a year with max 180-day gap; monitor cyber security.',
    rememberComplianceTip: 'Check the SEBI SCORES portal weekly to prevent automated escalation of unanswered investor grievances.'
  },
  {
    id: 'lodr_ch_11',
    chapterNo: 11,
    title: 'Corporate Governance Report & Annual Report (Reg 27 & 34)',
    band: 'Annual Disclosures',
    sourceRef: 'Regulation 27, Regulation 34 & Schedule V, SEBI (LODR) Regulations, 2015',
    understandBody: 'Listed entities must submit a quarterly Compliance Report on Corporate Governance in the prescribed format within 21 days from the end of each quarter (Regulation 27). Furthermore, the Annual Report submitted to stock exchanges under Regulation 34 must contain the Business Responsibility and Sustainability Report (BRSR - top 1000), Management Discussion & Analysis (MD&A), and Corporate Governance Report with a certificate from auditors or a PCS.',
    understandCalloutTitle: 'BRSR CORE MANDATE',
    understandCalloutBody: 'Top 1000 listed entities must mandatorily publish BRSR covering ESG metrics and reasonable assurance for BRSR Core indicators.',
    walkthroughBody: '1. Submit quarterly Reg 27 Corporate Governance XBRL within 21 days.\n2. In Q4, provide enhanced annual disclosures including committee compositions, meeting dates, and director attendance.\n3. Prepare Annual Report with MD&A, BRSR, and PCS Corporate Governance certificate.\n4. Send Annual Report to shareholders and stock exchanges at least 21 days before the AGM.',
    walkthroughCalloutTitle: 'PRACTITIONER NOTE',
    walkthroughCalloutBody: 'The Corporate Governance Report must disclose the skills/expertise matrix of directors mapped against their names without anonymization.',
    practiceQuestion: 'Within how many days from the end of each quarter must the Corporate Governance Compliance Report be filed under Regulation 27(2)?',
    practiceOptions: [
      'Option A: Within 15 days',
      'Option B: Within 21 days',
      'Option C: Within 30 days',
      'Option D: Within 45 days'
    ],
    practiceAnswer: 1,
    practiceExplain: 'Regulation 27(2)(a) stipulates that the listed entity shall submit a quarterly compliance report on corporate governance to the recognized stock exchange(s) within 21 days from the end of each quarter.',
    rememberBody: 'Reg 27 governance report in 21 days; BRSR mandatory for top 1000; PCS/auditor governance certificate in annual report; director skills matrix required.',
    rememberComplianceTip: 'Cross-check director attendance in the Corporate Governance Report against the formal signed minutes of each committee.'
  },
  {
    id: 'lodr_ch_12',
    chapterNo: 12,
    title: 'Website Disclosures & Record Keeping (Reg 46 & 62)',
    band: 'Digital Transparency',
    sourceRef: 'Regulation 46 & Regulation 62, SEBI (LODR) Regulations, 2015',
    understandBody: 'Regulation 46 requires listed entities to maintain a functional website containing basic entity details, terms and conditions of appointment of independent directors, composition of board committees, code of conduct, vigil mechanism/whistle blower policy, RPT policy, dividend distribution policy, financial results, annual reports, transcript/audio recordings of investor calls, and secretarial filings.',
    understandCalloutTitle: 'LIVE UPDATES TIMELINE',
    understandCalloutBody: 'Website disclosures must be updated within 2 working days of any changes made to statutory policies, board composition, or financial results.',
    walkthroughBody: '1. Maintain a dedicated, easily accessible "Investor Relations" section on website.\n2. Upload audio/video recordings of post-earnings analyst calls within 24 hours (and transcripts within 5 working days).\n3. Update board changes, shareholding patterns, and credit ratings within 2 working days.\n4. Maintain archived web disclosures for a minimum period of 5 years per the Archival Policy.',
    walkthroughCalloutTitle: 'PRACTITIONER WATCHOUT',
    walkthroughCalloutBody: 'Stock exchanges conduct periodic automated sweeps of listed entity websites and issue immediate deficiency notices for broken links or outdated policy texts.',
    practiceQuestion: 'Within what timeframe must any change in the contents of the website be updated under Regulation 46(3)?',
    practiceOptions: [
      'Option A: Within 24 hours',
      'Option B: Within 2 working days',
      'Option C: Within 7 days',
      'Option D: Within 15 days'
    ],
    practiceAnswer: 1,
    practiceExplain: 'Regulation 46(3) mandates that the listed entity shall update any change in the content of its website within two (2) working days from the date of such change in content.',
    rememberBody: 'Functional website under Reg 46; 2 working days to update website changes; post-earnings call audio in 24h, transcript in 5 days; 5-year archival policy.',
    rememberComplianceTip: 'Perform a monthly website integrity audit to ensure all statutory PDF links and policy documents are active and current.'
  }
];

// ─── Extract Chapters from courses.json for Active Courses ──────────────────
function extractChaptersFromCoursesJson(slug) {
  const courseObj = coursesData?.[slug];
  if (!courseObj || !courseObj.chapters || courseObj.chapters.length === 0) {
    return null;
  }

  return courseObj.chapters.map((ch, idx) => {
    const chNum = ch.num || ch.chapterNo || (idx + 1);
    const primaryLesson = ch.lessons?.[0] || {};
    const p = primaryLesson.payload || {};
    const cards = normalizeCards(p.cards || primaryLesson.cards || []);
    const primaryQ = ch.questions?.[0] || {};
    const qp = primaryQ.payload || {};
    const rawOptions = qp.options || primaryQ.options || [];
    const qOptions = Array.isArray(rawOptions)
      ? rawOptions.map(o => (typeof o === 'string' ? o : o.text || o.t || o.k || String(o)))
      : ['Option A: Mandatory statutory filing', 'Option B: Umbrella entity exemption', 'Option C: Voluntary guideline', 'Option D: Case-by-case waiver'];

    const understandBody = p.hook || p.meaning || p.summary || primaryLesson.question || (cards.length > 0 ? cards.map(c => `${c.title}: ${c.means || c.law}`).join(' ') : 'Statutory overview and operational framework.');
    const understandCalloutTitle = cards[0]?.tag || (p.importance ? 'WHY THIS MATTERS' : 'CORE STATUTORY PRINCIPLE');
    const understandCalloutBody = cards[0]?.law || p.importance || p.meaning || p.reg_text || 'Ensure complete compliance with statutory requirements.';
    const walkthroughBody = p.summary || p.practitioner_note || (cards.length > 0 ? cards.map(c => c.means || c.law).join(' ') : 'Review operational guidelines and regulatory workflows.');
    const walkthroughCalloutTitle = 'PRACTITIONER NOTE';
    const walkthroughCalloutBody = p.tip || p.practitioner_note || (cards[0]?.watch ? `Watch: ${cards[0].watch}` : 'Verify all regulatory filings and disclosures before execution.');
    const practiceQuestion = qp.q || primaryQ.question || primaryQ.title || `What is the core regulatory mandate under Chapter ${chNum} (${ch.title})?`;
    const practiceExplain = qp.scenario || primaryQ.explanation || p.tip || p.summary || 'Statutory compliance is enforced per regulation.';
    const rememberBody = p.summary || p.takeaway || (cards.length > 0 ? cards.map(c => `${c.title}: ${c.means || c.law}`).join('; ') : understandBody);
    const rememberComplianceTip = p.tip || p.practitioner_note || 'Verify all regulatory thresholds against the latest circulars.';

    const provStr = typeof primaryLesson.provision === 'object'
      ? (primaryLesson.provision?.provision || primaryLesson.provision?.authority || '')
      : (primaryLesson.provision || '');
    const sourceRef = provStr ? `${provStr} · ${courseObj.title}` : `Chapter ${chNum} · ${courseObj.title}`;

    return {
      ...ch,
      id: primaryLesson.uid || ch.id || `ch_${chNum}`,
      num: chNum,
      chapterNo: chNum,
      title: ch.title || `Chapter ${chNum}`,
      description: ch.description || understandBody,
      band: ch.band || 'Regulatory Framework',
      sourceRef,
      understandBody,
      understandCalloutTitle,
      understandCalloutBody,
      walkthroughBody,
      walkthroughCalloutTitle,
      walkthroughCalloutBody,
      practiceQuestion,
      practiceOptions: qOptions.length > 0 ? qOptions : ['Option A: Strict compliance per scheme', 'Option B: Umbrella fund level exemption', 'Option C: Voluntary guideline', 'Option D: Exempt for accredited investors'],
      practiceAnswer: 0,
      practiceExplain,
      rememberBody,
      rememberComplianceTip,
      cards,
      concepts: ch.concepts || [],
      activities: ch.activities || [],
      lessons: ch.lessons || [],
      questions: ch.questions || [],
      totalLessons: ch.lessons?.length || 0,
      totalQuestions: ch.questions?.length || 0,
    };
  });
}

function normalizeChapterList(list) {
  if (!Array.isArray(list)) return [];
  return list.map((ch, idx) => {
    const chNum = ch.num || ch.chapterNo || (idx + 1);
    return {
      ...ch,
      num: chNum,
      chapterNo: chNum,
      id: ch.id || `ch_${chNum}`,
      title: ch.title || `Chapter ${chNum}`,
      description: ch.description || ch.understandBody || 'Statutory compliance and operational requirements.',
      band: ch.band || 'Core Statutory Mandate',
    };
  });
}

/**
 * ─── Central Authoritative Course Content Resolver ──────────────────────────
 * Guarantees that every course returns ONLY its authentic, mapped content.
 * Unknown or invalid course IDs return { notFound: true } and NEVER crossover.
 */
export function getClassicStudyContent(courseIdOrSlug) {
  const canonicalSlug = normalizeCourseSlug(courseIdOrSlug);

  if (!canonicalSlug) {
    return { notFound: true, reason: 'INVALID_SLUG', title: 'Course Not Found', chapters: [] };
  }

  // 1. Companies Act 2013
  if (canonicalSlug === 'companies-act') {
    const chapters = normalizeChapterList(COMPANIES_ACT_CHAPTERS);
    return {
      courseId: 'companies-act',
      slug: 'companies-act',
      code: 'MCA-CA2013',
      regulator: 'MCA',
      title: 'Companies Act 2013: Essential Secretarial Compliance',
      description: 'Practical walkthrough of incorporation, director disqualifications, related-party transactions, secretarial standards (SS-1, SS-2) & MCA-21 v3 filings.',
      badge: 'Preview Available',
      difficulty: 'Beginner to Intermediate',
      durationHours: 18,
      totalChapters: chapters.length,
      totalQuestions: chapters.length * 6,
      chapters,
      isUpcoming: false
    };
  }

  // 2. SEBI LODR 2015
  if (canonicalSlug === 'sebi-lodr') {
    const chapters = normalizeChapterList(SEBI_LODR_CHAPTERS);
    return {
      courseId: 'sebi-lodr',
      slug: 'sebi-lodr',
      code: 'SEBI-LODR',
      regulator: 'SEBI',
      title: 'SEBI (Listing Obligations and Disclosure Requirements) 2015',
      description: 'Governance, board composition, committee mandates, material event reporting, and periodic disclosure framework for listed entities.',
      badge: 'Preview Available',
      difficulty: 'Intermediate',
      durationHours: 10,
      totalChapters: chapters.length,
      totalQuestions: chapters.length * 6,
      chapters,
      isUpcoming: false
    };
  }

  // 3. IFSCA CMI
  if (canonicalSlug === 'ifsca-cmi') {
    const chapters = extractChaptersFromCoursesJson('ifsca-cmi');
    return {
      courseId: 'ifsca-cmi',
      slug: 'ifsca-cmi',
      code: 'IFSCA-CMI',
      regulator: 'IFSCA',
      title: 'IFSCA (Capital Market Intermediaries) Regulations, 2025',
      description: coursesData['ifsca-cmi']?.description || 'In-depth study of registration, net worth, governance, code of conduct, and enforcement for all 11 CMI categories in GIFT IFSC.',
      badge: 'Updated 2026',
      difficulty: 'Intermediate',
      durationHours: 12,
      totalChapters: chapters?.length || 17,
      totalQuestions: coursesData['ifsca-cmi']?.totalQuestions || 250,
      chapters: chapters || [],
      isUpcoming: false
    };
  }

  // 4. IFSCA FME
  if (canonicalSlug === 'ifsca-fme') {
    const chapters = extractChaptersFromCoursesJson('ifsca-fme');
    return {
      courseId: 'ifsca-fme',
      slug: 'ifsca-fme',
      code: 'IFSCA-FME',
      regulator: 'IFSCA',
      title: 'IFSCA Fund Management (FME) Regulations',
      description: coursesData['ifsca-fme']?.description || 'Comprehensive curriculum covering all FME categories, PPM drafting, risk management, and regulatory compliance in GIFT City.',
      badge: 'Master Track',
      difficulty: 'Advanced',
      durationHours: 15,
      totalChapters: chapters?.length || 13,
      totalQuestions: coursesData['ifsca-fme']?.totalQuestions || 350,
      chapters: chapters || [],
      isUpcoming: false
    };
  }

  // 5. SEBI AIF
  if (canonicalSlug === 'sebi-aif') {
    const chapters = extractChaptersFromCoursesJson('sebi-aif');
    return {
      courseId: 'sebi-aif',
      slug: 'sebi-aif',
      code: 'SEBI-AIF',
      regulator: 'SEBI',
      title: 'SEBI (Alternative Investment Funds) Regulations, 2012',
      description: coursesData['sebi-aif']?.description || 'Master Category I, II, and III AIF structures, PPM templates, valuation norms, stewardship code, and compliance reporting.',
      badge: 'Core Track',
      difficulty: 'Advanced',
      durationHours: 14,
      totalChapters: chapters?.length || 14,
      totalQuestions: coursesData['sebi-aif']?.totalQuestions || 180,
      chapters: chapters || [],
      isUpcoming: false
    };
  }

  // 6. Check generic coursesData if exists
  if (coursesData[canonicalSlug]) {
    const c = coursesData[canonicalSlug];
    const chapters = extractChaptersFromCoursesJson(canonicalSlug);
    return {
      courseId: canonicalSlug,
      slug: canonicalSlug,
      code: c.code || canonicalSlug.toUpperCase(),
      regulator: c.regulator || 'Regulatory',
      title: c.title || 'Regulatory Master Course',
      description: c.description || '',
      badge: c.badge || 'Available',
      difficulty: c.difficulty || 'Intermediate',
      durationHours: c.durationHours || 10,
      totalChapters: chapters?.length || c.totalChapters || 1,
      totalQuestions: c.totalQuestions || 50,
      chapters: chapters || [],
      isUpcoming: false
    };
  }

  // Unknown course ID -> NEVER cross over to another course
  return {
    notFound: true,
    courseId: courseIdOrSlug,
    title: 'Course Not Found',
    chapters: [],
    reason: `No curriculum found for "${courseIdOrSlug}".`
  };
}
