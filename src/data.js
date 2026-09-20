// All copy below is taken from the existing portfolio (index.html) so nothing has to be retyped.

export const PROFILE = {
  name: 'Rameshwor Chaudhary',
  short: 'Rameshwor',
  role: 'AI & Machine Learning Engineer',
  quote:
    'Dedicated to engineering intelligent machine learning pipelines and reliable digital products that scale.',
  line: 'Chandigarh University, CGPA 8.42 / 10, AI/ML specialization',
  status: 'Open to opportunities and research',
  stats: [
    { value: '5+', label: 'Projects' },
    { value: '5+', label: 'Tech stack' },
    { value: '1.5+ yrs', label: 'Experience' },
    { value: '2+', label: 'Clients' },
  ],
  resume: 'https://drive.google.com/file/d/1uo231O5QoB2iW9cbs0JiO3voDML1tCNu/view?usp=sharing',
  email: 'chaudharyishwor143@gmail.com',
  location: 'Chandigarh, India and Kathmandu, Nepal',
  // Links without an href are hidden until you fill them in.
  links: [
    { id: 'github', label: 'GitHub', handle: 'rameshworchaudhary', href: 'https://github.com/rameshworchaudhary' },
    { id: 'linkedin', label: 'LinkedIn', handle: 'chaudhari-ishwor', href: 'https://www.linkedin.com/in/chaudhari-ishwor/' },
    { id: 'scholar', label: 'Google Scholar', handle: 'Research profile', href: '' },
    { id: 'kaggle', label: 'Kaggle', handle: 'Notebooks and datasets', href: '' },
    { id: 'instagram', label: 'Instagram', handle: 'ishwor.chaudhari', href: 'https://www.instagram.com/ishwor.chaudhari/?hl=en' },
  ],
  web3formsKey: 'b280464a-ba65-4910-a01d-7e94b349436f',
}

// Room names come straight from the original nav / scene titles.
export const ROOMS = [
  { id: 'home', nav: 'Home', title: 'Home', color: '#ff3314' },
  { id: 'universe', nav: 'Universe', title: 'The Neural Universe', color: '#00f076' },
  { id: 'experience', nav: 'Experience', title: 'Work & Experience', color: '#ff8400' },
  { id: 'education', nav: 'Education', title: 'Academic Education', color: '#f4c068' },
  { id: 'theater', nav: 'Projects', title: 'The Holo Theater', color: '#ff3314' },
  { id: 'contact', nav: 'Contact', title: 'Start a Conversation', color: '#00f076' },
]

export const UNIVERSE = {
  blurb:
    'Translating theoretical mathematical models and machine learning architectures into production-ready web platforms and intelligent computer vision applications.',
  heading: 'Driven by innovation and real-world ML',
  about: [
    'I am a Computer Science engineering undergraduate specializing in Artificial Intelligence and Machine Learning at Chandigarh University.',
    'My expertise spans supervised learning, computer vision (OpenCV / MediaPipe), predictive analytics, and building modern full-stack web platforms. I thrive on translating theoretical mathematical models into accessible, reliable software solutions.',
  ],
  facts: [
    { label: 'University', value: 'Chandigarh Univ.' },
    { label: 'Degree', value: 'B.E. CSE (AI/ML)' },
    { label: 'Academic CGPA', value: '8.42 / 10' },
    { label: 'Location', value: 'Chandigarh / Nepal' },
  ],
}

export const SKILL_FILTERS = [
  { id: 'all', label: 'All technologies' },
  { id: 'ai', label: 'AI & Machine Learning' },
  { id: 'web', label: 'Software & Full-stack' },
  { id: 'tools', label: 'Tools & Data Engineering' },
]

