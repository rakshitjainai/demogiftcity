export const POPULAR_SEARCHES = [
  "IFSCA FME Regulations",
  "IFSCA CMI Regulations",
  "SEBI AIF Regulations",
  "Companies Act 2013",
  "AML/CFT",
  "GIFT City & IFSC Law",
  "Related Party Transactions"
];

export const QUICK_ACCESS_ITEMS = [
  { id: "regulations", label: "Interactive Regulations", icon: "BookOpen", path: "/interactive-regulations", category: "Regulations", color: "emerald", desc: "Browse chapter-wise regulatory content" },
  { id: "learning", label: "Learning & Diagnostics", icon: "GraduationCap", path: "/learning", category: "Learning", color: "blue", desc: "Learn, revise and test yourself" },
  { id: "quizzes", label: "Quizzes", icon: "HelpCircle", path: "/quizzes", category: "Quizzes", color: "amber", desc: "Practice by subject and topic" },
  { id: "templates", label: "Templates & Checklists", icon: "FileText", path: "/templates", category: "Templates", color: "indigo", desc: "Ready-to-use professional resources" },
  { id: "enforcement", label: "Enforcement Orders", icon: "Gavel", path: "/news", category: "Updates", color: "rose", desc: "Study actions and lessons learned" },
  { id: "membership", label: "Membership", icon: "Zap", path: "/membership", category: "Membership", color: "teal", desc: "Unlock the full platform" }
];

export const STATS = [
  { count: "25+", label: "Laws & Regulations Covered", icon: "Scale" },
  { count: "1500+", label: "Interactive Topics Explained", icon: "FileCode" },
  { count: "800+", label: "Practical Articles & Guides", icon: "BookMarked" },
  { count: "500+", label: "Templates & Checklists", icon: "CheckSquare" },
  { count: "10K+", label: "Professionals Trust Us", icon: "Users" }
];

export const LATEST_UPDATES = [
  {
    id: "up-1",
    title: "Aircraft & Ship Leasing in GIFT IFSC",
    author: "CS Prashant Kumar",
    date: "August 10, 2026",
    category: "GIFT City & IFSC Law",
    tagColor: "bg-emerald-100 text-emerald-800",
    summary: "An overview of the regulatory framework for aircraft and ship leasing in GIFT City."
  },
  {
    id: "up-2",
    title: "Singapore Company Setup from India: 2025 Legal & FEMA Guide",
    author: "CS Prashant Kumar",
    date: "August 9, 2026",
    category: "Doing Business in India",
    tagColor: "bg-blue-100 text-blue-800",
    summary: "Step-by-step guide to expanding your Indian business to Singapore under FEMA rules."
  },
  {
    id: "up-3",
    title: "SFAC Schemes and Funding Support for FPOs in India",
    author: "CS Prashant Kumar",
    date: "August 8, 2026",
    category: "Doing Business in India",
    tagColor: "bg-amber-100 text-amber-800",
    summary: "Understanding funding support and structuring for Farmer Producer Organizations."
  },
  {
    id: "up-4",
    title: "Required Documents for Design Registration in India",
    author: "CS Prashant Kumar",
    date: "August 7, 2026",
    category: "IPR",
    tagColor: "bg-purple-100 text-purple-800",
    summary: "A practical checklist for protecting your industrial designs under the Designs Act."
  },
  {
    id: "up-5",
    title: "Difference Between ESOP, Sweat Equity, and Phantom Stock in India",
    author: "CS Prashant Kumar",
    date: "August 6, 2026",
    category: "Startups / ESOP",
    tagColor: "bg-rose-100 text-rose-800",
    summary: "Compare structural differences and tax implications of startup equity compensation methods."
  }
];

export const LATEST_BLOGS = [
  {
    id: "blog-1",
    title: "How to Design an ESOP Scheme That Works for Startups in India",
    author: "CS Prashant Kumar",
    date: "August 5, 2026",
    category: "Startups / ESOP",
    imageBg: "from-emerald-800 via-teal-900 to-slate-900",
    summary: "Drafting robust ESOP plans that attract talent while protecting founder equity."
  },
  {
    id: "blog-2",
    title: "Does the Securities Contracts (Regulation) Act Automatically Apply to IFSC Listings of Indian Companies?",
    author: "CS Prashant Kumar",
    date: "August 4, 2026",
    category: "Capital Markets",
    imageBg: "from-blue-900 via-indigo-900 to-slate-900",
    summary: "An analysis of SCRA applicability and implications for direct listing in GIFT City."
  },
  {
    id: "blog-3",
    title: "UAE Trademark Examination Explained (2026 Guide)",
    author: "CS Prashant Kumar",
    date: "August 3, 2026",
    category: "IPR",
    imageBg: "from-teal-800 via-emerald-950 to-slate-900",
    summary: "Navigating the international trademark registration process in the United Arab Emirates."
  },
  {
    id: "blog-4",
    title: "Board Resolution Format — Appointment of Additional Director (Sec. 161)",
    author: "CS Prashant Kumar",
    date: "August 2, 2026",
    category: "Docs & Formats",
    imageBg: "from-cyan-900 via-slate-900 to-emerald-950",
    summary: "Standard template and compliance procedure for appointing an additional director."
  },
  {
    id: "blog-5",
    title: "Board Resolution Format — Appointment of First Auditor (Sec. 139(6))",
    author: "CS Prashant Kumar",
    date: "August 1, 2026",
    category: "Docs & Formats",
    imageBg: "from-gray-800 via-slate-900 to-zinc-900",
    summary: "Draft format for first auditor appointment by the Board of Directors."
  }
];

