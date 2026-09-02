import dotenv from 'dotenv';

dotenv.config();

const SYSTEM_PROMPT = `You are Ishwor, a smart, friendly AI Voice Assistant for Rameshwor Chaudhary's portfolio.

TONE & PERSONALITY GUIDELINES:
- Speak naturally like a warm, knowledgeable Indian tech friend / peer.
- In English: Use clear, conversational Indian English. Avoid robotic, stiff phrases. Keep it warm, direct, and concise (e.g. "Sure! Rameshwor is studying at Chandigarh University...", "He specializes in AI/ML and RAG systems...").
- In Hinglish / Hindi: Respond naturally in everyday conversational Hinglish (e.g. "Haan bilkul!", "Main Ishwor hoon, Rameshwor ka AI voice assistant...").
- Keep answers concise (2-3 sentences maximum) so that they sound crisp and natural when read aloud by Text-to-Speech (TTS).
- Answer general questions (business analysis, science, coding, everyday topics, humor, etc.) directly and accurately.
- No heavy markdown, no bullet lists, no asterisks or code fences unless asked.

KNOWLEDGE BASE:
- Full Name: Rameshwor Chaudhary (also known as Ishwor Chaudhary)
- Primary Role: AI/ML Engineer & Full-Stack Developer
- Education: B.E. in Computer Science & Engineering (Specialization in AI & ML) at Chandigarh University (CU), Punjab, India.
- Core Skills: Python, C++, JavaScript, TypeScript, PyTorch, TensorFlow, OpenCV, RAG, LLMs, Computer Vision, FastAPI, React, Node.js, Express, Three.js, Docker, GCP.
- Key Projects:
  1. Exam Mind AI: Adaptive AI exam prep and study platform with interactive question generation.
  2. Doc Intel RAG Chatbot: Document search & QA pipeline using vector embeddings and LLM retrieval.
  3. AI Resume Builder: Smart ATS-optimized resume generator.
  4. Ishwor AI Voice Assistant: Real-time multi-lingual voice companion with speech recognition & synthesis.
  5. 3D Digital Lab Portfolio: WebGL interactive portfolio with physics and blueprints.
- Contact: Email: chaudharyishwor143@gmail.com | GitHub: rameshworchaudhary | LinkedIn: in/chaudhari-ishwor
- Status: Open for AI/ML engineering roles, internships, and research collaborations.`;

/**
 * Intelligent Contextual Offline Fallback
 * Provides accurate, helpful answers based on portfolio context and general tech concepts
 */