// tier = orbit (1 inner, 2 middle, 3 outer), same as the original universe.
export const SKILLS = [
  { name: 'Python', note: 'Core language', cat: 'web', tier: 1 },
  { name: 'React & Next.js', note: 'Frontend', cat: 'web', tier: 1 },
  { name: 'Scikit-Learn', note: 'AI / ML', cat: 'ai', tier: 1 },
  { name: 'OpenCV', note: 'Computer vision', cat: 'ai', tier: 1 },
  { name: 'FastAPI', note: 'Backend APIs', cat: 'web', tier: 1 },
  { name: 'Supervised Learning', note: 'AI / ML', cat: 'ai', tier: 1 },
  { name: 'MediaPipe', note: 'Vision tracking', cat: 'ai', tier: 2 },
  { name: 'Random Forest', note: 'Algorithms', cat: 'ai', tier: 2 },
  { name: 'XGBoost', note: 'Boosting', cat: 'ai', tier: 2 },
  { name: 'Firebase', note: 'Cloud backend', cat: 'web', tier: 2 },
  { name: 'Tailwind CSS', note: 'Modern UI', cat: 'web', tier: 2 },
  { name: 'Pandas & NumPy', note: 'Data processing', cat: 'ai', tier: 2 },
  { name: 'Linear Regression', note: 'Algorithms', cat: 'ai', tier: 3 },
  { name: 'KNN Classification', note: 'Algorithms', cat: 'ai', tier: 3 },
  { name: 'Git & GitHub', note: 'Version control', cat: 'tools', tier: 3 },
  { name: 'Vercel', note: 'Deployment', cat: 'tools', tier: 3 },
  { name: 'EDA Pipelines', note: 'Data analysis', cat: 'tools', tier: 3 },
  { name: 'Feature Engineering', note: 'Data modeling', cat: 'tools', tier: 3 },
]

export const CAT_COLOR = { ai: '#ff3314', web: '#ff8400', tools: '#00f076' }

export const EXPERIENCE_INTRO =
  'Virtual corporate consulting simulations, machine learning pipelines, and production full-stack engineering with verified commercial impact.'

export const EXPERIENCE = [
  {
    tag: 'Corporate consulting simulation',
    status: 'Verified certification',
    period: '2026',
    org: 'BCG X',
    title: 'Data Science Virtual Experience Program',
    sub: 'Boston Consulting Group (BCG X), Forage certification',
    kpis: [
      { label: 'Model Precision', value: '94.2%' },
      { label: 'Engineered Features', value: '24+' },
      { label: 'Client Records', value: '15,000+' },
      { label: 'Revenue Protected', value: '$2.4M ARR' },
    ],
    summary:
      'Engineered end-to-end predictive machine learning pipelines and commercial data diagnostics for Boston Consulting Group clients to mitigate SME churn risk and maximize annual contract value.',
    points: [
      'Conducted rigorous exploratory data analysis (EDA) across 15,000+ client commercial records, identifying critical price sensitivity inflection points and churn drivers.',
      'Engineered 24+ domain-specific feature vectors covering off-peak pricing deltas, monthly consumption volatility, contract tenure metrics, and energy usage patterns.',
      'Trained, cross-validated (5-fold CV), and optimized Random Forest and Gradient Boosted classifiers achieving 94.2% precision in identifying imminent client cancellations.',
      'Applied SHAP (SHapley Additive exPlanations) and feature importance analysis to interpret non-linear decision boundaries and uncover key retention levers.',
      'Formulated an executive data strategy presenting financial simulation matrices for targeted discount incentives, protecting high-value enterprise accounts from attrition.',
      'Documented complete reproducible data science workflows with automated data cleaning, missing value imputation, skewness transformations, and visual diagnostics.',
    ],
    tech: ['Python', 'Scikit-Learn', 'Pandas & NumPy', 'Random Forest', 'Gradient Boosting', 'Feature Engineering', 'SHAP Values', 'Cross-Validation', 'EDA', 'Matplotlib & Seaborn'],
  },
  {
    tag: 'Commercial retail analytics',
    status: 'Verified certification',
    period: '2026',
    org: 'Quantium',
    title: 'Data Analytics Virtual Experience Program',
    sub: 'Quantium Analytics, Forage certification',
    kpis: [
      { label: 'Transactions Analyzed', value: '2.5M+' },
      { label: 'Trial Store Uplift', value: '+7.8%' },
      { label: 'Algorithm Accuracy', value: '98.6%' },
      { label: 'Trial Window', value: '12 Weeks' },
    ],
    summary:
      'Analyzed massive point-of-sale retail datasets for large supermarket chains to isolate customer purchasing behavior, validate store layout trial experiments, and drive category uplift.',
    points: [
      'Processed and cleansed 2,500,000+ point-of-sale transaction records across chip and confectionery categories to build granular customer segment personas and purchasing profiles.',
      'Formulated statistical benchmarking engines utilizing Pearson correlation and Euclidean distance algorithms to pair trial stores (Stores 77, 86, 88) with optimal control benchmarks.',
      'Conducted rigorous hypothesis testing (two-tailed Welch’s t-tests, p-value < 0.05) to isolate statistically significant revenue (+7.8%) and customer footfall lift during a 12-week trial window.',
      'Designed executive visual dashboards and translated complex statistical telemetry into clear merchandising actions and shelf-space reallocation strategies.',
      'Derived customer lifetime value (CLV) distributions to empower high-margin product bundling and optimal premium product placement.',
      'Delivered a structured commercial presentation recommending rollout parameters for nationwide store layout optimizations.',
    ],
    tech: ['Python', 'Statistical Hypothesis Testing', 'Pearson Correlation', 'Euclidean Distance', 'Two-Sample t-Tests', 'Retail Analytics', 'Category Management', 'Matplotlib', 'Pandas'],
  },
  {
    tag: 'Production full-stack & AI',
    status: 'Active production',
    period: '2024 to present',
    org: 'Independent',
    title: 'Applied AI & Full-Stack Systems Engineer',
    sub: 'Independent engineering, cloud platforms, and open-source systems',
    kpis: [
      { label: 'GitHub Commits', value: '250+' },
      { label: 'CV Game Latency', value: '60 FPS' },
      { label: 'LLM Response Time', value: '<100ms' },
      { label: 'Payment Gateways', value: '2 Integrated' },
    ],
    summary:
      'Designing and deploying resilient full-stack web platforms, high-throughput LLM applications, and real-time computer vision interactive systems serving real users.',
    points: [
      'Architected PadhaiHub (Exam Mind AI): real-time AI examination preparation platform with sub-100ms LLM query generation using Groq API (Llama 3 / Mixtral) and Firebase Firestore synchronization.',
      'Integrated dynamic question generation, KaTeX mathematical typesetting, and user performance telemetry with secure Firebase Authentication.',
      'Developed NexShop: complete e-commerce ecosystem in Nepal featuring dual digital wallet payment integrations (eSewa & Khalti) with secure server-side cryptographic verification.',
      'Engineered real-time OpenCV and MediaPipe computer vision football game processing 21 hand landmarks at 60 frames per second directly in Python with zero perceived latency.',
      'Built Parth AI Voice Assistant featuring natural language intent recognition, speech-to-text (STT), automated system voice control, web scraping, and text-to-speech feedback.',
      'Maintained consistent active engineering momentum with 250+ commits across AI, machine learning, and Next.js repositories with automated CI/CD deployment.',
    ],
    tech: ['Next.js 15', 'TypeScript', 'Groq Cloud API', 'OpenCV', 'MediaPipe', 'Firebase Firestore & Auth', 'Node.js', 'Python', 'eSewa & Khalti SDKs', 'Tailwind CSS'],
  },
]

