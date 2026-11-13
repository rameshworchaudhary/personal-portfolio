// All copy below is taken from the existing portfolio so nothing has to be retyped.

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
  resume: 'https://drive.google.com/file/d/1fcHuC-7fy2wmCGcqWw-q0DQEk2BH-dQh/view?usp=drive_link',
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

// Room names come straight from the original nav / scene titles, ending with the Infinity Gate.
export const ROOMS = [
  { id: 'home', nav: 'Home', title: 'Home', color: '#ff3314' },
  { id: 'universe', nav: 'Universe', title: 'The Neural Universe', color: '#00f076' },
  { id: 'experience', nav: 'Experience', title: 'Work & Experience', color: '#ff8400' },
  { id: 'education', nav: 'Education', title: 'Academic Education', color: '#f4c068' },
  { id: 'theater', nav: 'Projects', title: 'The Holo Theater', color: '#ff3314' },
  { id: 'contact', nav: 'Contact', title: 'Start a Conversation', color: '#00f076' },
  { id: 'infinity', nav: '∞ Infinity', title: 'The Infinity Portal', color: '#00f0ff' },
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
  'Virtual corporate consulting internships, machine learning pipelines, and production full-stack engineering.'

export const EXPERIENCE = [
  {
    tag: 'Forage verified',
    period: '2026',
    org: 'BCG X',
    title: 'Data Science Virtual Experience Program',
    sub: 'Boston Consulting Group (BCG X), Forage certification',
    summary:
      'Engineered end-to-end data analytics and predictive machine learning models for commercial SME client retention and churn prevention.',
    points: [
      'Conducted rigorous Exploratory Data Analysis (EDA) on commercial datasets to isolate behavior patterns and churn risk drivers.',
      'Engineered high-impact feature vectors from historical price sensitivity metrics and power consumption records.',
      'Built and tuned Random Forest classification model achieving high predictive precision for customer churn detection.',
      'Formulated strategic commercial recommendations estimating client retention impact and discount campaign viability.',
    ],
    context:
      'The case simulates a consulting engagement for an energy utility that is losing small and medium business customers to competitors. The job is to work out whether price sensitivity drives the churn, and what a discount strategy would actually be worth.',
    phasesTitle: 'How the program was structured',
    phases: [
      { t: 'Frame the problem', d: "Turn the client's question into testable hypotheses, such as whether customers who churn are more sensitive to price than those who stay." },
      { t: 'Audit and explore the data', d: 'Check the customer, consumption and price datasets for quality problems, then use EDA to see how churners differ from loyal customers.' },
      { t: 'Engineer features and model', d: 'Turn raw price and usage history into features, train a Random Forest classifier, and judge it with precision and recall, which matter more than accuracy when churn is the rare outcome.' },
      { t: 'Recommend', d: 'Convert the model output into a commercial recommendation, including which customers a targeted discount could realistically retain.' },
    ],
    learned:
      'How to move from a vague business question to a defensible model, and why the recommendation matters as much as the model score. It also made class imbalance and honest evaluation concrete.',
    tech: ['Python', 'Scikit-Learn', 'Pandas', 'Random Forest', 'Churn Modeling', 'EDA'],
  },
  {
    tag: 'Forage verified',
    period: '2026',
    org: 'Quantium',
    title: 'Data Analytics Virtual Experience Program',
    sub: 'Quantium Analytics, Forage certification',
    summary:
      'Evaluated high-volume supermarket retail transaction datasets, conducted customer segmentation, and performed statistical benchmark testing.',
    points: [
      'Processed millions of point-of-sale retail records to uncover category customer profiles and key brand purchasing metrics.',
      'Identified benchmark control stores using Pearson correlation and Euclidean distance algorithms to test trial store changes.',
      'Performed hypothesis testing and assessment to measure statistically significant monthly sales and customer transaction uplift.',
      'Authored executive analytics report presenting actionable merchandising and category management strategies.',
    ],
    context:
      'The case simulates working in a retail analytics team that advises a supermarket category manager. The goal is to understand who buys the category and why, then measure whether a store trial actually changed sales.',
    phasesTitle: 'How the program was structured',
    phases: [
      { t: 'Prepare the data and profile customers', d: 'Clean and merge transaction and customer data, then segment shoppers by life stage and spend to see who drives the category.' },
      { t: 'Design the trial comparison', d: 'For each trial store, pick control stores whose sales and customer counts moved most like it before the trial, using Pearson correlation and Euclidean distance.' },
      { t: 'Test the uplift', d: 'Compare trial and control stores during the trial period and use hypothesis testing to check whether the differences in sales and customers are statistically significant.' },
      { t: 'Report to the client', d: 'Summarise the findings and merchandising recommendations in a short executive-style report.' },
    ],
    learned:
      'That a good comparison group matters more than a clever formula, and that a result is only useful once it is stated in terms the category manager can act on.',
    tech: ['Python', 'Statistical Testing', 'Benchmarking', 'Retail Analytics', 'Matplotlib', 'Data Modeling'],
  },
  {
    tag: 'Production deployments',
    period: '2024 to present',
    org: 'Independent',
    title: 'Applied AI & Full-Stack Systems Engineer',
    sub: 'Independent engineering and open-source projects',
    summary:
      'Architecting production AI web solutions, computer vision games, and cloud-backed platforms serving real-world users.',
    points: [
      'Architected PadhaiHub (Exam Mind AI): intelligent exam prep web application with instant question generation and Firebase auth.',
      'Developed NexShop: production Nepal e-commerce platform with eSewa and Khalti digital payment integration and cloud order workflows.',
      'Built computer vision gesture game with OpenCV and MediaPipe executing real-time webcam gesture classification at 60 FPS.',
      'Maintained active open-source contribution stream with over 250+ GitHub commits across AI, Python, and Next.js repositories.',
    ],
    context:
      'Since 2024 I have been building and deploying my own products rather than only completing coursework, so the work is judged by whether real users can sign in, pay, and use it.',
    phasesTitle: 'What I build',
    phases: [
      { t: 'AI web products', d: 'PadhaiHub generates exam questions on demand, using the Groq API for fast responses and Firebase authentication for user accounts.' },
      { t: 'Payments and commerce', d: 'NexShop covers the whole shop flow for the Nepali market, including eSewa and Khalti payments, an admin portal, and cloud-backed orders.' },
      { t: 'Computer vision', d: 'A hand-gesture game reads the webcam with OpenCV and MediaPipe and classifies gestures in real time at about 60 FPS.' },
      { t: 'Open source and machine learning', d: 'Over 250 commits across AI, Python and Next.js repositories, plus supervised learning projects such as house price and heart disease prediction.' },
    ],
    learned:
      'Shipping teaches what coursework does not: handling auth and payment edge cases, keeping AI responses fast enough to feel usable, and maintaining something after it is live.',
    tech: ['Next.js 15', 'Groq API', 'OpenCV', 'MediaPipe', 'Firebase', 'TypeScript'],
  },
]

export const EDUCATION_INTRO =
  'Formal academic training in computer science, artificial intelligence, mathematical optimization, and engineering sciences.'

// Listed newest first (matches the original page). The 3D steps climb oldest to newest.
export const EDUCATION = [
  {
    period: '2024 to 2028 (expected)',
    badge: 'Current CGPA 8.42 / 10',
    degree: 'Bachelor of Engineering in Computer Science (AI/ML)',
    school: 'Chandigarh University, Punjab, India',
    short: 'B.E. CSE (AI/ML)',
    summary:
      'Comprehensive undergraduate engineering program with specialized focus on Artificial Intelligence and Machine Learning systems, algorithmic optimization, and deep learning architectures.',
    listTitle: 'Core academic coursework',
    focus:
      'The degree builds from mathematical foundations (linear algebra, calculus) through core computer science (data structures, algorithms, operating systems, databases) into the AI/ML specialization. I try to apply each layer to something I can run, so coursework and projects reinforce each other.',
    courses: [
      { name: 'Machine Learning & Deep Learning', note: 'Supervised and unsupervised learning, model evaluation, and neural networks.' },
      { name: 'Data Structures & Algorithms (C++/Python)', note: 'Arrays, trees, graphs and hashing, and the complexity analysis behind choosing between them.' },
      { name: 'Computer Vision & Image Processing', note: 'Image filtering, feature detection and object tracking, the basis for my OpenCV and MediaPipe work.' },
      { name: 'Database Management Systems (SQL / NoSQL)', note: 'Relational design and queries, plus document stores like the ones behind Firebase.' },
      { name: 'Design & Analysis of Algorithms', note: 'Divide and conquer, dynamic programming and greedy methods, with reasoning about correctness and cost.' },
      { name: 'Linear Algebra & Vector Calculus', note: 'Vectors, matrices and gradients, the mathematics under regression and neural network training.' },
      { name: 'Operating Systems & Architecture', note: 'Processes, memory, scheduling and how hardware executes programs.' },
      { name: 'Software Engineering & Agile Methods', note: 'Requirements, version control, testing and iterative delivery.' },
    ],
    applied:
      'Coursework shows up directly in my projects: regression and classification in the house price and heart disease models, computer vision in the gesture game, and databases and web architecture in PadhaiHub and NexShop. Beyond the syllabus, I completed the BCG X and Quantium virtual programs and keep an active GitHub.',
    honor: 'Academic distinction and departmental AI/ML specialization',
  },
  {
    period: '2022 to 2024',
    badge: 'Distinction',
    degree: 'Higher Secondary Education (+2 Science)',
    school: 'Nobel Academy, Kathmandu, Nepal',
    short: '+2 Science',
    summary:
      'Pre-university STEM program specializing in the physical sciences and computational fundamentals, establishing high analytical and mathematical proficiency.',
    listTitle: 'Key academic disciplines',
    focus:
      'A science stream that built the habit of solving quantitative problems step by step, and which included programming in C.',
    courses: [
      { name: 'Physics & Mechanics', note: 'Motion, forces, energy and the modelling of physical systems.' },
      { name: 'Advanced Mathematics & Calculus', note: 'Limits, derivatives, integrals and their applications.' },
      { name: 'Computer Science & C Programming', note: 'Programming fundamentals in C: variables, control flow, functions and arrays.' },
      { name: 'Analytical Chemistry', note: 'Quantitative analysis, careful measurement and reasoning from lab data.' },
    ],
    applied:
      'Calculus from this stream is the foundation for the optimization and gradient ideas used later in machine learning.',
    honor: 'Graduated with distinction in the STEM stream',
  },
  {
    period: '2010 to 2022',
    badge: 'Honors',
    degree: 'Secondary Education Examination (SEE)',
    school: 'Himchuli Academy, Nepal',
    short: 'SEE',
    summary:
      'Foundational schooling with academic honors across mathematical problem solving, natural sciences, and computer literacy competitions.',
    listTitle: 'Key academic disciplines',
    focus:
      'The foundation years: strong habits in mathematics and science, and early exposure to computers through school computer applications and competitions.',
    courses: [
      { name: 'Opt. Mathematics & Trigonometry', note: 'Algebra, functions, geometry and trigonometry for multi-step problem solving.' },
      { name: 'General Science', note: 'Introductory physics, chemistry and biology.' },
      { name: 'Computer Applications', note: 'Basic computing, office tools and an introduction to programming ideas.' },
    ],
    applied:
      'Optional mathematics is where the problem-solving habit started, which later carried into algorithms and data science.',
    honor: 'Top academic standing and STEM foundation',
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

export const INFINITY = {
  heading: 'The Infinity Portal // Ananta Dwar',
  blurb:
    'Beyond the physical rooms lies the infinite horizon—a continuum of machine learning breakthroughs, deep research, and boundless technological frontiers.',
  vision:
    'Engineering the transition from narrow machine learning models to generalizable, autonomous multi-modal AI systems that empower humanity.',
  horizons: [
    { title: 'Foundation & Multi-Agent AI', desc: 'Reasoning pipelines, test-time compute scaling, parameter-efficient fine-tuning (PEFT), and self-improving agents.' },
    { title: 'Real-Time Edge Computer Vision', desc: 'Zero-latency spatial perception, 3D hand/body gesture classification at 60+ FPS, and embedded neural engines.' },
    { title: 'High-Throughput Vector Platforms', desc: 'Distributed semantic search, low-latency LLM inference architectures, and real-time retrieval-augmented pipelines.' },
    { title: 'Human-AI Symbiotic Interfaces', desc: 'Voice-native cognitive companions, tactile ambient intelligence, and immersive three-dimensional spatial environments.' },
  ],
  stats: [
    { label: 'Trajectory', value: '∞ Unbounded' },
    { label: 'Research Focus', value: 'AGI & Vision' },
    { label: 'Commits Stream', value: 'Continuous' },
    { label: 'Cosmic Status', value: 'Active' },
  ],
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