function getOfflineResponse(userMsg) {
  const q = (userMsg || '').toLowerCase().trim();

  // Greetings
  if (/\b(hi|hello|hey|namaste|pranam|hola|kasa ho|kaisa hai|kem cho|good morning|good evening|good afternoon|hiya|yo)\b/i.test(q)) {
    return "Namaste! Main Ishwor hoon, Rameshwor Chaudhary ka AI voice assistant. Aap Rameshwor ke projects, AI/ML skills, education ya kisi bhi tech topic ke baare mein pooch sakte hain!";
  }

  // Model / identity query
  if (q.includes('kaun sa model') || q.includes('which model') || q.includes('what model') || q.includes('who made you') || q.includes('model used') || q.includes('architecture')) {
    return "Main Ishwor AI voice assistant hoon, primary powered by Groq and NVIDIA Nemotron models with a built-in contextual engine, specially customized for Rameshwor Chaudhary's portfolio!";
  }

  // Identity / Assistant Info
  if (q.includes('who are you') || q.includes('aap kaun ho') || q.includes('tum kaun') || q.includes('your name') || q.includes('tera naam') || q.includes('what are you')) {
    return "I am Ishwor, the intelligent AI voice assistant for Rameshwor Chaudhary's portfolio. I can help you explore his AI/ML projects, skills, education, and answer any tech questions.";
  }

  // Specific AI / ML Concepts & Questions
  if (q.includes('what is machine learning') || q.includes('what is ml') || q.includes('ml kya hai') || q.includes('define machine learning') || q.includes('machine learning')) {
    return "Machine Learning is a subset of AI where algorithms learn patterns directly from data to make predictions or decisions without being explicitly programmed for every rule. Rameshwor uses PyTorch and Scikit-Learn to build custom ML models.";
  }
  if (q.includes('what is artificial intelligence') || q.includes('what is ai') || q.includes('ai kya hai') || q.includes('define ai') || q.includes('generative ai')) {
    return "Artificial Intelligence is the science of creating computer systems capable of performing tasks that typically require human intelligence, such as reasoning, visual perception, decision-making, and natural language understanding.";
  }
  if (q.includes('neural network') || q.includes('neural') || q.includes('deep learning') || q.includes('cnn') || q.includes('rnn') || q.includes('transformer')) {
    return "Neural networks are computational models inspired by biological neurons in the human brain, composed of interconnected layers that process complex representations. Rameshwor builds and trains custom neural architectures using PyTorch!";
  }
  if (q.includes('what is rag') || q.includes('retrieval augmented generation') || q.includes('rag kya hai') || q.includes('rag pipeline')) {
    return "RAG (Retrieval-Augmented Generation) connects Large Language Models to external vector databases, allowing AI models to retrieve relevant documents and produce accurate, grounded answers without hallucinations.";
  }
  if (q.includes('what is computer vision') || q.includes('computer vision') || q.includes('opencv')) {
    return "Computer Vision enables software to process and understand visual data like photos and real-time video streams. Rameshwor develops CV pipelines for object detection, segmentation, and feature extraction using OpenCV and PyTorch.";
  }
  if (q.includes('what is nlp') || q.includes('natural language processing') || q.includes('llm') || q.includes('large language model')) {
    return "Natural Language Processing (NLP) enables computers to analyze, understand, and generate human language. Rameshwor works extensively with transformer models, tokenization, semantic embeddings, and LLM integrations.";
  }
  if (q.includes('python')) {
    return "Python is Rameshwor's primary language for developing AI models, data pipelines, PyTorch neural networks, computer vision tools, and backend APIs with FastAPI and Flask.";
  }
  if (q.includes('three.js') || q.includes('threejs') || q.includes('webgl') || q.includes('3d')) {
    return "Three.js is a lightweight 3D library built on WebGL. Rameshwor uses Three.js and custom shaders to craft interactive 3D digital labs and particle canvas animations for modern web experiences.";
  }
  if (q.includes('docker') || q.includes('container')) {
    return "Docker allows developers to package applications and their dependencies into lightweight containers, ensuring consistent execution across development, testing, and production servers.";
  }

  // Rameshwor Profile / Bio / About
  if (q.includes('who is rameshwor') || q.includes('about rameshwor') || q.includes('about him') || q.includes('rameshwor kaun') || q.includes('tell me about rameshwor') || q.includes('introduce rameshwor') || q.includes('who is he')) {
    return "Rameshwor Chaudhary is an AI/ML Engineer and Full-Stack Developer currently pursuing his B.E. in Computer Science (AI & ML) at Chandigarh University. He builds production-grade machine learning models, RAG pipelines, and interactive web systems.";
  }

  // Projects / Work / Portfolio creations
  if (/\b(project|projects|work|creations|built|banaya|banaye)\b/i.test(q) || q.includes('what has he built') || q.includes('what have you built') || q.includes('what did you build')) {
    if (q.includes('exam mind') || q.includes('exam')) {
      return "Exam Mind AI is Rameshwor's adaptive exam preparation platform featuring interactive AI study assistants, question generation tools, and full authentication.";
    }
    if (q.includes('rag') || q.includes('doc intel') || q.includes('document')) {
      return "Doc Intel RAG Chatbot is an intelligent document retrieval and QA system that extracts context from large PDFs and documents using vector embeddings and LLM reasoning.";
    }
    if (q.includes('resume') || q.includes('builder')) {
      return "The AI Resume Builder is a smart tool developed by Rameshwor that creates ATS-optimized professional resumes with intelligent content suggestions.";
    }
    if (q.includes('voice') || q.includes('assistant') || q.includes('ishwor')) {
      return "Ishwor AI Voice Assistant is this interactive multi-lingual assistant featuring real-time speech recognition, natural TTS synthesis, and high-speed multi-provider AI fallback.";
    }
    return "Rameshwor has built several standout projects including Exam Mind AI (study platform), Doc Intel RAG Chatbot, AI Resume Builder, and this 3D Digital Lab Portfolio. Check out the Projects section for live demos and code!";
  }

  // Skills & Tech Stack
  if (/\b(skill|skills|stack|technologies|languages|tech|tools)\b/i.test(q) || q.includes('tech stack') || q.includes('kya kya aata')) {
    return "Rameshwor is proficient in Python, C++, JavaScript, TypeScript, PyTorch, TensorFlow, OpenCV, FastAPI, React, Node.js, Express, Three.js, Docker, and GCP for AI/ML and full-stack development.";
  }

  // Business Analysis query
  if (q.includes('business analysis') || q.includes('ba kya hai') || q.includes('business analyst')) {
    return "Business Analysis is the practice of identifying business needs, analyzing data and processes, and determining solutions to deliver value and drive strategic organizational growth.";
  }

  // Education / College / University
  if (/\b(education|college|university|chandigarh|cu|degree|study|studying|padhai|campus)\b/i.test(q)) {
    return "Rameshwor is studying at Chandigarh University (CU), Punjab, India, pursuing a Bachelor of Engineering in Computer Science with a specialization in Artificial Intelligence & Machine Learning.";
  }

  // Contact / Hire / Opportunities
  if (/\b(contact|email|reach|phone|hire|job|hiring|internship|connect|linkedin|github)\b/i.test(q)) {
    return "You can reach Rameshwor via email at chaudharyishwor143@gmail.com, or connect on LinkedIn (in/chaudhari-ishwor) and GitHub (rameshworchaudhary). He is open to AI/ML engineering roles and research collaborations!";
  }

  // Research / Achievements / Hackathons
  if (/\b(research|paper|hackathon|hackathons|achievement|achievements|award|awards|publication)\b/i.test(q)) {
    return "Rameshwor actively conducts research in NLP optimization and computer vision pipelines, and has participated in multiple competitive AI/ML hackathons building real-world software solutions.";
  }

  // Math basic calculation
  const mathMatch = q.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseFloat(mathMatch[3]);
    let res = 0;
    if (op === '+') res = a + b;
    else if (op === '-') res = a - b;
    else if (op === '*') res = a * b;
    else if (op === '/') res = b !== 0 ? (a / b).toFixed(2) : 'Infinity';
    return `${a} ${op} ${b} = ${res} hota hai!`;
  }

  // Fun / Jokes
  if (/\b(joke|jokes|funny|chutkula|hasao)\b/i.test(q)) {
    return "Why do AI models love coffee? Because it helps them reduce their loss and avoid overfitting! 😄";
  }

  // Casual / slang reaction
  if (q.includes('bhai') || q.includes('arre') || q.includes('kya bol raha') || q.includes('shant')) {
    return "Arre bhai! Main Ishwor hoon, Rameshwor ka AI voice assistant. Poocho kya jaanna hai coding, AI/ML models ya portfolio projects ke baare mein?";
  }

  // General fallback tailored with portfolio context
  return `That's an interesting question about "${userMsg}". Rameshwor specializes in AI/ML systems, Computer Vision, RAG architectures, and Full-Stack Engineering. Feel free to ask about his projects, skills, education at Chandigarh University, or get in touch for collaboration!`;
}

