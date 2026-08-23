# RegMate Production Audit — Complete Site-Wide Inventory

## 1. Complete Route Inventory (from `App.jsx`)

### A. Main Product Ecosystem Hubs & Pages
1. `/` — Home (Hero 6-node Capability Wheel, Ecosystem Grid, Quizzes, Content Grid, Tools Scroller)
2. `/learn` — RegLearn Course Catalogue Hub (Search, Regulator Filters, Access Tabs)
3. `/learn/course/:courseId` — Legacy course route redirect/view
4. `/learn/paths/:pathId` — Learning Paths view
5. `/learn/:courseSlug` — CourseHub (Overview, Chapter List, Mastery Progress, Lock/Unlock Payment trigger)
6. `/learn/:courseSlug/chapter/:chapterId` — ChapterLearning (5-Step Mastery: Learn, Walkthrough, Recall, Practice, Challenge)
7. `/learn/:courseSlug/challenge/:challengeType` — ChallengeEngine (Timed Quiz/Exam Mode)
8. `/understand` — RegLens Statutory Intelligence Reader (All 50+ Regulations Catalog & Reader)
9. `/understand/:actSlug` — RegLens Act Reader (Chapter accordion, Provision reader, Plain-English analysis)
10. `/understand/:actSlug/:chapter` — RegLens Chapter Detail View
11. `/understand/:actSlug/:chapter/:sectionNum` — RegLens Provision Detail View
12. `/interactive-regulations` — Alias route for `/understand`
13. `/interactive-regulations/:actSlug` — Alias route for `/understand/:actSlug`
14. `/practice` — RegPractice Ecosystem Hub (Quizzes, Mock Exams, Question Bank, Analytics)
15. `/practice/quizzes` — Topic & Daily Quizzes Catalog
16. `/practice/quizzes/:topic` — QuizTopic Engine (Interactive MCQ Solver with Timer)
17. `/practice/mock-tests` — ExamReady Mock Examinations Catalog
18. `/practice/mock-tests/:slug` — ExamReady Mock Exam Simulator
19. `/practice/question-bank` — Comprehensive Regulatory Question Bank
20. `/tools` — RegTools Compliance Automation Suite (Filters, Calculators, Trackers)
21. `/tools/:slug` — ToolDetail Interactive Calculator & Report Generator
22. `/prepare` — RegReady Role & Interview Preparation Hub (Track Cards & Case Scenarios)
23. `/prepare/fme` — FMEInterviewPro (Fund Management Principal Officer Interview Track)
24. `/prepare/:trackSlug` — Track-specific Interview Preparation View
25. `/regintel` — RegIntel Regulatory Radar (Feed, Regulator Tabs, Impact Severity)
26. `/regintel/whats-changed` — What's Changed Diff Tracker
27. `/regintel/tracker` — Amendment Tracker View
28. `/regintel/enforcement` — Enforcement Orders Feed
29. `/regintel/alerts` — High-Impact Regulatory Alerts
30. `/regintel/calendar` — Redirect to `/tools/compliance-calendar`
31. `/regintel/analysis` — Regulatory Analysis Articles
32. `/free-resources` — Free Resources Hub (Blogs, Explainers, Templates)
33. `/free-resources/blogs` — Blog & Analysis Index
34. `/free-resources/blogs/:slug` — Blog & Analysis Article Detail
35. `/free-resources/articles` — Articles View
36. `/free-resources/explainers` — Statutory Explainers View
37. `/free-resources/guides` — Practice Guides View
38. `/free-resources/faqs` — Regulatory FAQs View
39. `/free-resources/checklists` — Redirect to `/tools`
40. `/free-resources/templates` — Compliance Templates & Downloadable Resources
41. `/free-resources/downloads` — Downloads View
42. `/free-resources/polls` — Community Polls & Diagnostics View
43. `/about` — About RegMate & Editorial Methodology
44. `/membership` — All-Access Pass Membership & Pricing
45. `/dashboard` — User Dashboard (Protected)
46. `/admin` — Admin Panel (Protected Admin)
47. `/profile` — User Profile & Settings (Auth Gated)
48. `/my-learning` — My Enrolled Courses & Progress (Auth Gated)
49. `/my-certificates` — Certificates & Verification (Auth Gated)
50. `/login` — Login / Auth Modal (Auth Gated)
51. `/register` — Register Account (Auth Gated)

### B. Backward-Compatibility Redirects (Zero Breakage)
52. `/knowledge-hub` $\rightarrow$ `/learn`
53. `/learning` $\rightarrow$ `/learn`
54. `/quizzes` $\rightarrow$ `/practice/quizzes`
55. `/diagnostic-tests` $\rightarrow$ `/practice`
56. `/exam-ready` $\rightarrow$ `/practice/mock-tests`
57. `/fme-interviewpro` $\rightarrow$ `/prepare/fme`
58. `/jobs` $\rightarrow$ `/prepare/fme`
59. `/compliance-tools` $\rightarrow$ `/tools`
60. `/templates` $\rightarrow$ `/free-resources/templates`
61. `/blog` $\rightarrow$ `/free-resources/blogs`

---

## 2. Interactive Element Inventory Site-Wide

### Navbar (`Navbar.jsx`)
- **Logo Link**: Navigates to `/`
- **RegLearn Mega Menu Trigger**: Opens RegLearn Mega Menu
- **RegLens Mega Menu Trigger**: Opens RegLens Mega Menu
- **RegPractice Mega Menu Trigger**: Opens RegPractice Mega Menu
- **RegTools Mega Menu Trigger**: Opens RegTools Mega Menu
- **RegReady Mega Menu Trigger**: Opens RegReady Mega Menu
- **RegIntel Mega Menu Trigger**: Opens RegIntel Mega Menu
- **Free Resources Dropdown Trigger**: Opens Free Resources Dropdown
- **Desktop Search Icon**: Navigates to search / opens search modal
- **Login / Account Button**: Opens login modal or navigates to `/dashboard`
- **Join RegMate CTA Button**: Navigates to `/membership`
- **Mobile Menu Toggle (Hamburger/X)**: Toggles mobile drawer overlay
- **Mobile Accordion Items**: Toggles nested product links in mobile view