export const LEARNING_MODULES = [
  {
    id: "mod-cmi",
    code: "IFSCA-CMI",
    title: "IFSCA Capital Market Intermediaries Regulations, 2025",
    slug: "ifsca-cmi-regulations",
    progress: 40,
    lessons: 4,
    completedLessons: 2,
    color: "bg-slate-900 text-blue-100 border-blue-800",
    accentBg: "bg-blue-600",
    badge: "Updated 2025",
    description: "In-depth guide covering regulatory approvals, net worth thresholds, governance, client onboarding, and statutory returns for GIFT City intermediaries.",
    chapters: [
      {
        num: 1,
        title: "Registration Framework & Net Worth Requirements",
        desc: "Covers eligibility, registration procedure, and net worth thresholds across Intermediary categories (Broker-Dealers, Custodians, Investment Advisers, RTAs, Debenture Trustees)."
      },
      {
        num: 2,
        title: "Governance, Principal Officer & Compliance Officer",
        desc: "Mandatory qualifications, appointment timelines, board oversight, risk management committee structures, and internal audit requirements."
      },
      {
        num: 3,
        title: "Code of Conduct & Client Protection",
        desc: "Client onboarding protocols, KYC/AML norms, conflict of interest management, risk disclosures, and transparent fee structuring."
      },
      {
        num: 4,
        title: "Statutory Filings, Inspections & Enforcement",
        desc: "Quarterly and annual return filings, compliance certificates, regulatory inspection procedures, and statutory penalty framework."
      }
    ]
  },
  {
    id: "mod-sebi-aif",
    code: "SEBI-AIF",
    title: "SEBI (Alternative Investment Funds) Regulations, 2012",
    slug: "learn-sebi-aif-regulations",
    progress: 15,
    lessons: 14,
    completedLessons: 2,
    color: "bg-amber-950 text-amber-100 border-amber-800",
    accentBg: "bg-amber-600",
    badge: "New Topic",
    description: "Comprehensive 14-chapter interactive course covering Category I, II & III AIFs, Angel Funds, PPM structuring, accredited investors, valuation, and GARUDA filings.",
    chapters: [
      { num: 1, title: "Introduction to Alternative Investment Funds (AIFs) & Regulatory Framework", desc: "Understanding the legal concept of AIFs, private pool of capital, regulatory evolution, and SEBI mandate." },
      { num: 2, title: "Categorization of AIFs — Category I, II & III Funds", desc: "Detailed breakdown of fund classifications, tax pass-through status, and target investment strategies." },
      { num: 3, title: "Specialised Vehicles — Angel Funds, VC Funds & Infrastructure Funds", desc: "Eligibility norms, minimum ticket sizes, angel investor qualification, and special concessions." },
      { num: 4, title: "Registration Process, Fit & Proper Criteria & Sponsor Commitments", desc: "Filing Form A, key managerial personnel requirements, sponsor skin-in-the-game obligations, and corpus targets." },
      { num: 5, title: "Private Placement Memorandum (PPM) & Fund Structuring", desc: "PPM drafting guidelines, standard template disclosures, fee caps, and SEBI audit of PPM terms." },
      { num: 6, title: "Investment Conditions & Concentration Limits across AIF Categories", desc: "Maximum exposure per investee company, unlisted securities mandate, debt restrictions, and leverage rules." },
      { num: 7, title: "Accredited Investors & Large Value Funds (LVFs) Operational Norms", desc: "Net worth thresholds for accreditation, relaxation in PPM audit, flexible investment tenure, and co-investments." },
      { num: 8, title: "Valuation Principles & Net Asset Value (NAV) Calculation", desc: "Independent valuation policies, frequency of valuation, standards (IPEV/ICAI), and auditor appointment." },
      { num: 9, title: "Governance Framework & Investment Committee Oversight", desc: "Responsibilities of Key Management Personnel, Investment Committee liability, and fiduciary duties." },
      { num: 10, title: "Code of Conduct for Fund Managers, Trustees & Key Personnel", desc: "Ethics, conflict management, priority in trades, gifts policy, and insider trading prohibitions." },
      { num: 11, title: "Listing of AIF Units, Dematerialisation & Secondary Market Transfers", desc: "Mandatory demat of AIF units, private placement listing on stock exchanges, and transfer restrictions." },
      { num: 12, title: "SEBI Reporting Framework, GARUDA Portal & Periodic Disclosures", desc: "Quarterly reporting on SEBI portal, CTR/STR submissions, investor communication, and annual compliance audit." },
      { num: 13, title: "Co-investment Structures & Portfolio Management Protocols", desc: "Co-investment portfolio manager (CPM) route, sidecar vehicles, and pro-rata investment rules." },
      { num: 14, title: "Winding Up, Liquidation Scheme & Investor Exit Options", desc: "In-specie distribution, liquidation period extensions, dissolution period, and regulatory approval for exit." }
    ]
  },
  {
    id: "mod-fme",
    code: "IFSCA-FME",
    title: "IFSCA Fund Management Regulations, 2025",
    slug: "ifsca-fme-regulations",
    progress: 75,
    lessons: 14,
    completedLessons: 10,
    color: "bg-emerald-900 text-emerald-100 border-emerald-700",
    accentBg: "bg-emerald-600",
    badge: "Most Popular",
    description: "Masterclass on setting up Fund Management Entities (FMEs), registering Venture Capital Schemes, Portfolio Management Services, and ESG funds in GIFT City.",
    chapters: [
      { num: 1, title: "Types of FMEs & Registration Framework", desc: "Authorised FME, Registered FME (Non-Retail), and Registered FME (Retail) capital norms and eligibility." },
      { num: 2, title: "Venture Capital Schemes & Restricted Schemes", desc: "Filing placement memoranda, green-channel approvals, and private placement limits." },
      { num: 3, title: "Retail Schemes & Exchange Traded Funds (ETFs)", desc: "Public offer of retail schemes, prospectus filings, ETF market makers, and liquidity provider obligations." },
      { num: 4, title: "Special Situation Funds & Distressed Assets", desc: "Investment in stressed assets, Resolution Plans under IBC, acquisition of non-performing loans (NPLs)." },
      { num: 5, title: "ESG & Sustainable Investment Framework", desc: "Mandatory ESG disclosures, green washing prevention, stewardship responsibilities, and sustainability reporting." },
      { num: 6, title: "Family Investment Funds (FIFs) in GIFT City", desc: "Single Family Office structuring, minimum corpus ($10Mn), permitted asset classes, and self-managed funds." },
      { num: 7, title: "Portfolio Management Services & Multi-Family Offices", desc: "PMS agreements, discretionary vs non-discretionary mandates, advisory services, and fee disclosures." },
      { num: 8, title: "Investment Trusts (REITs & InvITs) Manager Framework", desc: "Public and private placement of REITs/InvITs, sponsor commitment, and valuation norms." },
      { num: 9, title: "Accredited Investors & Sovereign Investment Vehicles", desc: "Eligibility criteria for accredited investors, accreditation agencies, and waiver of regulatory caps." },
      { num: 10, title: "Risk Management, Internal Audit & Custody Norms", desc: "Appointment of independent custodian, risk management policy, valuation policies, and internal controls." },
      { num: 11, title: "Code of Conduct & Conflict of Interest Management", desc: "Fiduciary duties, priority in allocation of investments, personal trading rules, and gifts policy." },
      { num: 12, title: "Statutory Reporting, Inspections & Enforcement", desc: "Periodic return filings to IFSCA, regulatory audit, inspection procedures, and administrative penalties." }
    ]
  }
];