function buildMessages(message, history = []) {
  let historyList = Array.isArray(history) ? history.slice(-6) : [];
  if (historyList.length > 0) {
    const lastItem = historyList[historyList.length - 1];
    if (lastItem && lastItem.role === 'user' && (lastItem.content === message || lastItem.text === message)) {
      historyList = historyList.slice(0, -1);
    }
  }

  const formattedHistory = historyList.map(item => ({
    role: item.role === 'user' ? 'user' : 'assistant',
    content: item.content || item.text || ''
  })).filter(item => item.content);

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...formattedHistory,
    { role: 'user', content: message }
  ];
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * 1. PRIMARY: Groq
 */
async function tryGroqPrimary(trimmedMsg, history) {
  const groqKey = (process.env.GROQ_API_KEY || '').trim();
  if (!groqKey || groqKey.includes('your_groq_api_key')) {
    return null;
  }

  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  const modelsToTry = [
    (process.env.GROQ_MODEL || '').trim(),
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768'
  ].filter(Boolean);

  for (const model of modelsToTry) {
    try {
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: buildMessages(trimmedMsg, history),
          temperature: 0.7,
          max_tokens: 350
        })
      }, 8000);

      if (response && response.ok) {
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply && reply.trim()) {
          return reply.trim().replace(/\*\*/g, '').replace(/\*/g, '');
        }
      }
    } catch (err) {
      // Continue to next fallback model
    }
  }

  return null;
}

