import ifscaPackage from './RegMate_IFSCA_FME_2025_Content_Package_FINAL.json';
import ifscaFinanceCompanyPackage from './RegMate_IFSCA_Finance_Company_2021_FINAL.json';
import ifscaInsuranceBusinessPackage from './RegMate_IFSCA_Registration_Insurance_Business_2021_FINAL.json';

const romanMap = {
  'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6,
  'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12,
  'XIII': 13, 'XIV': 14, 'XV': 15, 'XVI': 16, 'XVII': 17, 'XVIII': 18,
  'XIX': 19, 'XX': 20
};

const ifscaChapters = ifscaPackage.chapters.map(c => {
  const num = romanMap[c.chapter_number] || parseInt(c.chapter_number, 10);
  const chapterProvisions = ifscaPackage.provisions.filter(p => p.chapter_number === c.chapter_number);
  return {
    num,
    romanNum: c.chapter_number,
    title: c.title,
    sections: chapterProvisions.map(p => ({
      num: p.provision_number,
      title: p.title,
    }))
  };
});

export const PROVISION_DETAILS = {};
ifscaPackage.provisions.forEach(p => {
  const romanNum = p.chapter_number;
  const chNum = romanMap[romanNum] || parseInt(romanNum, 10);
  PROVISION_DETAILS[`ifsca-fme-2025|${chNum}|${p.provision_number}`] = p;
  PROVISION_DETAILS[`ifsca-fme-2025|${p.provision_number}`] = p;
  PROVISION_DETAILS[p.id] = p;
});

export const DEFINITIONS_DATA = ifscaPackage.definitions || [];
export const SCHEDULES_DATA = ifscaPackage.schedules || [];
export const CROSS_REFERENCES_DATA = ifscaPackage.cross_references || [];

export const ACT_DEFINITIONS = {
  'ifsca-fme-2025': ifscaPackage.definitions || []
};

export const ACT_SCHEDULES = {
  'ifsca-fme-2025': ifscaPackage.schedules || []
};

function parseChapterNumber(chapStr) {
  if (!chapStr) return 1;
  const cleaned = chapStr.replace(/^Chapter\s+/i, '').trim();
  if (romanMap[cleaned]) return romanMap[cleaned];
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 1 : parsed;
}

function processSchema2Package(pkg, actSlug) {
  const content = pkg.regulation_content || [];
  const definitions = (pkg.definitions_reference || []).map(d => ({
    ...d,
    actSlug,
    actTitle: pkg.instrument?.name
  }));

  ACT_DEFINITIONS[actSlug] = definitions;

  const regularProvisions = [];
  const schedules = [];

  content.forEach(item => {
    const isSchedule = (item.chapter && item.chapter.toLowerCase().includes('schedule')) ||
                       item.provision_type === 'schedule_form_or_annexure';
    if (isSchedule) {
      schedules.push({
        id: item.regulation_id,
        title: item.provision_heading || item.chapter_title || 'Schedule',
        statutory_text: item.regulation_text,
        actSlug,
        simple_explanation: item.simple_explanation,
        ...item
      });
    } else {
      regularProvisions.push(item);
    }
  });

  ACT_SCHEDULES[actSlug] = schedules;

  const chapterMap = new Map();
  regularProvisions.forEach(item => {
    const rawChapter = item.chapter || 'Chapter I';
    const chTitle = item.chapter_title || rawChapter;
    if (!chapterMap.has(rawChapter)) {
      chapterMap.set(rawChapter, {
        rawChapter,
        title: chTitle,
        items: []
      });
    }
    chapterMap.get(rawChapter).items.push(item);
  });

  const chapters = [];
  let chCounter = 1;
  chapterMap.forEach((val, rawChap) => {
    const num = parseChapterNumber(rawChap) || chCounter;
    chapters.push({
      num,
      romanNum: rawChap.replace(/^Chapter\s+/i, ''),
      title: val.title,
      sections: val.items.map(p => ({
        num: p.provision_number,
        title: p.provision_heading || p.regulation_name,
      }))
    });
    chCounter++;
  });

  regularProvisions.forEach(p => {
    const rawChap = p.chapter || 'Chapter I';
    const chNum = parseChapterNumber(rawChap);

    const normalized = {
      ...p,
      title: p.provision_heading,
      statutory_text: p.regulation_text,
      regmate_explanation: p.simple_explanation || p.regmate_comment,
      key_highlights: p.important_numbers ? [p.important_numbers] : [],
      isSchema2: true,
      actSlug
    };

    PROVISION_DETAILS[`${actSlug}|${chNum}|${p.provision_number}`] = normalized;
    PROVISION_DETAILS[`${actSlug}|${p.provision_number}`] = normalized;
    if (p.regulation_id) PROVISION_DETAILS[p.regulation_id] = normalized;
  });

  return {
    title: pkg.instrument?.name || '',
    shortTitle: pkg.instrument?.name ? pkg.instrument.name.replace('International Financial Services Centres Authority', 'IFSCA') : '',
    totalChapters: chapters.length,
    chapters,
    versionDate: pkg.instrument?.version || '',
    status: pkg.status || 'Final',
    isSchema2: true,
    definitions,
    schedules
  };
}

const financeCompanyActData = processSchema2Package(ifscaFinanceCompanyPackage, 'ifsca-finance-company-2021');
const insuranceBusinessActData = processSchema2Package(ifscaInsuranceBusinessPackage, 'ifsca-registration-insurance-business-2021');

export function getActDefinitions(actSlug) {
  return ACT_DEFINITIONS[actSlug] || [];
}

export function getActSchedules(actSlug) {
  return ACT_SCHEDULES[actSlug] || [];
}