export const COMPLIANCE_TOOLS = [
  {
    id: "tool-1",
    title: "Compliance Calendar",
    slug: "compliance-calendar",
    category: "Statutory Filings",
    icon: "Calendar",
    description: "Interactive GIFT IFSC & Intermediary compliance calendar with officer assignment, evidence tracking, and statutory due dates.",
    tag: "Essential",
    featured: true
  },
  {
    id: "tool-2",
    title: "Annual Filing Tracker",
    slug: "annual-filing-tracker",
    category: "Corporate Law",
    icon: "Sliders",
    description: "Track annual return filings (AOC-4, MGT-7) and ensure full compliance before ROC deadlines.",
    tag: "Tracker",
    featured: true
  },
  {
    id: "tool-3",
    title: "Board Meeting Planner",
    slug: "board-meeting-planner",
    category: "Secretarial Standards",
    icon: "CheckCircle2",
    description: "Plan board meeting agendas, quorum requirements, and minute drafting efficiently under SS-1.",
    tag: "Planner",
    featured: true
  },
  {
    id: "tool-4",
    title: "ESOP Calculator",
    slug: "esop-calculator",
    category: "Capital Markets",
    icon: "Calculator",
    description: "Calculate vesting schedules, perquisite value, and taxation on Employee Stock Options.",
    tag: "Calculator",
    featured: true
  },
  {
    id: "tool-5",
    title: "AML Risk Assessment",
    slug: "aml-risk-assessment",
    category: "Risk Assessment",
    icon: "ShieldAlert",
    description: "Self-assessment framework to evaluate Anti-Money Laundering readiness and FIU-IND compliance.",
    tag: "Diagnostic",
    featured: false
  }
];