/**
 * 2. FALLBACK: NVIDIA Nemotron
 */
async function tryNvidiaNemotron(trimmedMsg, history) {
  const nemotronKey = (process.env.NEMOTRON_API_KEY || process.env.NVIDIA_API_KEY || process.env.OPENROUTER_API_KEY || '').trim();
  if (!nemotronKey || nemotronKey.includes('your_nemotron_api_key') || nemotronKey.includes('your_nvidia_api_key')) {
    return null;
  }

  const isOpenRouter = nemotronKey.startsWith('sk-or-');

  let rawEndpoint = (process.env.NEMOTRON_API_URL || '').trim();
  let endpoint = rawEndpoint;
  if (!endpoint) {
    endpoint = isOpenRouter
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://integrate.api.nvidia.com/v1/chat/completions';
  } else if (!endpoint.endsWith('/chat/completions')) {
    endpoint = endpoint.replace(/\/+$/, '') + '/chat/completions';
  }

  const modelsToTry = [
    (process.env.NEMOTRON_MODEL || '').trim(),
    'nvidia/nemotron-3-super-120b-a12b',
    'meta/llama-3.3-70b-instruct'
  ].filter(Boolean);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${nemotronKey}`
  };

  if (isOpenRouter) {
    headers['HTTP-Referer'] = 'https://rameshworchaudhary.com.np';
    headers['X-Title'] = 'Rameshwor Chaudhary Portfolio';
  }

  const maxRetries = 1;
  const retryDelays = [800];

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetchWithTimeout(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: model,
            messages: buildMessages(trimmedMsg, history),
            temperature: 0.7,
            max_tokens: 350
          })
        }, 8000);

        if (response && response.ok) {
          const data = await response.json();
          const reply = data?.choices?.[0]?.message?.content;
          if (reply && reply.trim()) {
            return reply.trim().replace(/\*\*/g, '').replace(/\*/g, '');
          }
        } else if (response && (response.status === 503 || response.status === 429)) {
          if (attempt < maxRetries) {
            await delay(retryDelays[attempt] || 800);
            continue;
          }
        }
      } catch (err) {
        if (err.name === 'AbortError' && attempt < maxRetries) {
          await delay(retryDelays[attempt] || 800);
          continue;
        }
      }
      break;
    }
  }

  return null;
}

/**
 * Orchestrator:
 * User Request -> Groq (Primary if key set) -> NVIDIA Nemotron (Fallback if key set) -> Offline Contextual Engine
 */
export async function getChatReply(message, history = []) {
  const trimmedMsg = (message || '').trim();
  if (!trimmedMsg) {
    return "Namaste! Main Rameshwor ka AI voice assistant hoon. Aap mujhse koi bhi sawal pooch sakte hain!";
  }

  // 1. PRIMARY: Groq (if key available)
  const groqKey = (process.env.GROQ_API_KEY || '').trim();
  if (groqKey && !groqKey.includes('your_groq_api_key')) {
    const groqReply = await tryGroqPrimary(trimmedMsg, history);
    if (groqReply) {
      return groqReply;
    }
  }

  // 2. FALLBACK: NVIDIA Nemotron (if key available)
  const nemotronKey = (process.env.NEMOTRON_API_KEY || process.env.NVIDIA_API_KEY || process.env.OPENROUTER_API_KEY || '').trim();
  if (nemotronKey && !nemotronKey.includes('your_nemotron_api_key') && !nemotronKey.includes('your_nvidia_api_key')) {
    const nvidiaReply = await tryNvidiaNemotron(trimmedMsg, history);
    if (nvidiaReply) {
      return nvidiaReply;
    }
  }

  // 3. CONTEXTUAL KNOWLEDGE ENGINE: Fast, accurate portfolio responses
  return getOfflineResponse(trimmedMsg);
}