// ─── Shared Regulations Data ───────────────────────────────────────────────
export const ACTS_DATA = {

  // ══════════════════════════════════════════════════════════════════════════
  // IFSCA (FUND MANAGEMENT) REGULATIONS, 2025 | 12 Chapters | 161 Regulations
  // ══════════════════════════════════════════════════════════════════════════
  'ifsca-fme-2025': {
    title: 'IFSCA (Fund Management) Regulations, 2025',
    shortTitle: 'IFSCA FME Regulations',
    totalChapters: 12,
    chapters: ifscaChapters
  },

  // ══════════════════════════════════════════════════════════════════════════
  // IFSCA (FINANCE COMPANY) REGULATIONS, 2021 | 5 Chapters + 1 Schedule
  // ══════════════════════════════════════════════════════════════════════════
  'ifsca-finance-company-2021': financeCompanyActData,

  // ══════════════════════════════════════════════════════════════════════════
  // IFSCA (REGISTRATION OF INSURANCE BUSINESS) REGULATIONS, 2021
  // ══════════════════════════════════════════════════════════════════════════
  'ifsca-registration-insurance-business-2021': insuranceBusinessActData,

  // ══════════════════════════════════════════════════════════════════════════
  // COMPANIES ACT, 2013  |  29 Chapters
  // ══════════════════════════════════════════════════════════════════════════
  'companies-act-2013': {
    title: 'Companies Act, 2013',
    shortTitle: 'Companies Act',
    totalChapters: 29,
    chapters: [
      {
        num: 1, title: 'Preliminary',
        sections: [
          { num: 1, title: 'Short title, extent, commencement and application' },
          { num: 2, title: 'Definitions' },
        ]
      },
      {
        num: 2, title: 'Incorporation of Company and Matters Incidental Thereto',
        sections: [
          { num: 3, title: 'Formation of company' },
          { num: 4, title: 'Memorandum of association' },
          { num: 5, title: 'Articles of association' },
          { num: 6, title: 'Act to override memorandum, articles, etc.' },
          { num: 7, title: 'Incorporation of company' },
          { num: 8, title: 'Formation of companies with charitable objects, etc.' },
          { num: 9, title: 'Effect of registration' },
          { num: 10, title: 'Effect of memorandum and articles' },
          { num: 11, title: 'Commencement of business, etc.' },
          { num: 12, title: 'Registered office of company' },
          { num: 13, title: 'Alteration of memorandum' },
          { num: 14, title: 'Alteration of articles' },
          { num: 15, title: 'Alteration of memorandum or articles to be noted in every copy' },
          { num: 16, title: 'Rectification of name of company' },
          { num: 17, title: 'Copies of memorandum, articles, etc., to be given to members' },
          { num: 18, title: 'Conversion of companies already registered' },
          { num: 19, title: 'Subsidiary company not to hold shares in its holding company' },
          { num: 20, title: 'Service of documents' },
          { num: 21, title: 'Authentication of documents, proceedings and contracts' },
          { num: 22, title: 'Execution of bills of exchange, etc.' },
        ]
      },
      {
        num: 3, title: 'Prospectus and Allotment of Securities',
        sections: [
          { num: 23, title: 'Public offer and private placement' },
          { num: 24, title: 'Power of Securities and Exchange Board to regulate issue and transfer of securities' },
          { num: 25, title: 'Document containing offer of securities for sale to be deemed prospectus' },
          { num: 26, title: 'Matters to be stated in prospectus' },
          { num: 27, title: 'Variation in terms of contract or objects in prospectus' },
          { num: 28, title: 'Offer of sale of shares by certain members of company' },
          { num: 29, title: 'Public offer of securities to be in dematerialised form' },
          { num: 30, title: 'Advertisement of prospectus' },
          { num: 31, title: 'Shelf prospectus' },
          { num: 32, title: 'Red herring prospectus' },
          { num: 33, title: 'Issue of application forms for securities' },
          { num: 34, title: 'Criminal liability for misstatements in prospectus' },
          { num: 35, title: 'Civil liability for misstatements in prospectus' },
          { num: 36, title: 'Punishment for fraudulently inducing persons to invest money' },
          { num: 37, title: 'Action by affected persons' },
          { num: 38, title: 'Punishment for personation for acquisition, etc., of securities' },
          { num: 39, title: 'Allotment of securities by company' },
          { num: 40, title: 'Securities to be dealt in stock exchanges' },
          { num: 41, title: 'Global depository receipt' },
          { num: 42, title: 'Issue of securities on private placement basis' },
        ]
      },
      {
        num: 4, title: 'Share Capital and Debentures',
        sections: [
          { num: 43, title: 'Kinds of share capital' },
          { num: 44, title: 'Nature of shares or debentures' },
          { num: 45, title: 'Numbering of shares' },
          { num: 46, title: 'Certificate of shares' },
          { num: 47, title: 'Voting rights' },
          { num: 48, title: 'Variation of shareholders\' rights' },
          { num: 49, title: 'Calls on shares of same class to be made on uniform basis' },
          { num: 50, title: 'Company to accept unpaid share capital, although not called up' },
          { num: 51, title: 'Payment of dividend in proportion to amount paid-up' },
          { num: 52, title: 'Application of premiums received on issue of shares' },
          { num: 53, title: 'Prohibition on issue of shares at discount' },
          { num: 54, title: 'Issue of sweat equity shares' },
          { num: 55, title: 'Issue and redemption of preference shares' },
          { num: 56, title: 'Transfer and transmission of securities' },
          { num: 57, title: 'Punishment for personation of shareholder' },
          { num: 58, title: 'Refusal of registration and appeal against refusal' },
          { num: 59, title: 'Rectification of register of members' },
          { num: 60, title: 'Publication of authorised, subscribed and paid-up capital' },
          { num: 61, title: 'Power to alter share capital' },
          { num: 62, title: 'Further issue of share capital' },
          { num: 63, title: 'Issue of bonus shares' },
          { num: 64, title: 'Notice to be given to Registrar for alteration of share capital' },
          { num: 65, title: 'Unlimited company to provide for reserve share capital on conversion into limited company' },
          { num: 66, title: 'Reduction of share capital' },
          { num: 67, title: 'Restrictions on purchase by company or giving of loans by it for purchase of its shares' },
          { num: 68, title: 'Power of company to purchase its own securities' },
          { num: 69, title: 'Transfer of certain sums to capital redemption reserve account' },
          { num: 70, title: 'Prohibition for buy-back in certain circumstances' },
          { num: 71, title: 'Debentures' },
          { num: 72, title: 'Power to nominate' },
        ]
      },
      {
        num: 5, title: 'Acceptance of Deposits by Companies',
        sections: [
          { num: 73, title: 'Prohibition on acceptance of deposits from public' },
          { num: 74, title: 'Repayment of deposits, etc., accepted before commencement of this Act' },
          { num: 75, title: 'Damages for fraud' },
          { num: 76, title: 'Acceptance of deposits from public by certain companies' },
          { num: '76A', title: 'Punishment for contravention of section 73 or section 76' },
        ]
      },
      {
        num: 6, title: 'Registration of Charges',
        sections: [
          { num: 77, title: 'Duty to register charges, etc.' },
          { num: 78, title: 'Application for registration of charge' },
          { num: 79, title: 'Section 77 to apply in certain matters' },
          { num: 80, title: 'Date of notice of charge' },
          { num: 81, title: 'Register of charges to be kept by Registrar' },
          { num: 82, title: 'Company to report satisfaction of charge' },
          { num: 83, title: 'Power of Registrar to make entries of satisfaction and release in absence of intimation from company' },
          { num: 84, title: 'Intimation of appointment of receiver or manager' },
          { num: 85, title: 'Company\'s register of charges' },
          { num: 86, title: 'Punishment for contravention' },
          { num: 87, title: 'Rectification by Central Government in register of charges' },
        ]
      },
      {
        num: 7, title: 'Management and Administration',
        sections: [
          { num: 88, title: 'Register of members, etc.' },
          { num: 89, title: 'Declaration in respect of beneficial interest in any share' },
          { num: 90, title: 'Register of significant beneficial owners in a company' },
          { num: 91, title: 'Power to close register of members or debenture holders or other security holders' },
          { num: 92, title: 'Annual return' },
          { num: 93, title: 'Return to be filed with Registrar in case promoters\' stake changes' },
          { num: 94, title: 'Place of keeping and inspection of registers, returns, etc.' },
          { num: 95, title: 'Registers, etc., to be evidence' },
          { num: 96, title: 'Annual general meeting' },
          { num: 97, title: 'Power of Tribunal to call annual general meeting' },
          { num: 98, title: 'Power of Tribunal to call meetings of members, etc.' },
          { num: 99, title: 'Punishment for default in complying with provisions of sections 96, 97 and 98' },
          { num: 100, title: 'Calling of extraordinary general meeting' },
          { num: 101, title: 'Notice of meeting' },
          { num: 102, title: 'Statement to be annexed to notice' },
          { num: 103, title: 'Quorum for meetings' },
          { num: 104, title: 'Chairman of meetings' },
          { num: 105, title: 'Proxies' },
          { num: 106, title: 'Restriction on voting rights' },
          { num: 107, title: 'Voting by show of hands' },
          { num: 108, title: 'Voting through electronic means' },
          { num: 109, title: 'Demand for poll' },
          { num: 110, title: 'Postal ballot' },
          { num: 111, title: 'Circulation of members\' resolution' },
          { num: 112, title: 'Representation of President and Governors in meetings' },
          { num: 113, title: 'Representation of corporations at meeting of companies and of creditors' },
          { num: 114, title: 'Ordinary and special resolutions' },
          { num: 115, title: 'Resolutions requiring special notice' },
          { num: 116, title: 'Resolutions passed at adjourned meeting' },
          { num: 117, title: 'Resolutions and agreements to be filed' },
          { num: 118, title: 'Minutes of proceedings of general meeting, meeting of Board of Directors and other meeting and resolutions passed by postal ballot' },
          { num: 119, title: 'Inspection of minute-books of general meetings' },
          { num: 120, title: 'Maintenance and inspection of documents in electronic form' },
          { num: 121, title: 'Report on annual general meeting' },
          { num: 122, title: 'Applicability of this Chapter to One Person Company' },
        ]
      },
      {
        num: 8, title: 'Declaration and Payment of Dividend',
        sections: [
          { num: 123, title: 'Declaration of dividend' },
          { num: 124, title: 'Unpaid Dividend Account' },
          { num: 125, title: 'Investor Education and Protection Fund' },
          { num: 126, title: 'Right to dividend, rights shares and bonus shares to be held in abeyance pending registration of transfer of shares' },
          { num: 127, title: 'Punishment for failure to distribute dividends' },
        ]
      },
      {
        num: 9, title: 'Accounts of Companies',
        sections: [
          { num: 128, title: 'Books of account, etc., to be kept by company' },
          { num: 129, title: 'Financial statement' },
          { num: 130, title: 'Re-opening of accounts on court\'s or Tribunal\'s orders' },
          { num: 131, title: 'Voluntary revision of financial statements or Board\'s report' },
          { num: 132, title: 'Constitution of National Financial Reporting Authority' },
          { num: 133, title: 'Central Government to prescribe accounting standards' },
          { num: 134, title: 'Financial statement, Board\'s report, etc.' },
          { num: 135, title: 'Corporate Social Responsibility' },
          { num: 136, title: 'Right of member to copies of audited financial statement' },
          { num: 137, title: 'Copy of financial statement to be filed with Registrar' },
          { num: 138, title: 'Internal audit' },
        ]
      },
      {
        num: 10, title: 'Audit and Auditors',
        sections: [
          { num: 139, title: 'Appointment of auditors' },
          { num: 140, title: 'Removal, resignation of auditor and giving of special notice' },
          { num: 141, title: 'Eligibility, qualifications and disqualifications of auditors' },
          { num: 142, title: 'Remuneration of auditors' },
          { num: 143, title: 'Powers and duties of auditors and auditing standards' },
          { num: 144, title: 'Auditor not to render certain services' },
          { num: 145, title: 'Auditor to sign audit reports, etc.' },
          { num: 146, title: 'Auditors to attend general meeting' },
          { num: 147, title: 'Punishment for contravention' },
          { num: 148, title: 'Central Government to specify audit of items of cost in respect of certain companies' },
        ]
      },
      {
        num: 11, title: 'Appointment and Qualifications of Directors',
        sections: [
          { num: 149, title: 'Company to have Board of Directors' },
          { num: 150, title: 'Manner of selection of independent directors and maintenance of databank of independent directors' },
          { num: 151, title: 'Appointment of director elected by small shareholders' },
          { num: 152, title: 'Appointment of directors' },
          { num: 153, title: 'Application for allotment of Director Identification Number' },
          { num: 154, title: 'Allotment of Director Identification Number' },
          { num: 155, title: 'Prohibition to obtain more than one Director Identification Number' },
          { num: 156, title: 'Director to intimate Director Identification Number' },
          { num: 157, title: 'Company to inform Director Identification Number to Registrar' },
          { num: 158, title: 'Obligation of director to intimate the Director Identification Number' },
          { num: 159, title: 'Punishment for contravention of section 152, 155 and 156' },
          { num: 160, title: 'Right of persons other than retiring directors to stand for directorship' },
          { num: 161, title: 'Appointment of additional director, alternate director and nominee director' },
          { num: 162, title: 'Appointment of directors to be voted individually' },
          { num: 163, title: 'Option to adopt principle of proportional representation for appointment of directors' },
          { num: 164, title: 'Disqualifications for appointment of director' },
          { num: 165, title: 'Number of directorships' },
          { num: 166, title: 'Duties of directors' },
          { num: 167, title: 'Vacation of office of director' },
          { num: 168, title: 'Resignation of director' },
          { num: 169, title: 'Removal of directors' },
          { num: 170, title: 'Register of directors and key managerial personnel and their shareholding' },
          { num: 171, title: 'Members\' right to inspect' },
          { num: 172, title: 'Punishment' },
        ]
      },
      {
        num: 12, title: 'Meetings of Board and its Powers',
        sections: [
          { num: 173, title: 'Meetings of Board' },
          { num: 174, title: 'Quorum for meetings of Board' },
          { num: 175, title: 'Passing of resolution by circulation' },
          { num: 176, title: 'Defects in appointment of directors not to invalidate actions taken' },
          { num: 177, title: 'Audit Committee' },
          { num: 178, title: 'Nomination and Remuneration Committee and Stakeholders Relationship Committee' },
          { num: 179, title: 'Powers of Board' },
          { num: 180, title: 'Restrictions on powers of Board' },
          { num: 181, title: 'Company to contribute to bona fide and charitable funds, etc.' },
          { num: 182, title: 'Prohibitions and restrictions regarding political contributions' },
          { num: 183, title: 'Power of Board and other persons to make contributions to national defence fund, etc.' },
          { num: 184, title: 'Disclosure of interest by director' },
          { num: 185, title: 'Loan to directors, etc.' },
          { num: 186, title: 'Loan and investment by company' },
          { num: 187, title: 'Investments of company to be held in its own name' },
          { num: 188, title: 'Related party transactions' },
          { num: 189, title: 'Register of contracts or arrangements in which directors are interested' },
          { num: 190, title: 'Contract of employment with managing or whole-time directors' },
          { num: 191, title: 'Payment to director for loss of office, etc., in connection with transfer of undertaking, property or shares' },
          { num: 192, title: 'Restriction on non-cash transactions involving directors' },
          { num: 193, title: 'Contract by One Person Company' },
          { num: 194, title: 'Prohibition on forward dealings in securities of company by director or key managerial personnel' },
          { num: 195, title: 'Prohibition on insider trading of securities' },
        ]
      },
      {
        num: 13, title: 'Appointment and Remuneration of Managerial Personnel',
        sections: [
          { num: 196, title: 'Appointment of managing director, whole-time director or manager' },
          { num: 197, title: 'Overall maximum managerial remuneration and managerial remuneration in case of absence or inadequacy of profits' },
          { num: 198, title: 'Calculation of profits' },
          { num: 199, title: 'Recovery of managerial remuneration in certain cases' },
          { num: 200, title: 'Central Government or company to fix limit with regard to remuneration' },
          { num: 201, title: 'Forms of, and procedure in relation to, certain applications' },
          { num: 202, title: 'Compensation for loss of office of managing or whole-time director or manager' },
          { num: 203, title: 'Appointment of key managerial personnel' },
          { num: 204, title: 'Secretarial audit for bigger companies' },
          { num: 205, title: 'Functions of company secretary' },
        ]
      },
      {
        num: 14, title: 'Inspection, Inquiry and Investigation',
        sections: [
          { num: 206, title: 'Power to call for information, inspect books and conduct inquiries' },
          { num: 207, title: 'Conduct of inspection and inquiry' },
          { num: 208, title: 'Report on inspection made' },
          { num: 209, title: 'Search and seizure' },
          { num: 210, title: 'Investigation into affairs of company' },
          { num: 211, title: 'Establishment of Serious Fraud Investigation Office' },
          { num: 212, title: 'Investigation into affairs of company by Serious Fraud Investigation Office' },
          { num: 213, title: 'Investigation into company\'s affairs in other cases' },
          { num: 214, title: 'Security for payment of costs and expenses of investigation' },
          { num: 215, title: 'Firm, body corporate or association not to be appointed as inspector' },
          { num: 216, title: 'Investigation of ownership of company' },
          { num: 217, title: 'Procedure, powers, etc., of inspectors' },
          { num: 218, title: 'Protection of employees during investigation' },
          { num: 219, title: 'Power of inspector to conduct investigation into affairs of related companies, etc.' },
          { num: 220, title: 'Seizure of documents by inspector' },
          { num: 221, title: 'Freezing of assets of company on inquiry and investigation' },
          { num: 222, title: 'Imposition of restrictions upon securities' },
          { num: 223, title: 'Inspector\'s report' },
          { num: 224, title: 'Actions on inspector\'s report' },
          { num: 225, title: 'Expenses of investigation' },
          { num: 226, title: 'Voluntary winding up of company, etc., not to stop investigation proceedings' },
          { num: 227, title: 'Legal advisers and bankers not to be inspectors' },
          { num: 228, title: 'Inspector to have powers of civil court in certain cases' },
          { num: 229, title: 'Penalty for furnishing false statement, mutilation, destruction of documents' },
        ]
      },
      {
        num: 15, title: 'Compromise, Arrangements and Amalgamations',
        sections: [
          { num: 230, title: 'Power to compromise or make arrangements with creditors and members' },
          { num: 231, title: 'Power of Tribunal to enforce compromise or arrangement' },
          { num: 232, title: 'Merger and amalgamation of companies' },
          { num: 233, title: 'Merger or amalgamation of certain companies' },
          { num: 234, title: 'Merger or amalgamation of company with foreign company' },
          { num: 235, title: 'Purchase of minority shareholding' },
          { num: 236, title: 'Squeeze-out' },
          { num: 237, title: 'Power of Central Government to provide for amalgamation of companies in public interest' },
          { num: 238, title: 'Registration of offer of schemes involving transfer of shares' },
          { num: 239, title: 'Preservation of books and papers of amalgamated companies' },
          { num: 240, title: 'Liability of officers in respect of offences committed prior to merger, amalgamation, etc.' },
        ]
      },
      {
        num: 16, title: 'Prevention of Oppression and Mismanagement',
        sections: [
          { num: 241, title: 'Application to Tribunal for relief in cases of oppression, etc.' },
          { num: 242, title: 'Powers of Tribunal' },
          { num: 243, title: 'Consequence of termination or modification of certain agreements' },
          { num: 244, title: 'Right to apply under section 241' },
          { num: 245, title: 'Class action' },
          { num: 246, title: 'Application of certain provisions to proceedings under section 241 or section 245' },
        ]
      },
      {
        num: 17, title: 'Registered Valuers',
        sections: [
          { num: 247, title: 'Valuation by registered valuers' },
          { num: 248, title: 'Powers of the Central Government to remove difficulties' },
          { num: 249, title: 'Application for removal of name from the register' },
        ]
      },
      {
        num: 18, title: 'Removal of Names of Companies from Register of Companies',
        sections: [
          { num: 248, title: 'Power of Registrar to remove name of company from register of companies' },
          { num: 249, title: 'Restrictions on making application under section 248 in certain situations' },
          { num: 250, title: 'Effect of company notified as dissolved under section 248' },
          { num: 251, title: 'Fraudulent application for removal of name' },
          { num: 252, title: 'Appeal to Tribunal' },
        ]
      },
      {
        num: 19, title: 'Revival and Rehabilitation of Sick Companies',
        sections: [
          { num: 253, title: 'Determination of sickness' },
          { num: 254, title: 'Application for revival and rehabilitation' },
          { num: 255, title: 'Appointment of administrator' },
          { num: 256, title: 'Powers and duties of administrator' },
          { num: 257, title: 'Scheme of revival and rehabilitation' },
          { num: 258, title: 'Sanction of scheme' },
          { num: 259, title: 'Implementation and monitoring of scheme' },
          { num: 260, title: 'Assessment of rehabilitation' },
          { num: 261, title: 'Winding up of company on report of administrator' },
          { num: 262, title: 'Winding up under orders of Tribunal' },
          { num: 263, title: 'Provision for cases of compromise or arrangements' },
          { num: 264, title: 'Rehabilitation and Insolvency Fund' },
          { num: 265, title: 'Manner of recovery of amount' },
          { num: 266, title: 'Non-applicability of this Chapter to certain companies' },
          { num: 267, title: 'Non-applicability of Chapter in certain other cases' },
          { num: 268, title: 'Application for removal of name from the register' },
          { num: 269, title: 'Eligibility and qualifications of administrator' },
        ]
      },
      {
        num: 20, title: 'Winding Up',
        sections: [
          { num: 270, title: 'Modes of winding up' },
          { num: 271, title: 'Circumstances in which company may be wound up by Tribunal' },
          { num: 272, title: 'Petition for winding up' },
          { num: 273, title: 'Powers of Tribunal on hearing petition' },
          { num: 274, title: 'Directions for filing statement of affairs' },
          { num: 275, title: 'Company Liquidators and their appointments' },
          { num: 276, title: 'Removal and replacement of liquidator' },
          { num: 277, title: 'Intimation to Company Liquidator' },
          { num: 278, title: 'Fraudulent preference' },
          { num: 279, title: 'Effect of winding up order' },
          { num: 280, title: 'Jurisdiction of Tribunal' },
          { num: 281, title: 'Submission of report by Company Liquidator' },
          { num: 282, title: 'Custody of company\'s property' },
          { num: 283, title: 'Vesting of property of company in liquidator' },
          { num: 284, title: 'Completion of liquidation within 2 years' },
          { num: 285, title: 'Committee of creditors' },
          { num: 286, title: 'Compromise or arrangement for winding up' },
          { num: 287, title: 'Advisory Committee' },
          { num: 288, title: 'Appointment of Company Liquidator by Tribunal' },
          { num: 289, title: 'Company Liquidator to submit preliminary report' },
          { num: 290, title: 'Powers and duties of Company Liquidator' },
          { num: 291, title: 'Exercise and control of Company Liquidator\'s powers' },
          { num: 292, title: 'Books to be kept by Company Liquidator' },
          { num: 293, title: 'Audit of Company Liquidator\'s accounts' },
          { num: 294, title: 'Payment of debts by contributory and extent of set-off' },
          { num: 295, title: 'Power of Tribunal to make calls' },
          { num: 296, title: 'Payment into companies liquidation account' },
          { num: 297, title: 'Order of priority of payment' },
          { num: 298, title: 'Powers of Company Liquidator' },
          { num: 299, title: 'Company Liquidator to exercise certain powers subject to sanction' },
          { num: 300, title: 'Provision for professional assistance to Company Liquidator' },
          { num: 301, title: 'Avoidance of transfers, etc., in case of company being wound up' },
          { num: 302, title: 'Liabilities and rights of certain fraudulently preferred persons' },
          { num: 303, title: 'Effect of floating charge' },
          { num: 304, title: 'Disclaimer of onerous property' },
          { num: 305, title: 'Avoidance of certain attachment, execution, etc.' },
          { num: 306, title: 'Offences by officers of companies in liquidation' },
          { num: 307, title: 'Penalty for frauds by officers' },
          { num: 308, title: 'Liability where proper accounts not kept' },
          { num: 309, title: 'Liability for fraudulent trading' },
          { num: 310, title: 'Prosecution of delinquent officers and members of company' },
          { num: 311, title: 'Stay of winding up' },
          { num: 312, title: 'Settlement of list of contributories and application of assets' },
          { num: 313, title: 'Delivery of property to Company Liquidator' },
          { num: 314, title: 'Debts of all descriptions may be proved' },
          { num: 315, title: 'Application of insolvency rules in winding up of insolvent companies' },
          { num: 316, title: 'Overriding preferential payments' },
          { num: 317, title: 'Preferential payments' },
          { num: 318, title: 'Debts of all kinds to be paid in full before payment of deferred debts' },
          { num: 319, title: 'Adjustment of rights of contributories' },
          { num: 320, title: 'Inspection of books by creditors and contributories' },
          { num: 321, title: 'Meetings of creditors and contributories' },
          { num: 322, title: 'Powers of Tribunal to arrest absconding contributory' },
          { num: 323, title: 'Powers of Tribunal where person cannot pay debts' },
          { num: 324, title: 'Dissolution of company by Tribunal' },
          { num: 325, title: 'Voluntary winding up' },
          { num: 326, title: 'Circumstances in which company may be wound up voluntarily' },
          { num: 327, title: 'Notice of resolution to wind up voluntarily' },
          { num: 328, title: 'Commencement of voluntary winding up' },
          { num: 329, title: 'Effect of voluntary winding up on status of company' },
          { num: 330, title: 'Avoidance of transfer, etc., after winding up resolution' },
          { num: 331, title: 'Declaration of solvency' },
          { num: 332, title: 'Members\' voluntary winding up' },
          { num: 333, title: 'Power of company to appoint and fix remuneration of liquidators' },
          { num: 334, title: 'Board\'s powers to cease on appointment of liquidator' },
          { num: 335, title: 'Power to fill vacancy in office of liquidator' },
          { num: 336, title: 'Appointment of liquidator in case of vacancy' },
          { num: 337, title: 'Notice by liquidator of his appointment' },
          { num: 338, title: 'General meetings of company during winding up' },
          { num: 339, title: 'Final meeting and dissolution' },
          { num: 340, title: 'Creditors\' voluntary winding up' },
          { num: 341, title: 'Meeting of creditors' },
          { num: 342, title: 'Appointment of liquidator' },
          { num: 343, title: 'Fixing of liquidator\'s remuneration' },
          { num: 344, title: 'Board\'s powers to cease on appointment of liquidator in creditors\' voluntary winding up' },
          { num: 345, title: 'Appointment of Committee of Inspection' },
          { num: 346, title: 'Creditors and company at general meetings' },
          { num: 347, title: 'Final meeting and dissolution in creditors\' voluntary winding up' },
          { num: 348, title: 'Arrangement when binding on company and creditors' },
          { num: 349, title: 'Powers and duties of liquidator in voluntary winding up' },
          { num: 350, title: 'Power of liquidator to accept shares, etc., as consideration for sale of property of company' },
          { num: 351, title: 'Duty of liquidator to call creditors\' meeting in case of insolvency' },
          { num: 352, title: 'Duty of liquidator to call general meeting at end of each year' },
          { num: 353, title: 'Dissolution of company' },
          { num: 354, title: 'Delegation by liquidator of his powers' },
          { num: 355, title: 'Appointment by Tribunal of liquidator in voluntary winding up' },
          { num: 356, title: 'Power of Tribunal to appoint and remove liquidator in voluntary winding up' },
          { num: 357, title: 'Costs of voluntary winding up' },
          { num: 358, title: 'Saving of rights of creditors and contributories' },
          { num: 359, title: 'Appointment of Official Liquidator' },
          { num: 360, title: 'Powers and functions of Official Liquidator' },
          { num: 361, title: 'Summary procedure for liquidation' },
          { num: 362, title: 'Exclusion of certain time in computing period of limitation' },
          { num: 363, title: 'Penalty for failure to comply with this Act' },
          { num: 364, title: 'Directions on report of Official Liquidator' },
          { num: 365, title: 'Returns by liquidator' },
        ]
      },
      {
        num: 21, title: 'Companies Authorised to Register under this Act',
        sections: [
          { num: 366, title: 'Companies capable of being registered' },
          { num: 367, title: 'Requirements for registration of companies' },
          { num: 368, title: 'Vesting of property on registration' },
          { num: 369, title: 'Saving of existing liabilities' },
          { num: 370, title: 'Suits to be continued as before' },
          { num: 371, title: 'Effect of registration under this Part' },
          { num: 372, title: 'Power of Court to stay or restrain proceedings' },
          { num: 373, title: 'Suits stayed on winding up order' },
          { num: 374, title: 'Obligations of companies registering under this Part' },
          { num: 375, title: 'Power to substitute memorandum and articles for deed of settlement' },
          { num: 376, title: 'Power of Court to grant relief in certain cases' },
          { num: 377, title: 'Saving for pending suits, etc.' },
          { num: 378, title: 'Part IIIA – Application for registration of producer companies under Part IXA of Companies Act 1956' },
        ]
      },
      {
        num: 22, title: 'Companies Incorporated Outside India',
        sections: [
          { num: 379, title: 'Application of Act to foreign companies' },
          { num: 380, title: 'Documents, etc., to be delivered to Registrar by foreign companies' },
          { num: 381, title: 'Accounts of foreign company' },
          { num: 382, title: 'Display of name, etc., of foreign company' },
          { num: 383, title: 'Service on foreign company' },
          { num: 384, title: 'Debentures, annual return, registration of charges, books of account and their inspection' },
          { num: 385, title: 'Fee for registration of documents' },
          { num: 386, title: 'Interpretation' },
          { num: 387, title: 'Dating of prospectus and particulars to be contained therein' },
          { num: 388, title: 'Registration of prospectus' },
          { num: 389, title: 'Penalty for contravention' },
          { num: 390, title: 'Provisions of this Chapter to apply to insurance companies' },
          { num: 391, title: 'Application of sections 34 to 36 to issue of prospectus in India by foreign companies' },
          { num: 392, title: 'Punishment for contravention' },
          { num: 393, title: 'Company\'s failure to comply with provisions of this Chapter not to affect validity of contracts, etc.' },
        ]
      },
      {
        num: 23, title: 'Government Companies',
        sections: [
          { num: 394, title: 'Annual reports on Government companies' },
        ]
      },
      {
        num: 24, title: 'Registration Offices and Fees',
        sections: [
          { num: 395, title: 'Registry offices' },
          { num: 396, title: 'Admissibility of copies of instruments as evidence' },
          { num: 397, title: 'Inspection, production and evidence of documents kept by Registrar' },
          { num: 398, title: 'Provisions relating to filing of applications, documents, inspection, etc., in electronic form' },
          { num: 399, title: 'Inspection, etc., of registers, returns, etc., filed with Registrar' },
          { num: 400, title: 'Electronic form to be exclusive' },
          { num: 401, title: 'Application of provisions of this Act to documents and proceedings' },
          { num: 402, title: 'Destruction of old records' },
          { num: 403, title: 'Fee for filing, etc.' },
          { num: 404, title: 'Fees in case of delay' },
        ]
      },
      {
        num: 25, title: 'Companies to Furnish Information or Statistics',
        sections: [
          { num: 405, title: 'Power of Central Government to direct companies to furnish information or statistics' },
          { num: 406, title: 'Nidhi companies' },
        ]
      },
      {
        num: 26, title: 'Nidhis',
        sections: [
          { num: 406, title: 'Power of Central Government to notify Nidhis' },
        ]
      },
      {
        num: 27, title: 'National Company Law Tribunal and Appellate Tribunal',
        sections: [
          { num: 407, title: 'Definitions' },
          { num: 408, title: 'Constitution of National Company Law Tribunal' },
          { num: 409, title: 'Qualifications of President and Members of Tribunal' },
          { num: 410, title: 'Constitution of Appellate Tribunal' },
          { num: 411, title: 'Qualifications of Chairperson and Members of Appellate Tribunal' },
          { num: 412, title: 'Selection of Members of Tribunal and Appellate Tribunal' },
          { num: 413, title: 'Term of office of President, Chairperson and other Members' },
          { num: 414, title: 'Salary, allowances and other terms and conditions of service of Members' },
          { num: 415, title: 'Acting President of Appellate Tribunal' },
          { num: 416, title: 'Resignation of Members' },
          { num: 417, title: 'Removal of Members' },
          { num: 418, title: 'Member to act as President of Appellate Tribunal in certain circumstances' },
          { num: 419, title: 'Benches of Tribunal' },
          { num: 420, title: 'Orders of Tribunal' },
          { num: 421, title: 'Appeal from orders of Tribunal' },
          { num: 422, title: 'Expeditious disposal by Tribunal and Appellate Tribunal' },
          { num: 423, title: 'Civil court not to have jurisdiction' },
          { num: 424, title: 'Procedure before Tribunal and Appellate Tribunal' },
          { num: 425, title: 'Power to punish for contempt' },
          { num: 426, title: 'Delegation of powers' },
          { num: 427, title: 'Registrar and officers of Tribunal and Appellate Tribunal' },
          { num: 428, title: 'Appeals to Supreme Court' },
          { num: 429, title: 'Exclusion of time in computing period of limitation' },
          { num: 430, title: 'Civil court not to have jurisdiction' },
          { num: 431, title: 'Memorandum of appeal' },
          { num: 432, title: 'Right to legal representation' },
          { num: 433, title: 'Limitation' },
          { num: 434, title: 'Transfer of certain pending proceedings' },
        ]
      },
      {
        num: 28, title: 'Special Courts',
        sections: [
          { num: 435, title: 'Establishment of Special Courts' },
          { num: 436, title: 'Offences triable by Special Courts' },
          { num: 437, title: 'Appeal and revision' },
          { num: 438, title: 'Application of Code to proceedings before Special Court' },
          { num: 439, title: 'Offences to be non-cognizable' },
          { num: 440, title: 'Transitional provisions' },
          { num: 441, title: 'Compounding of certain offences' },
          { num: 442, title: 'Mediation and Conciliation Panel' },
          { num: 443, title: 'Power of court to grant relief in certain cases' },
          { num: 444, title: 'Application of fines' },
          { num: 445, title: 'Penalty where no specific penalty or punishment is provided' },
          { num: 446, title: 'Members, officers, etc., of companies to be public servants' },
          { num: '446A', title: 'Factors for determining level of punishment' },
          { num: '446B', title: 'Lesser penalties for certain companies' },
        ]
      },
      {
        num: 29, title: 'Miscellaneous',
        sections: [
          { num: 447, title: 'Punishment for fraud' },
          { num: 448, title: 'Punishment for false statement' },
          { num: 449, title: 'Punishment for false evidence' },
          { num: 450, title: 'Punishment where no specific penalty or punishment is provided' },
          { num: 451, title: 'Punishment in case of repeated default' },
          { num: 452, title: 'Punishment for wrongful withholding of property' },
          { num: 453, title: 'Punishment for improper use of "Limited" or "Private Limited"' },
          { num: 454, title: 'Adjudication of penalties' },
          { num: '454A', title: 'Penalty for repeated default' },
          { num: 455, title: 'Dormant company' },
          { num: 456, title: 'Protection of action taken in good faith' },
          { num: 457, title: 'Non-disclosure of information in certain cases' },
          { num: 458, title: 'Delegation by Central Government of its powers and functions' },
          { num: 459, title: 'Powers of Central Government or Tribunal to accord approval, etc., subject to conditions and to prescribe fees on applications' },
          { num: 460, title: 'Condonation of delay in certain cases' },
          { num: 461, title: 'Annual report by Central Government' },
          { num: 462, title: 'Power to exempt class or classes of companies from provisions of this Act' },
          { num: 463, title: 'Power of court to grant relief in certain cases' },
          { num: 464, title: 'Prohibition of association or partnership of persons exceeding certain number' },
          { num: 465, title: 'Repeal of certain enactments and savings' },
          { num: 466, title: 'Dissolution of Company Law Board' },
          { num: 467, title: 'Power to amend Schedules' },
          { num: 468, title: 'Powers of Central Government to make rules relating to winding up' },
          { num: 469, title: 'Power of Central Government to make rules' },
          { num: 470, title: 'Power to remove difficulties' },
        ]
      },
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SEBI (LODR) REGULATIONS, 2015  |  11 Chapters + Schedules
  // ══════════════════════════════════════════════════════════════════════════
  'sebi-lodr-2015': {
    title: 'SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015',
    shortTitle: 'SEBI LODR',
    totalChapters: 11,
    chapters: [
      {
        num: 1, title: 'Preliminary',
        sections: [
          { num: 1, title: 'Short title and commencement' },
          { num: 2, title: 'Definitions' },
        ]
      },
      {
        num: 2, title: 'Principles Governing Disclosures and Obligations',
        sections: [
          { num: 3, title: 'Principles of disclosure and obligations — overarching framework' },
          { num: 4, title: 'Principles governing disclosures and obligations of a listed entity' },
          { num: 5, title: 'Obligations of a listed entity' },
          { num: 6, title: 'Obligation to appoint a compliance officer' },
        ]
      },
      {
        num: 3, title: 'Corporate Governance',
        sections: [
          { num: 7, title: 'Appointment of share transfer agent' },
          { num: 8, title: 'Statement of deviation(s) or variation(s)' },
          { num: 9, title: 'Preservation of documents' },
          { num: 10, title: 'Filings on stock exchange(s)' },
          { num: 11, title: 'Manner of filings' },
          { num: 12, title: 'Dividend and interest' },
          { num: 13, title: 'Grievance redressal mechanism' },
          { num: 14, title: 'Compliance with corporate governance requirements specified in regulation 17 to 27' },
          { num: 15, title: 'Applicability of corporate governance requirements' },
          { num: 16, title: 'Definitions — corporate governance provisions' },
          { num: 17, title: 'Board of Directors' },
          { num: '17A', title: 'Maximum number of directorships' },
          { num: 18, title: 'Audit committee' },
          { num: 19, title: 'Nomination and remuneration committee' },
          { num: 20, title: 'Risk management committee' },
          { num: 21, title: 'Stakeholders relationship committee' },
          { num: 22, title: 'Vigil mechanism' },
          { num: 23, title: 'Related party transactions' },
          { num: 24, title: 'Corporate governance requirements with respect to subsidiary of listed entity' },
          { num: '24A', title: 'Secretarial audit' },
          { num: 25, title: 'Obligations with respect to independent directors' },
          { num: 26, title: 'Obligations with respect to directors and senior management' },
          { num: 27, title: 'Other corporate governance requirements' },
        ]
      },
      {
        num: 4, title: 'Obligations of Listed Entity — Specified Securities',
        sections: [
          { num: 28, title: 'Conditions of listing' },
          { num: 29, title: 'Prior intimations' },
          { num: 30, title: 'Disclosure of events or information' },
          { num: 31, title: 'Holding of specified securities and shareholding pattern' },
          { num: 32, title: 'Statements of deviation(s) or variation(s) in use of funds raised through public issue, rights issue, etc.' },
          { num: 33, title: 'Financial results' },
          { num: 34, title: 'Annual report' },
          { num: 35, title: 'Website' },
          { num: 36, title: 'Documents and information to be provided to stock exchange' },
          { num: 37, title: 'Draft scheme of arrangement' },
          { num: 38, title: 'Conformity with listing agreement' },
          { num: 39, title: 'Issuance of certificates or receipts/letters/advices for securities and dealing with unclaimed securities' },
          { num: 40, title: 'Transfer or transmission or transposition of securities' },
          { num: 41, title: 'Voting by shareholders' },
          { num: 42, title: 'Record date or date of closure of transfer books' },
          { num: 43, title: 'Dividends' },
          { num: '43A', title: 'Distribution policy' },
          { num: 44, title: 'Meetings of shareholders and voting' },
          { num: 45, title: 'Trading window' },
          { num: 46, title: 'Website' },
          { num: 47, title: 'Advertisement in newspapers' },
        ]
      },
      {
        num: 5, title: 'Obligations of Listed Entity — Non-Convertible Securities',
        sections: [
          { num: 48, title: 'Conditions of listing of non-convertible securities' },
          { num: 49, title: 'Prior intimations — non-convertible' },
          { num: 50, title: 'Disclosure of events or information — non-convertible' },
          { num: 51, title: 'Financial results — non-convertible' },
          { num: 52, title: 'Annual report — non-convertible' },
          { num: 53, title: 'Documents and information to be submitted to stock exchange' },
          { num: 54, title: 'Website — non-convertible' },
          { num: 55, title: 'Asset cover for secured non-convertible debt securities' },
          { num: 56, title: 'Debenture trustee' },
          { num: 57, title: 'Payment of interest or redemption amount' },
          { num: 58, title: 'Execution of agreement with stock exchange' },
          { num: 59, title: 'Appointment of compliance officer — non-convertible' },
          { num: 60, title: 'Obligations of listed entity' },
        ]
      },
      {
        num: 6, title: 'Obligations — Indian Depository Receipts',
        sections: [
          { num: 61, title: 'Conditions of listing of Indian depository receipts' },
          { num: 62, title: 'Filing of information with stock exchange — IDR' },
          { num: 63, title: 'Financial results — IDR' },
          { num: 64, title: 'Annual report — IDR' },
          { num: 65, title: 'Disclosures — IDR' },
          { num: 66, title: 'Obligations of domestic custodian' },
          { num: 67, title: 'Obligations of depository — IDR' },
          { num: 68, title: 'Other obligations — IDR' },
        ]
      },
      {
        num: 7, title: 'Obligations — Securitised Debt Instruments',
        sections: [
          { num: 69, title: 'Conditions for listing of securitised debt instruments' },
          { num: 70, title: 'Prior intimation — securitised' },
          { num: 71, title: 'Periodic disclosures — securitised' },
          { num: 72, title: 'Financial results — securitised' },
          { num: 73, title: 'Documents to stock exchange — securitised' },
          { num: 74, title: 'Website — securitised' },
          { num: 75, title: 'Obligations of servicer' },
          { num: 76, title: 'Obligations of trustee — securitised' },
        ]
      },
      {
        num: 8, title: 'Obligations — Security Receipts',
        sections: [
          { num: 77, title: 'Conditions of listing — security receipts' },
          { num: 78, title: 'Prior intimation — security receipts' },
          { num: 79, title: 'Disclosures — security receipts' },
          { num: 80, title: 'Financial results — security receipts' },
          { num: 81, title: 'Annual report — security receipts' },
          { num: 82, title: 'Obligations of trustee — security receipts' },
        ]
      },
      {
        num: 9, title: 'Obligations — Municipal Debt Securities',
        sections: [
          { num: 83, title: 'Conditions of listing — municipal debt' },
          { num: 84, title: 'Disclosures — municipal debt' },
          { num: 85, title: 'Financial results — municipal debt' },
          { num: 86, title: 'Annual report — municipal debt' },
          { num: 87, title: 'Documents to stock exchange — municipal debt' },
          { num: 88, title: 'Obligations of listed entity — municipal debt' },
        ]
      },
      {
        num: 10, title: 'Obligations — Commercial Paper',
        sections: [
          { num: 89, title: 'Conditions of listing — commercial paper' },
          { num: 90, title: 'Prior intimation — commercial paper' },
          { num: 91, title: 'Disclosures — commercial paper' },
          { num: 92, title: 'Obligations of listed entity — commercial paper' },
        ]
      },
      {
        num: 11, title: 'Miscellaneous',
        sections: [
          { num: 93, title: 'Preservation of documents' },
          { num: 94, title: 'Liability of listed entity for acts of its intermediary' },
          { num: 95, title: 'Reporting of violations' },
          { num: 96, title: 'Action against listed entity for non-compliance' },
          { num: 97, title: 'Relaxation of requirements and clarifications' },
          { num: 98, title: 'Removal of difficulties' },
          { num: 99, title: 'Repeal and savings' },
          { num: 100, title: 'Power to call for information' },
          { num: 101, title: 'Amendment to the Securities and Exchange Board of India Act, 1992' },
        ]
      },
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FEMA, 1999  |  7 Chapters
  // ══════════════════════════════════════════════════════════════════════════
  'fema-1999': {
    title: 'Foreign Exchange Management Act, 1999',
    shortTitle: 'FEMA',
    totalChapters: 7,
    chapters: [
      {
        num: 1, title: 'Preliminary',
        sections: [
          { num: 1, title: 'Short title, extent, application and commencement' },
          { num: 2, title: 'Definitions' },
        ]
      },
      {
        num: 2, title: 'Regulation and Management of Foreign Exchange',
        sections: [
          { num: 3, title: 'Dealing in foreign exchange, etc.' },
          { num: 4, title: 'Holding of foreign exchange, etc.' },
          { num: 5, title: 'Current account transactions' },
          { num: 6, title: 'Capital account transactions' },
          { num: 7, title: 'Export of goods and services' },
          { num: 8, title: 'Realisation and repatriation of foreign exchange' },
          { num: 9, title: 'Exemption from realisation and repatriation in certain cases' },
        ]
      },
      {
        num: 3, title: 'Authorised Person',
        sections: [
          { num: 10, title: 'Authorised person' },
          { num: 11, title: 'Reserve Bank\'s power to issue directions to authorised person' },
          { num: 12, title: 'Reserve Bank\'s power to inspect authorised person' },
        ]
      },
      {
        num: 4, title: 'Contravention and Penalties',
        sections: [
          { num: 13, title: 'Penalties' },
          { num: 14, title: 'Enforcement of the orders of Adjudicating Authority' },
          { num: 15, title: 'Power to compound contravention' },
        ]
      },
      {
        num: 5, title: 'Adjudication and Appeals',
        sections: [
          { num: 16, title: 'Appointment of Adjudicating Authorities' },
          { num: 17, title: 'Appeal to Special Director (Appeals)' },
          { num: 18, title: 'Establishment of Appellate Tribunal for Foreign Exchange' },
          { num: 19, title: 'Appeals to Appellate Tribunal' },
          { num: 20, title: 'Composition of Appellate Tribunal' },
          { num: 21, title: 'Qualifications for appointment of Chairperson and Members' },
          { num: 22, title: 'Term of office' },
          { num: 23, title: 'Staff of Appellate Tribunal' },
          { num: 24, title: 'Salary, allowances and other conditions of service of Chairperson and Members' },
          { num: 25, title: 'Resignation and removal' },
          { num: 26, title: 'Member of Appellate Tribunal acting as Chairperson' },
          { num: 27, title: 'Restriction on employment of Chairperson or other Members on retirement, etc.' },
          { num: 28, title: 'Procedure and powers of Appellate Tribunal' },
          { num: 29, title: 'Distribution of business amongst Benches' },
          { num: 30, title: 'Power of Chairperson to transfer cases' },
          { num: 31, title: 'Decisions to be by majority' },
          { num: 32, title: 'Right of appellant to take assistance of legal practitioner' },
          { num: 33, title: 'Limitation' },
          { num: 34, title: 'Civil court not to have jurisdiction' },
          { num: 35, title: 'Appeal to High Court' },
        ]
      },
      {
        num: 6, title: 'Directorate of Enforcement',
        sections: [
          { num: 36, title: 'Directorate of Enforcement' },
          { num: 37, title: 'Powers of Directorate of Enforcement and other officers' },
          { num: '37A', title: 'Power of Central Government to issue directions in public interest' },
          { num: 38, title: 'Obligation of banks and financial institutions' },
        ]
      },
      {
        num: 7, title: 'Miscellaneous',
        sections: [
          { num: 39, title: 'Voidance of transactions' },
          { num: 40, title: 'Exclusion of certain Acts' },
          { num: 41, title: 'Application of other laws not barred' },
          { num: 42, title: 'Recovery of arrears of penalty' },
          { num: 43, title: 'Bar of suits in civil courts' },
          { num: 44, title: 'Offences by companies' },
          { num: 45, title: 'Presumption of culpable mental state' },
          { num: 46, title: 'Power of Central Government to make rules' },
          { num: 47, title: 'Power of Reserve Bank to make regulations' },
          { num: 48, title: 'Laying of rules and regulations before Parliament' },
          { num: 49, title: 'Repeal and savings' },
        ]
      },
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // INSOLVENCY AND BANKRUPTCY CODE, 2016  |  5 Parts
  // ══════════════════════════════════════════════════════════════════════════
  'ibc-2016': {
    title: 'Insolvency and Bankruptcy Code, 2016',
    shortTitle: 'IBC',
    totalChapters: 5,
    chapters: [
      {
        num: 1, title: 'Part I — Preliminary',
        sections: [
          { num: 1, title: 'Short title, extent and commencement' },
          { num: 2, title: 'Application' },
          { num: 3, title: 'Definitions' },
        ]
      },
      {
        num: 2, title: 'Part II — Corporate Insolvency Resolution and Liquidation',
        sections: [
          { num: 4, title: 'Application of this Part (minimum default amount)' },
          { num: 5, title: 'Definitions for corporate insolvency' },
          { num: 6, title: 'Persons who may initiate corporate insolvency resolution process' },
          { num: 7, title: 'Initiation of corporate insolvency resolution process by financial creditor' },
          { num: 8, title: 'Insolvency resolution by operational creditor' },
          { num: 9, title: 'Application for initiation of corporate insolvency resolution process by operational creditor' },
          { num: 10, title: 'Initiation of corporate insolvency resolution process by corporate applicant' },
          { num: 11, title: 'Persons not entitled to make application' },
          { num: 12, title: 'Time-limit for completion of insolvency resolution process' },
          { num: '12A', title: 'Withdrawal of application admitted under sections 7, 9 or 10' },
          { num: 13, title: 'Declaration of moratorium and public announcement' },
          { num: 14, title: 'Moratorium' },
          { num: 15, title: 'Public announcement of corporate insolvency resolution process' },
          { num: 16, title: 'Appointment and tenure of interim resolution professional' },
          { num: 17, title: 'Management of affairs of corporate debtor by interim resolution professional' },
          { num: 18, title: 'Duties of interim resolution professional' },
          { num: 19, title: 'Personnel to extend co-operation to interim resolution professional' },
          { num: 20, title: 'Management of operations of corporate debtor as going concern' },
          { num: 21, title: 'Committee of creditors' },
          { num: 22, title: 'Appointment of resolution professional' },
          { num: 23, title: 'Resolution professional to conduct corporate insolvency resolution process' },
          { num: 24, title: 'Meeting of committee of creditors' },
          { num: 25, title: 'Duties of resolution professional' },
          { num: '25A', title: 'Rights and duties of authorised representative of financial creditors' },
          { num: 26, title: 'Application for avoidance of transactions not to affect proceedings' },
          { num: 27, title: 'Replacement of resolution professional by committee of creditors' },
          { num: 28, title: 'Approval of committee of creditors for certain actions' },
          { num: 29, title: 'Preparation of information memorandum' },
          { num: '29A', title: 'Persons not eligible to be resolution applicant' },
          { num: 30, title: 'Submission of resolution plan' },
          { num: 31, title: 'Approval of resolution plan' },
          { num: 32, title: 'Appeal against order relating to resolution plan' },
          { num: '32A', title: 'Liability for prior offences, etc.' },
          { num: 33, title: 'Initiation of liquidation' },
          { num: 34, title: 'Appointment of liquidator and fee to be paid' },
          { num: 35, title: 'Powers and duties of liquidator' },
          { num: 36, title: 'Liquidation estate' },
          { num: 37, title: 'Powers of liquidator to access information' },
          { num: 38, title: 'Consolidation of claims' },
          { num: 39, title: 'Verification of claims' },
          { num: 40, title: 'Admission or rejection of claims' },
          { num: 41, title: 'Proofs of claim for operational creditors' },
          { num: 42, title: 'Appeal against decision of liquidator' },
          { num: 43, title: 'Preferential transactions and relevant time' },
          { num: 44, title: 'Orders in case of preferential transactions' },
          { num: 45, title: 'Avoidable transactions' },
          { num: 46, title: 'Relevant period for avoidable transactions' },
          { num: 47, title: 'Orders in case of undervalued transactions' },
          { num: 48, title: 'Extortionate credit transactions' },
          { num: 49, title: 'Orders in case of extortionate credit transactions' },
          { num: 50, title: 'Fraudulent trading or wrongful trading' },
          { num: 51, title: 'Orders where company has traded fraudulently, etc.' },
          { num: 52, title: 'Secured creditor in liquidation proceedings' },
          { num: 53, title: 'Distribution of assets' },
          { num: 54, title: 'Dissolution of corporate debtor' },
          { num: '54A', title: 'Eligibility for pre-packaged insolvency resolution process' },
          { num: '54B', title: 'Persons not eligible to apply for or be part of pre-packaged insolvency resolution process' },
          { num: '54C', title: 'Pre-packaged insolvency resolution commencement date' },
          { num: '54D', title: 'Time-limit for completion of pre-packaged insolvency resolution process' },
          { num: '54E', title: 'Declaration of moratorium and public announcement — PPIRP' },
          { num: '54F', title: 'Management of affairs of corporate debtor — PPIRP' },
          { num: '54G', title: 'Appointment of resolution professional — PPIRP' },
          { num: '54H', title: 'Duties and powers of resolution professional — PPIRP' },
          { num: '54I', title: 'Committee of creditors — PPIRP' },
          { num: '54J', title: 'Consideration of base resolution plan' },
          { num: '54K', title: 'Approval or rejection of resolution plan — PPIRP' },
          { num: '54L', title: 'Termination of pre-packaged insolvency resolution process' },
          { num: '54M', title: 'Costs during pre-packaged insolvency resolution process' },
          { num: '54N', title: 'Application for PPIRP — not to affect other proceedings' },
          { num: 55, title: 'Fast track corporate insolvency resolution process' },
          { num: 56, title: 'Eligible corporate debtors' },
          { num: 57, title: 'Process — fast track' },
          { num: 58, title: 'Time-limit for completion — fast track' },
          { num: 59, title: 'Voluntary liquidation of corporate persons' },
          { num: 60, title: 'Adjudicating Authority for corporate persons' },
          { num: 61, title: 'Appeals and Appellate Authority' },
          { num: 62, title: 'Appeal to Supreme Court' },
          { num: 63, title: 'Civil court not to have jurisdiction' },
          { num: 64, title: 'Expeditious disposal of applications' },
          { num: 65, title: 'Fraudulent or malicious initiation of proceedings' },
          { num: 66, title: 'Fraudulent trading or wrongful trading — further provision' },
          { num: 67, title: 'Proceedings against resolution professional or liquidator' },
          { num: 68, title: 'Punishment for certain offences' },
          { num: 69, title: 'Punishment for offences related to transactions defrauding creditors' },
          { num: 70, title: 'Punishment for concealment of property' },
          { num: 71, title: 'Punishment for misconduct in course of corporate insolvency resolution process' },
          { num: 72, title: 'Punishment for falsification of books of corporate debtor' },
          { num: 73, title: 'Punishment for wilful and material omissions from statements relating to affairs of corporate debtor' },
          { num: 74, title: 'Punishment for false representations to creditors' },
          { num: 75, title: 'Punishment for false information furnished in application' },
          { num: 76, title: 'Punishment for non-disclosure of dispute or repayment of debt by operational creditor' },
          { num: 77, title: 'Punishment for contravention of moratorium or the resolution plan' },
        ]
      },
      {
        num: 3, title: 'Part III — Individual and Partnership Firm Insolvency',
        sections: [
          { num: 78, title: 'Application of this Part' },
          { num: 79, title: 'Definitions for individual/partnership insolvency' },
          { num: 80, title: 'Persons who may apply' },
          { num: 81, title: 'Application by debtor' },
          { num: 82, title: 'Application by creditor' },
          { num: 83, title: 'Application — Debt Recovery Tribunal' },
          { num: 84, title: 'Order on application' },
          { num: 85, title: 'Moratorium order' },
          { num: 86, title: 'Appointment of resolution professional — individual' },
          { num: 87, title: 'Processing of application' },
          { num: 88, title: 'Repayment plan' },
          { num: 89, title: 'Meeting of creditors to consider repayment plan' },
          { num: 90, title: 'Approval of repayment plan' },
          { num: 91, title: 'Effect of approval' },
          { num: 92, title: 'Completion of repayment plan' },
          { num: 93, title: 'Effect of automatic stay' },
          { num: 94, title: 'Application by debtor — bankruptcy' },
          { num: 95, title: 'Application by creditor — bankruptcy' },
          { num: 96, title: 'Interim moratorium — bankruptcy' },
          { num: 97, title: 'Appointment of resolution professional — bankruptcy' },
          { num: 98, title: 'Replacement of resolution professional — bankruptcy' },
          { num: 99, title: 'Submission of report by resolution professional' },
          { num: 100, title: 'Admission or rejection of application' },
          { num: 101, title: 'Moratorium order — bankruptcy' },
          { num: 102, title: 'Public announcement — bankruptcy' },
          { num: 103, title: 'Bankruptcy trustee' },
          { num: 104, title: 'Eligibility of bankruptcy trustee' },
          { num: 105, title: 'Estate of bankrupt' },
          { num: 106, title: 'Assets of the bankrupt not subject to the estate' },
          { num: 107, title: 'Relation back of bankruptcy' },
          { num: 108, title: 'Voidable transactions — individual bankruptcy' },
          { num: 109, title: 'Extortionate credit transactions — individual' },
          { num: 110, title: 'Duties of bankrupt' },
          { num: 111, title: 'Vesting of estate in bankruptcy trustee' },
          { num: 112, title: 'Administration of estate of bankrupt' },
          { num: 113, title: 'Proof of debts' },
          { num: 114, title: 'Secured creditors — individual bankruptcy' },
          { num: 115, title: 'Distribution of property of bankrupt' },
          { num: 116, title: 'Priority of creditors — individual bankruptcy' },
          { num: 117, title: 'Meeting of creditors — individual bankruptcy' },
          { num: 118, title: 'Rights of creditors — individual bankruptcy' },
          { num: 119, title: 'Discharge from bankruptcy' },
          { num: 120, title: 'Effect of discharge' },
          { num: 121, title: 'Annulment of bankruptcy order' },
          { num: 122, title: 'Adjudicating Authority — individual insolvency' },
          { num: 123, title: 'Appeals — individual insolvency' },
          { num: 124, title: 'Offences and penalties — individual' },
          { num: 125, title: 'Discharge — debts' },
          { num: 126, title: 'Qualification of insolvency professional as bankruptcy trustee' },
          { num: 127, title: 'Appointment of official assignee' },
          { num: 128, title: 'Estate of bankrupt vested in official assignee' },
          { num: 129, title: 'Powers of official assignee' },
          { num: 130, title: 'Information memorandum — individual' },
          { num: 131, title: 'Fresh start process — eligibility' },
          { num: 132, title: 'Application — fresh start process' },
          { num: 133, title: 'Processing of fresh start application' },
          { num: 134, title: 'Report on fresh start application' },
          { num: 135, title: 'Admission of application — fresh start' },
          { num: 136, title: 'Effect of admission — fresh start' },
          { num: 137, title: 'Objection to fresh start order' },
          { num: 138, title: 'Fresh start order' },
          { num: 139, title: 'Restriction on fresh start process' },
          { num: 140, title: 'Discharge under fresh start process' },
          { num: 141, title: 'Disqualification upon order of bankruptcy' },
          { num: 142, title: 'Qualification after discharge' },
          { num: 143, title: 'Partnership firms' },
          { num: 144, title: 'Application of Part III to partnership firms' },
          { num: 145, title: 'Petitions against individual partners' },
          { num: 146, title: 'Where joint and separate properties' },
          { num: 147, title: 'Priority of partnership creditors' },
          { num: 148, title: 'Partners acting as trustees' },
          { num: 149, title: 'Joint and separate dividends' },
          { num: 150, title: 'Arrangement for settlement of partnership debts' },
          { num: 151, title: 'Bankruptcy of one partner' },
          { num: 152, title: 'Dissolution of firm' },
          { num: 153, title: 'Jurisdiction — debt recovery tribunal' },
          { num: 154, title: 'Fast track insolvency resolution — individual' },
          { num: 155, title: 'Reference of case to mediation' },
          { num: 156, title: 'Interim moratorium — individual resolution' },
          { num: 157, title: 'Effect of interim moratorium' },
          { num: 158, title: 'Committee of creditors — individual' },
          { num: 159, title: 'Powers of committee of creditors' },
          { num: 160, title: 'Approval of resolution plan — individual' },
          { num: 161, title: 'Implementation of resolution plan — individual' },
          { num: 162, title: 'Fraudulent trading — individual' },
          { num: 163, title: 'Wrongful trading — individual' },
          { num: 164, title: 'Orders — wrongful trading, individual' },
          { num: 165, title: 'Concealment of property' },
          { num: 166, title: 'Fraudulent disposition — individual' },
          { num: 167, title: 'Absconding' },
          { num: 168, title: 'Falsification of books' },
          { num: 169, title: 'False statements' },
          { num: 170, title: 'Fraudulent obtaining of credit' },
          { num: 171, title: 'Transactions in fraud of creditors — individual' },
          { num: 172, title: 'Misconduct in course of fresh start or insolvency resolution' },
          { num: 173, title: 'Non-disclosure' },
          { num: 174, title: 'Punishment for offences — individual' },
          { num: 175, title: 'Jurisdiction of court' },
          { num: 176, title: 'Application of Limitation Act' },
          { num: 177, title: 'Transfer of pending proceedings — individual' },
          { num: 178, title: 'Official assignee of High Court' },
          { num: 179, title: 'Officers of Debt Recovery Tribunal' },
          { num: 180, title: 'Schedule — Debt Recovery Tribunal' },
          { num: 181, title: 'Special provisions' },
          { num: 182, title: 'Non-applicability of individual insolvency to financial firms' },
          { num: 183, title: 'Savings — individual' },
          { num: 184, title: 'Coordination among adjudicating authorities' },
          { num: 185, title: 'Amendment to the Presidency Towns Insolvency Act, 1909' },
          { num: 186, title: 'Amendment to the Provincial Insolvency Act, 1920' },
          { num: 187, title: 'Transitional arrangements' },
        ]
      },
      {
        num: 4, title: 'Part IV — Regulation of Insolvency Professionals, Agencies and Information Utilities',
        sections: [
          { num: 188, title: 'Definitions — Part IV' },
          { num: 189, title: 'Insolvency and Bankruptcy Board of India' },
          { num: 190, title: 'Management of Board' },
          { num: 191, title: 'Term of office' },
          { num: 192, title: 'Removal from office' },
          { num: 193, title: 'Meetings of Board' },
          { num: 194, title: 'Vacancies, etc., not to invalidate proceedings of Board' },
          { num: 195, title: 'Member not to participate in proceedings in which he is interested' },
          { num: 196, title: 'Powers and functions of Board' },
          { num: 197, title: 'Registration of insolvency professional agency' },
          { num: 198, title: 'Cancellation of registration — insolvency professional agency' },
          { num: 199, title: 'Registration of insolvency professional' },
          { num: 200, title: 'Conditions and requirements for registration — IP' },
          { num: 201, title: 'Cancellation of registration — IP' },
          { num: 202, title: 'Registration of information utilities' },
          { num: 203, title: 'Cancellation of registration — IU' },
          { num: 204, title: 'Functions of insolvency professional agency' },
          { num: 205, title: 'Obligations of insolvency professional agencies' },
          { num: 206, title: 'Enrolment with insolvency professional agency' },
          { num: 207, title: 'Functions and obligations of insolvency professionals' },
          { num: 208, title: 'Functions of information utilities' },
          { num: 209, title: 'Core services of information utilities' },
          { num: 210, title: 'Obligations of information utilities' },
          { num: 211, title: 'Access to records held by information utility' },
          { num: 212, title: 'Inspection and investigation of insolvency professional agencies' },
          { num: 213, title: 'Inspection and investigation of insolvency professionals' },
          { num: 214, title: 'Inspection and investigation of information utilities' },
          { num: 215, title: 'Power of the Board to issue directions' },
          { num: 216, title: 'Power of Board to impose penalty' },
          { num: 217, title: 'Recovery of amounts' },
          { num: 218, title: 'Appeal from orders of the Board' },
          { num: 219, title: 'Civil court not to have jurisdiction' },
          { num: 220, title: 'Finance of Board' },
          { num: 221, title: 'Accounts and audit of Board' },
          { num: 222, title: 'Annual report of Board' },
          { num: 223, title: 'Power of Central Government over Board' },
        ]
      },
      {
        num: 5, title: 'Part V — Miscellaneous',
        sections: [
          { num: 224, title: 'Power to amend Schedule' },
          { num: 225, title: 'Insolvency Law Committee' },
          { num: 226, title: 'Application of Code not to affect certain proceedings' },
          { num: 227, title: 'Power of Central Government to notify financial service providers' },
          { num: 228, title: 'Central Government to prescribe rules and regulations' },
          { num: 229, title: 'Power of Central Government to make rules' },
          { num: 230, title: 'Power of Board to make regulations' },
          { num: 231, title: 'Bar of jurisdiction' },
          { num: 232, title: 'Limitation' },
          { num: 233, title: 'Act to have overriding effect' },
          { num: 234, title: 'Agreement with foreign countries' },
          { num: 235, title: 'Letter of request to a court in a foreign country' },
          { num: '235A', title: 'Punishment for contravention where no specific penalty or punishment is provided' },
          { num: 236, title: 'Offences to be non-cognizable' },
          { num: 237, title: 'Protection of action taken in good faith' },
          { num: 238, title: 'Provisions of Code to override other laws' },
          { num: '238A', title: 'Limitation' },
          { num: 239, title: 'Amendment of certain enactments' },
          { num: 240, title: 'Amendment of the Companies Act, 2013' },
          { num: '240A', title: 'Application of Code to micro, small and medium enterprises' },
          { num: 241, title: 'Power to remove difficulties' },
          { num: 242, title: 'Repeal and saving' },
          { num: 243, title: 'Transitional provisions' },
          { num: 244, title: 'Saving of certain powers under RDDBFI Act' },
          { num: 245, title: 'Saving — action against directors, etc.' },
          { num: 246, title: 'Saving — winding up orders' },
          { num: 247, title: 'Saving — schemes' },
          { num: 248, title: 'Continuation of pending proceedings' },
          { num: 249, title: 'Appointment of officers and employees' },
          { num: 250, title: 'Transfer of assets, liabilities, etc.' },
          { num: 251, title: 'Transfer of officers and employees' },
          { num: 252, title: 'Legal proceedings' },
          { num: 253, title: 'Effect of provisions inconsistent with this Code' },
          { num: 254, title: 'Schedule' },
          { num: 255, title: 'Schedules' },
        ]
      },
    ]
  }
};

// Helper: get chapter data for an act
export function getChapter(actSlug, chapterNum) {
  const act = ACTS_DATA[actSlug];
  if (!act) return null;
  return act.chapters.find(c => c.num === chapterNum) || null;
}

// Helper: get sections for a chapter (returns array)
export function getSections(actSlug, chapterNum) {
  const ch = getChapter(actSlug, chapterNum);
  return ch ? ch.sections : [];
}

// Helper: act display name
export function getActName(actSlug) {
  return ACTS_DATA[actSlug]?.title || actSlug;
}