export const EDUCATION_INTRO =
  'Rigorous academic foundations in computer science, machine learning architectures, statistical modeling, and engineering mathematics.'

// Listed newest first (matches the original page). The 3D steps climb oldest to newest.
export const EDUCATION = [
  {
    period: '2024 to 2028 (in progress)',
    badge: 'Current CGPA 8.42 / 10',
    degree: 'Bachelor of Engineering in Computer Science (AI & ML)',
    school: 'Chandigarh University, Punjab, India',
    short: 'B.E. CSE (AI/ML)',
    metrics: [
      { label: 'Cumulative CGPA', value: '8.42 / 10' },
      { label: 'Specialization Track', value: 'AI & Deep Learning' },
      { label: 'Departmental Rank', value: 'Top 5%' },
      { label: 'Curriculum Focus', value: 'Core CS + AI' },
    ],
    summary:
      'Premier 4-year engineering curriculum focused on machine learning algorithms, deep neural network optimization, computer vision, data structures, and enterprise software engineering.',
    listTitle: 'Core academic disciplines & lab curricula',
    list: [
      'Deep Learning & Neural Networks (PyTorch)',
      'Data Structures & Algorithms (C++ / Python)',
      'Computer Vision & Image Processing (OpenCV)',
      'Database Management Systems (SQL & Cloud DB)',
      'Design & Analysis of Algorithms (Complexity O(n))',
      'Linear Algebra & Multivariable Calculus',
      'Operating Systems & Concurrent Architecture',
      'Probability & Mathematical Statistics',
      'Distributed Systems & Cloud Computing',
      'Software Engineering & Agile Methodologies',
    ],
    highlights: [
      'Consistent top-tier academic standing maintaining 8.42 CGPA across rigorous engineering and mathematical coursework.',
      'Built and evaluated deep neural networks (CNNs, RNNs, MLPs) from foundational backpropagation mathematics to PyTorch implementations.',
      'Solved complex algorithmic challenges in dynamic programming, graph theory, and advanced tree structures.',
      'Conducted laboratory research into low-latency inference pipelines for real-time edge computer vision.',
      'Active developer in university technical hackathons, coding sprints, and open-source development circles.',
    ],
    honor: 'Dean’s Honor List standing, specialized AI/ML honors track, and technical project leadership recognition.',
  },
  {
    period: '2022 to 2024',
    badge: 'Distinction (A+)',
    degree: 'Higher Secondary Education (+2 Science / Pre-Engineering)',
    school: 'Nobel Academy, Kathmandu, Nepal',
    short: '+2 Science',
    metrics: [
      { label: 'Academic Standing', value: 'Distinction (A+)' },
      { label: 'Core Stream', value: 'Physical Sciences' },
      { label: 'Mathematics', value: 'Advanced Calculus' },
      { label: 'Program', value: 'Pre-Engineering' },
    ],
    summary:
      'Pre-university science and mathematics program providing an intensive foundation in advanced differential calculus, classical mechanics, electromagnetism, and introductory C computational programming.',
    listTitle: 'Key academic disciplines',
    list: [
      'Theoretical Physics & Newtonian Mechanics',
      'Advanced Mathematics & Differential Calculus',
      'Computer Science & C Programming Foundations',
      'Electromagnetism, Wave Optics & Modern Physics',
      'Physical & Analytical Chemistry',
      'Coordinate Geometry & Vector Algebra',
    ],
    highlights: [
      'Graduated with distinction honors (A+) in the rigorous national STEM pre-engineering curriculum.',
      'Consistently ranked in the top percentile in mathematics problem solving, physics practicals, and numerical methods.',
      'Developed early algorithmic problem-solving skills through modular C programming, memory pointers, and data structures.',
      'Represented the institution in inter-college science and mathematical Olympiad competitions.',
    ],
    honor: 'Graduated with Distinction in the Pre-Engineering STEM Stream.',
  },
  {
    period: '2010 to 2022',
    badge: 'Honors & Distinction',
    degree: 'Secondary Education Examination (SEE)',
    school: 'Himchuli Academy, Nepal',
    short: 'SEE',
    metrics: [
      { label: 'Curriculum', value: 'National Board' },
      { label: 'Focus', value: 'Mathematics & Science' },
      { label: 'Distinction', value: 'First Division (Honors)' },
      { label: 'Foundation', value: 'Computational Logic' },
    ],
    summary:
      'Foundational schooling covering advanced school mathematics, scientific inquiry, logic competitions, and early computer software fundamentals.',
    listTitle: 'Key academic disciplines',
    list: [
      'Optional Mathematics & Advanced Trigonometry',
      'Coordinate Geometry & Matrix Transformations',
      'Natural Sciences, Physics & Chemistry',
      'Computer Applications & Logic Systems',
      'English Language & Technical Writing',
    ],
    highlights: [
      'Achieved First Division with Distinction honors across all academic subjects.',
      'Active participant in regional science exhibitions, mathematics quizzes, and logical reasoning tournaments.',
      'Developed initial passion for computational systems, algorithmic thinking, and computer programming.',
    ],
    honor: 'First Division with Distinction, Academic Excellence Recognition.',
  },
]

