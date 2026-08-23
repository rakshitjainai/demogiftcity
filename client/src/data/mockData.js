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
    slug: "ifsca-cmi",
    color: "bg-slate-900 text-blue-100 border-blue-800",
    accentBg: "bg-blue-600",
    badge: "Updated 2026",
    totalChapters: 17,
    totalLessons: 35,
    description: "In-depth guide covering regulatory approvals, net worth thresholds, governance, client onboarding, and statutory returns for GIFT City intermediaries.",
    chapters: [
      { num: 1, title: "The CMI Landscape & Registration", desc: "Registrable activities, unified registration framework, form of entity, and perpetual validity." },
      { num: 2, title: "The Net Worth Framework", desc: "Category-wise net worth thresholds, liquid assets requirement, and continuous compliance obligations." },
      { num: 3, title: "Fit & Proper, Principal Officer & Compliance Officer", desc: "Mandatory qualification criteria, dual appointment rules, and key managerial accountability." },
      { num: 4, title: "Conduct & Code of Conduct", desc: "Common conduct spine, client protection standards, conflict management, and fair dealing." },
      { num: 5, title: "Governance & Operational Resilience", desc: "Internal controls, risk management framework, business continuity, and cybersecurity." },
      { num: 6, title: "Inspection & Enforcement", desc: "Authority powers, search and seizure, suspension protocols, and administrative penalties." },
      { num: 7, title: "Broker-Dealers & Clearing Members", desc: "Exchange registration, liquid capital adequacy, margin rules, and trade settlement." },
      { num: 8, title: "Credit Rating Agencies", desc: "Rating lifecycle, rating committees, disclosure standards, and conflict separation." },
      { num: 9, title: "Custodians", desc: "Custodial agreements, segregation of client securities, and safe custody norms." },
      { num: 10, title: "Debenture Trustees", desc: "Trust deed execution, security creation, default monitoring, and nominee directorship." },
      { num: 11, title: "Depository Participants", desc: "Beneficial owner segregation, daily reconciliation with depository, and system integrity." },
      { num: 12, title: "Distributors", desc: "Permitted distribution channels, institutional vs non-institutional investors, and fee caps." },
      { num: 13, title: "ESG Ratings & Data Products Providers", desc: "Methodology transparency, conflict management, and comply-or-explain conduct." },
      { num: 14, title: "Investment Advisers", desc: "Fiduciary obligations, fee-only model, suitability assessment, and client agreements." },
      { num: 15, title: "Investment Bankers", desc: "Issue management, due diligence certificates, underwriting commitments, and disclosures." },
      { num: 16, title: "Research Entities", desc: "Research report standards, public appearance disclosures, and registration exemptions." },
      { num: 17, title: "The Common-or-Entity Gauntlet", desc: "Distinguishing universal CMI obligations from activity-specific requirements." }
    ]
  },
  {
    id: "mod-sebi-aif",
    code: "SEBI-AIF",
    title: "SEBI (Alternative Investment Funds) Regulations, 2012",
    slug: "sebi-aif",
    color: "bg-amber-950 text-amber-100 border-amber-800",
    accentBg: "bg-amber-600",
    badge: "Consolidated 2026",
    totalChapters: 14,
    totalLessons: 14,
    description: "Comprehensive 14-chapter interactive course covering Category I, II & III AIFs, Angel Funds, PPM structuring, accredited investors, valuation, and GARUDA filings.",
    chapters: [
      { num: 1, title: "Fund Architecture: Corpus, Ticket & Investors", desc: "Four gating thresholds per scheme, corpus rules, accredited investor carve-outs, and demat units." },
      { num: 2, title: "Structure & Tenure by Category", desc: "Close-ended vs open-ended funds, minimum tenure norms, and extension protocols." },
      { num: 3, title: "Continuing Interest of Manager & Sponsor", desc: "Skin in the game requirements, unencumbered commitments, and pro-rata distribution rules." },
      { num: 4, title: "Category III: Leverage & Disclosure", desc: "Leverage limits, risk management protocols, comprehensive investor disclosures, and derivative usage." },
      { num: 5, title: "Valuation & Manager Responsibility", desc: "Independent valuation policies, IPEV/ICAI valuation standards, and audit frequencies." },
      { num: 6, title: "Categories I, II & III: Taxonomy & Sub-Categories", desc: "Taxonomy, sub-categories (VCF, SME, Social Impact, Infra, Angel), and pass-through taxation." },
      { num: 7, title: "Registration & Eligibility", desc: "Form A filing, fit and proper criteria, key managerial personnel experience, and corpus targets." },
      { num: 8, title: "Investment Conditions & Concentration Limits", desc: "Maximum single investee exposure, unlisted securities mandate, and temporary deployment rules." },
      { num: 9, title: "Placement Memorandum & GARUDA Green Channel", desc: "PPM drafting, standard template disclosures, merchant banker due diligence, and GARUDA portal filing." },
      { num: 10, title: "Investor Onboarding, Accreditation & Co-investment", desc: "Accreditation criteria, Large Value Funds (LVFs) relaxations, and co-investment manager framework." },
      { num: 11, title: "General Obligations & Investment Committee Oversight", desc: "Key management fiduciary duties, Investment Committee liability, and conflict management." },
      { num: 12, title: "Dematerialisation, Valuation & Investor Rights", desc: "Mandatory demat of units, secondary market transfer rules, and periodic performance reporting." },
      { num: 13, title: "Winding Up, Inspection & Default", desc: "In-specie distribution, liquidation period extensions, dissolution period, and regulatory approval." },
      { num: 14, title: "Amendment & Circular Tracker (2022-2026)", desc: "Recent statutory amendments, master circular updates, and regulatory transition milestones." }
    ]
  },
  {
    id: "mod-fme",
    code: "IFSCA-FME",
    title: "IFSCA (Fund Management) Regulations, 2025",
    slug: "ifsca-fme",
    color: "bg-emerald-900 text-emerald-100 border-emerald-700",
    accentBg: "bg-emerald-600",
    badge: "Most Popular",
    totalChapters: 7,
    totalLessons: 16,
    description: "Masterclass on setting up Fund Management Entities (FMEs), registering Venture Capital Schemes, Portfolio Management Services, and ESG funds in GIFT City.",
    chapters: [
      { num: 1, title: "Types of FMEs & Registration Framework", desc: "Authorised FME, Registered FME (Non-Retail), and Registered FME (Retail) capital norms and eligibility." },
      { num: 2, title: "Venture Capital Schemes & Restricted Schemes", desc: "Filing placement memoranda, green-channel approvals, and private placement limits." },
      { num: 3, title: "Retail Schemes & Exchange Traded Funds (ETFs)", desc: "Public offer of retail schemes, prospectus filings, ETF market makers, and liquidity provider obligations." },
      { num: 4, title: "Special Situation Funds & Distressed Assets", desc: "Investment in stressed assets, Resolution Plans under IBC, acquisition of non-performing loans (NPLs)." },
      { num: 5, title: "ESG & Sustainable Investment Framework", desc: "Mandatory ESG disclosures, green washing prevention, stewardship responsibilities, and sustainability reporting." },
      { num: 6, title: "Family Investment Funds (FIFs) in GIFT City", desc: "Single Family Office structuring, minimum corpus ($10Mn), permitted asset classes, and self-managed funds." },
      { num: 7, title: "Portfolio Management Services & Multi-Family Offices", desc: "PMS agreements, discretionary vs non-discretionary mandates, advisory services, and fee disclosures." }
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
  {
    label: "Learn",
    href: "/learn",
    hasDropdown: true,
    megaMenu: true,
    productName: "RegLearn",
    productTagline: "Structured learning through expert-designed courses and modules.",
    subGroups: [
      {
        heading: "Courses",
        items: [
          { label: "Companies Act", href: "/learn?reg=companies-act" },
          { label: "SEBI", href: "/learn?reg=sebi" },
          { label: "IFSCA", href: "/learn?reg=ifsca" },
          { label: "RBI", href: "/learn?reg=rbi" },
          { label: "FEMA", href: "/learn?reg=fema" },
          { label: "Insurance", href: "/learn?reg=insurance" },
          { label: "Capital Markets", href: "/learn?reg=capital-markets" },
          { label: "Corporate Governance", href: "/learn?reg=corporate-governance" },
          { label: "More Topics", href: "/learn" }
        ]
      },
      {
        heading: "Learning Paths",
        items: [
          { label: "Corporate Law", href: "/learn/paths/corporate-law" },
          { label: "Securities & Capital Markets", href: "/learn/paths/securities" },
          { label: "IFSC & GIFT City", href: "/learn/paths/ifsc" },
          { label: "Financial Regulation", href: "/learn/paths/financial-regulation" },
          { label: "Compliance Professional", href: "/learn/paths/compliance" }
        ]
      }
    ],
    myItems: [
      { label: "My Learning", href: "/dashboard" }
    ]
  },
  {
    label: "Understand",
    href: "/understand",
    hasDropdown: true,
    megaMenu: true,
    productName: "RegLens",
    productTagline: "Explore legal provisions with clarity, practical context and cross-references.",
    subGroups: [
      {
        heading: "Regulations & Acts",
        items: [
          { label: "IFSCA CMI Regulations 2025", href: "/understand/ifsca-cmi-2025" },
          { label: "IFSCA Fund Management 2025", href: "/understand/ifsca-fme-2025" },
          { label: "Companies Act 2013", href: "/understand/companies-act-2013" },
          { label: "SEBI AIF Regulations 2012", href: "/understand/sebi-aif-2012" },
          { label: "SEBI LODR Regulations 2015", href: "/understand/sebi-lodr-2015" },
          { label: "All Regulations", href: "/understand" }
        ]
      },
      {
        heading: "Research & Analysis",
        items: [
          { label: "Provision Finder", href: "/understand?view=search" },
          { label: "Statutory Definitions", href: "/understand?view=definitions" },
          { label: "Compare Frameworks", href: "/understand?view=compare" },
          { label: "Schedules & Forms", href: "/understand?view=schedules" }
        ]
      }
    ],
    myItems: [
      { label: "Saved Provisions", href: "/dashboard" }
    ]
  },
  {
    label: "Practice",
    href: "/practice",
    hasDropdown: true,
    megaMenu: true,
    productName: "RegPractice",
    productTagline: "Test your knowledge with quizzes, tests and mock exams.",
    subGroups: [
      {
        heading: "Quizzes",
        items: [
          { label: "Today's Quiz", href: "/practice/quizzes" },
          { label: "Topic Quizzes", href: "/practice/quizzes" },
          { label: "Quiz History", href: "/dashboard" }
        ]
      },
      {
        heading: "Mock Tests",
        items: [
          { label: "Topic Tests", href: "/practice/mock-tests" },
          { label: "Subject Tests", href: "/practice/mock-tests" },
          { label: "Full-Length Mock Tests", href: "/practice/mock-tests" },
          { label: "Exam Simulations", href: "/practice/mock-tests" }
        ]
      },
      {
        heading: "Question Bank",
        items: [
          { label: "Practice by Topic", href: "/practice/question-bank" },
          { label: "Practice by Regulator", href: "/practice/question-bank" },
          { label: "My Attempts", href: "/dashboard" }
        ]
      },
      {
        heading: "Analytics",
        items: [
          { label: "Performance & Analytics", href: "/dashboard" },
          { label: "Certificates", href: "/dashboard" }
        ]
      }
    ]
  },
  {
    label: "Tools",
    href: "/tools",
    hasDropdown: true,
    megaMenu: true,
    productName: "RegTools",
    productTagline: "Smart compliance tools and calculators for professional tasks.",
    subGroups: [
      {
        heading: "Compliance Tools",
        items: [
          { label: "Compliance Calendar", href: "/tools/compliance-calendar" },
          { label: "Compliance Diagnostic", href: "/tools/compliance-diagnostic" },
          { label: "AML/CFT Assessment", href: "/tools/aml-risk-assessment" },
          { label: "Provision Finder", href: "/tools/provision-finder" },
          { label: "Applicable Provisions Generator", href: "/tools/applicability-checker" },
          { label: "Compliance Checklist Generator", href: "/tools/checklist-generator" },
          { label: "Event-Based Compliance Tools", href: "/tools/event-based" },
          { label: "Regulatory Applicability Checker", href: "/tools/applicability-checker" }
        ]
      },
      {
        heading: "More Tools",
        items: [
          { label: "Annual Filing Tracker", href: "/tools/annual-filing-tracker" },
          { label: "Board Meeting Planner", href: "/tools/board-meeting-planner" },
          { label: "ESOP Calculator", href: "/tools/esop-calculator" },
          { label: "More Tools", href: "/tools" }
        ]
      }
    ]
  },
  {
    label: "Prepare",
    href: "/prepare",
    hasDropdown: true,
    megaMenu: true,
    productName: "RegReady",
    productTagline: "Interview prep, scenarios and professional role readiness.",
    subGroups: [
      {
        heading: "Professional Tracks",
        items: [
          { label: "FME / Fund Management", href: "/prepare/fme" },
          { label: "Listed Company CS", href: "/prepare/listed-cs" },
          { label: "Private & Public Companies", href: "/prepare/private-public" },
          { label: "IFSC Roles", href: "/prepare/ifsc-roles" },
          { label: "Compliance Roles", href: "/prepare/compliance" },
          { label: "Corporate Secretarial Roles", href: "/prepare/corp-sec" },
          { label: "Capital Markets Roles", href: "/prepare/capital-markets" },
          { label: "Financial Services Roles", href: "/prepare/financial-services" },
          { label: "Other Professional Roles", href: "/prepare" }
        ]
      }
    ]
  },
  {
    label: "RegIntel",
    href: "/regintel",
    hasDropdown: true,
    megaMenu: true,
    productName: "RegIntel",
    productTagline: "Regulatory updates and enforcement intelligence.",
    subGroups: [
      {
        heading: "Regulatory Updates",
        items: [
          { label: "MCA", href: "/regintel?reg=mca" },
          { label: "SEBI", href: "/regintel?reg=sebi" },
          { label: "IFSCA", href: "/regintel?reg=ifsca" },
          { label: "RBI", href: "/regintel?reg=rbi" },
          { label: "FEMA", href: "/regintel?reg=fema" },
          { label: "IRDAI", href: "/regintel?reg=irdai" },
          { label: "Tax", href: "/regintel?reg=tax" },
          { label: "Other Regulators", href: "/regintel" }
        ]
      },
      {
        heading: "Intelligence",
        items: [
          { label: "What's Changed?", href: "/regintel/whats-changed" },
          { label: "Regulatory Tracker", href: "/regintel/tracker" },
          { label: "Enforcement Actions", href: "/regintel/enforcement" },
          { label: "Regulatory Analysis", href: "/regintel/analysis" },
          { label: "Regulatory Alerts", href: "/regintel/alerts" },
          { label: "Regulatory Calendar", href: "/regintel/calendar" }
        ]
      }
    ]
  },
  {
    label: "Free Resources",
    href: "/free-resources",
    hasDropdown: true,
    megaMenu: false,
    subItems: [
      { label: "Blogs & Analysis", href: "/free-resources/blogs" },
      { label: "Regulatory Explainers", href: "/free-resources/explainers" },
      { label: "Guides", href: "/free-resources/guides" },
      { label: "Regulatory FAQs", href: "/free-resources/faqs" },
      { label: "Checklists", href: "/tools" },
      { label: "Templates & Formats", href: "/free-resources/templates" },
      { label: "Downloads", href: "/free-resources/downloads" },
      { label: "Polls", href: "/free-resources/polls" },
      { label: "Regulatory Glossary", href: "/understand" }
    ]
  }
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