export const NAV_LINKS = [
  { label: "Home", href: "/", active: true },
  { 
    label: "Knowledge Hub", 
    href: "/knowledge-hub",
    hasDropdown: true,
    subItems: [
      "Interactive Regulations",
      "Learning & Diagnostics",
      "Quizzes",
      "Diagnostic Tests",
      "My Learning",
      "My Certificates"
    ]
  },
  { 
    label: "Compliance Tools", 
    href: "/tools", 
    hasDropdown: true, 
    subItems: [
      "Compliance Calendar",
      "Annual Filing Tracker",
      "Board Meeting Planner",
      "ESOP Calculator",
      "AML Risk Assessment"
    ]
  },
  { label: "Templates", href: "/templates", hasDropdown: false },
  { label: "Blog", href: "/blog", hasDropdown: false },
  { label: "News", href: "/news", hasDropdown: false },
  { label: "About", href: "/about", hasDropdown: false }
];

export const SEBI_AIF_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Under SEBI (AIF) Regulations, 2012, what is the maximum number of investors allowed in a single scheme of Category I or Category II AIF (excluding Angel Funds)?",
    options: [
      "50 Investors",
      "100 Investors",
      "1000 Investors",
      "Unlimited Investors"
    ],
    correctAnswer: 2,
    explanation: "Under Regulation 10(b) of SEBI AIF Regulations, no scheme of an AIF (other than Angel Funds) shall have more than 1000 investors."
  },
  {
    id: 2,
    question: "What is the minimum investment amount required from an individual investor in a standard Category I or II AIF scheme?",
    options: [
      "₹10 Lakhs",
      "₹25 Lakhs",
      "₹1 Crore",
      "₹5 Crores"
    ],
    correctAnswer: 2,
    explanation: "Under Regulation 10(a), the minimum investment from an individual investor in a Category I or II AIF is ₹1 Crore (₹25 Lakhs for employees/directors of the AIF or Manager)."
  },
  {
    id: 3,
    question: "Which category of AIF is allowed to employ leverage for purpose of making investments and day-to-day trading?",
    options: [
      "Category I AIF",
      "Category II AIF",
      "Category III AIF",
      "Angel Funds"
    ],
    correctAnswer: 2,
    explanation: "Category III AIFs are permitted to employ leverage or complex trading strategies, subject to regulatory limits and investor consent."
  }
];

export const SAMPLE_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Under Section 188 of Companies Act 2013, prior approval of Audit Committee is required for:",
    options: [
      "Only transactions exceeding ₹100 Crores",
      "All Related Party Transactions or subsequent modifications",
      "Only transactions not in the ordinary course of business",
      "Only transactions with wholly owned subsidiaries"
    ],
    correctAnswer: 1,
    explanation: "Under Section 177(4)(iv) read with Regulation 23 of SEBI LODR, all RPTs and subsequent material modifications require prior approval of the Audit Committee."
  },
  {
    id: 2,
    question: "What is the minimum net worth requirement for a Registered FME under IFSCA Fund Management Regulations?",
    options: [
      "USD 75,000",
      "USD 500,000",
      "USD 1,000,000",
      "USD 150,000"
    ],
    correctAnswer: 1,
    explanation: "A Registered Fund Management Entity (Non-Retail) in GIFT City IFSC requires a minimum net worth of USD 500,000."
  },
  {
    id: 3,
    question: "As per Secretarial Standard-1 (SS-1), notice of every Board Meeting must be given to every director at least how many days before the meeting?",
    options: [
      "3 Days",
      "5 Days",
      "7 Days",
      "14 Days"
    ],
    correctAnswer: 2,
    explanation: "Notice in writing of every Board Meeting shall be given to every Director at least seven (7) days before the date of the Meeting, unless the Articles prescribe a longer period."
  }
];