### Footer (`Footer.jsx`)
- **Logo Link**: Navigates to `/`
- **Product Links**: RegLearn, RegLens, RegPractice, RegTools, RegReady, RegIntel
- **Regulation Quick Links**: IFSCA FME 2025, IFSCA CMI 2025, SEBI AIF 2012, Companies Act 2013
- **Tool Quick Links**: Compliance Calendar, ESOP Calculator, AML Matrix
- **Company Links**: About, Membership, Terms, Privacy
- **Newsletter Email Input & Subscribe Button**: Form submit action

### Homepage (`Home.jsx`)
- **Hero Search Bar**: Submit search query $\rightarrow$ `/understand?search=...`
- **Hero Popular Topics Pills**: Click pill $\rightarrow$ `/understand?search=...`
- **Hero Capability Wheel Nodes (6)**: Orbiting product cards $\rightarrow$ `/learn`, `/understand`, `/practice`, `/tools`, `/prepare`, `/regintel`
- **Ecosystem Product Cards (6)**: "Explore" CTAs $\rightarrow$ `/learn`, `/understand`, `/practice`, `/tools`, `/prepare`, `/regintel`
- **Ecosystem Banner CTAs**: "Get All-Access Membership" $\rightarrow$ `/membership`, "Explore Free Courses" $\rightarrow$ `/learn`
- **Quizzes Section Tabs & Quiz Cards**: Filter quizzes and click to solve
- **Content Grid Article Modal Triggers**: Open article view modal
- **Tools Scroller Cards**: Open interactive tool modal

### RegLearn Hub (`Learning.jsx`)
- **Search Input**: Real-time filtering by course name/code
- **Regulator Filter Tabs**: ALL, IFSCA, SEBI, MCA, RBI
- **Access Tabs**: All Courses, In Progress, Learning Paths
- **Course Card CTAs**: "Start Learning" / "Continue" $\rightarrow$ `/learn/:courseSlug`

### CourseHub (`CourseHub.jsx`)
- **Back to RegLearn Link**: Navigates to `/learn`
- **Start / Continue Chapter Button**: Navigates to `/learn/:courseSlug/chapter/:chapterId`
- **Free Preview Badge**: Allows viewing Chapter 1 for free
- **Payment Unlock Button**: Opens Razorpay payment checkout modal for locked chapters
- **Tab Switcher**: Overview, Syllabus, Resources

### ChapterLearning (`ChapterLearning.jsx`)
- **Top Step Bar Tabs**: Learn, Walkthrough, Recall, Practice, Challenge (All clickable)
- **Question Navigator**: Numbered chips `1`..`N` to jump to any MCQ
- **MCQ Option Buttons (A/B/C/D)**: Select answer option
- **Submit Answer Button**: Validates answer and displays feedback
- **Next / Previous Question Buttons**: Step between MCQs
- **Mark Read Button**: Advances from Learn to Walkthrough

### ChallengeEngine (`ChallengeEngine.jsx`)
- **Start Challenge Button**: Initializes timed exam session
- **Option Buttons**: Select option
- **Submit Exam Button**: Concludes exam and outputs score report
- **Timer Control**: Displays remaining time

### RegLens (`InteractiveRegulations.jsx`)
- **Regulator Filter Selector**: Filter acts by regulator
- **Act Selection Dropdown / Search**: Switch between 50+ regulations
- **Chapter Accordion Headers**: Expand/collapse chapters
- **Provision List Items**: Select specific provision number
- **Statutory Text Reader Tabs**: Text, Plain-English, Compliance Points, Risk Points
- **Bookmark Button**: Saves provision to user account
- **Search Input**: Filters provisions within active act

### RegPractice (`PracticeHub.jsx` & `QuizTopic.jsx`)
- **Practice Ecosystem Cards**: Browse Quizzes, Start Mock Test, Question Bank, Analytics
- **Topic Select Buttons**: Select topic (e.g. FME, CMI, AIF, Companies Act)
- **Option Select Buttons**: Option selection
- **Submit Answer & Explanation Reveal**: Checks answer correctness

### RegTools (`ToolsIndex.jsx` & `ToolDetail.jsx`)
- **Category Filter Tabs**: ALL, Planners & Calendars, Filing Trackers, Calculators, Risk Diagnostics
- **Search Input**: Filter tools by keyword
- **Tool Cards**: Click to open interactive tool
- **Interactive Form Inputs**: Numerical inputs, dropdown selectors, date pickers
- **Calculate / Audit Button**: Runs statutory formulas
- **Export Report Button**: Downloads PDF/HTML audit report

### RegReady (`PrepareHub.jsx` & `FMEInterviewPro.jsx`)
- **Track Cards**: Select interview track (FME, Listed CS, Private Advisory)
- **Scenario Accordion**: Expand/collapse technical interview scenarios
- **Model Answer Trigger**: Reveals expert model answer
- **Payment Unlock Trigger**: Invokes real Razorpay checkout for premium tracks

### Membership (`Membership.jsx`)
- **Billing Toggle**: Monthly / Annual pricing switch
- **Subscribe CTA Buttons**: Triggers Razorpay checkout for selected plan
- **FAQ Accordion**: Expands pricing FAQs