export const PROJECTS_INTRO =
  'Curated collection of live web applications, AI exam assistants, computer vision games, and machine learning models.'

export const PROJECTS = [
  {
    status: 'Completed',
    kind: 'Live platform',
    name: 'PadhaiHub (Exam Mind AI)',
    screen: 'PADHAIHUB AI',
    sub: 'Interactive Exam Mind Assistant, Groq API + Firebase',
    desc: 'AI-powered exam preparation platform with interactive study assistants, question generation tools, and user authentication. Built with Firebase and Groq API integration.',
    tech: ['Firebase', 'Groq API', 'Next.js', 'Vercel'],
    links: [
      { label: 'Live app', href: 'https://padhaihub.tech' },
      { label: 'GitHub code', href: 'https://exam-mind-ai-six.vercel.app/' },
    ],
  },
  {
    status: 'Completed',
    kind: 'Commerce store',
    name: 'NexShop',
    screen: 'NEXSHOP NEPAL',
    sub: 'eSewa & Khalti payments, admin inventory portal',
    desc: 'Production-ready Nepal-focused e-commerce platform with Firebase-backed shopping, admin management, and eSewa and Khalti payment integrations.',
    tech: ['Next.js 15', 'TypeScript', 'Firebase', 'eSewa / Khalti'],
    links: [{ label: 'Live app', href: 'https://nexshoponline.com.np' }],
  },
  {
    status: 'In progress',
    kind: 'AI productivity',
    name: 'AI Resume Builder',
    screen: 'AI RESUME ARCHITECT',
    sub: 'ATS optimization, dynamic bullet synthesizer',
    desc: 'Productivity web tool helping users compose and format professional resumes with AI-assisted bullet point generation and instant layout formatting.',
    tech: ['React', 'AI API', 'Tailwind CSS', 'Firebase'],
    links: [{ label: 'Live app', href: 'https://resume-builder-puce-tau.vercel.app/' }],
  },
  {
    status: 'In progress',
    kind: 'Computer vision',
    name: 'AI Gesture Control Game',
    screen: 'VISION FOOTBALL GAME',
    sub: 'Real-time hand pose, 60 FPS MediaPipe integration',
    desc: 'Interactive AI-based game controlled using hand gestures through webcam detection. Built with real-time gesture recognition and computer vision integration.',
    tech: ['OpenCV', 'Python', 'MediaPipe', 'AI Vision'],
    links: [{ label: 'GitHub repo', href: 'https://github.com/rameshworchaudhary/AI_Football_Game' }],
  },
  {
    status: 'In progress',
    kind: 'Groq AI engine',
    name: 'Parth AI Voice Assistant',
    screen: 'PARTH VOICE AI',
    sub: 'Ultra-low latency Groq API, speech recognition',
    desc: 'AI voice assistant powered by Groq API capable of responding to voice commands and generating intelligent conversational responses in real time.',
    tech: ['Groq API', 'Speech Recognition', 'Python', 'AI Chat'],
    links: [{ label: 'GitHub repo', href: 'https://github.com/rameshworchaudhary/Voice-Assistant-' }],
  },
  {
    status: 'Completed',
    kind: 'Machine learning',
    name: 'House Price Prediction',
    screen: 'VALUATION REGRESSION',
    sub: 'Multivariate feature analysis, outlier normalization',
    desc: 'Supervised machine learning regression model analyzing real estate feature vectors with data cleaning, outlier handling, and cross-validated metrics.',
    tech: ['Python', 'Scikit-Learn', 'Pandas', 'Regression'],
    links: [{ label: 'GitHub repo', href: 'https://github.com/rameshworchaudhary' }],
  },
  {
    status: 'Completed',
    kind: 'Healthcare ML',
    name: 'Heart Disease Prediction',
    screen: 'CARDIAC RISK CLASSIFIER',
    sub: 'Clinical feature modeling, precision & recall assessment',
    desc: 'Medical classification model evaluating clinical patient data to predict cardiovascular condition risks using logistic regression and precision/recall evaluation.',
    tech: ['Python', 'Scikit-Learn', 'Classification', 'Data Analysis'],
    links: [{ label: 'GitHub repo', href: 'https://github.com/rameshworchaudhary' }],
  },
]

export const CONTACT = {
  heading: 'Start a conversation',
  blurb:
    'Open to exciting opportunities in Machine Learning engineering, AI research, full-stack development, and innovative collaborative projects.',
}

export const PROJECT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'done', label: 'Completed' },
  { id: 'wip', label: 'In progress' },
]

export const projectMatches = (p, f) =>
  f === 'all' || (f === 'done' && p.status === 'Completed') || (f === 'wip' && p.status === 'In progress')

export const visibleProjects = (f) => PROJECTS.map((p, i) => i).filter((i) => projectMatches(PROJECTS[i], f))

// Next / previous project inside the current filter.
export function stepProject(cur, d, f) {
  const list = visibleProjects(f)
  const pos = list.indexOf(cur)
  return list[(((pos === -1 ? 0 : pos) + d) % list.length + list.length) % list.length]
}
