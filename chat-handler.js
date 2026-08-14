import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

let geminiClient = null;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: apiKey.trim() });
  }
  return geminiClient;
}

const SYSTEM_PROMPT = `You are Ishwor, the official AI Voice Assistant for Rameshwor Chaudhary's portfolio.
Your goal is to answer questions about Rameshwor Chaudhary's profile, education, skills, projects, research, and contact details, as well as general technology, AI, computer science, and educational queries.

KNOWLEDGE BASE:
- Full Name: Rameshwor Chaudhary (also known as Ishwor Chaudhary)
- Primary Profession: AI/ML Engineer, Creative Full-Stack Developer & Digital Lab Specialist
- Education: B.E. (Bachelor of Engineering) in Computer Science & Engineering with Specialization in Artificial Intelligence & Machine Learning at Chandigarh University (CU), Punjab, India.
- Core Skills:
  * Languages: Python, C++, JavaScript, TypeScript, SQL, HTML5, CSS3.
  * AI/ML & Data: PyTorch, TensorFlow, Scikit-learn, OpenCV, RAG (Retrieval-Augmented Generation), LLMs, NLP, Computer Vision, LangChain, Hugging Face, Vector Databases.
  * Web & Backend: React, Node.js, Express, FastAPI, Flask, Three.js, GSAP, Tailwind CSS, REST APIs.
  * Tools & Cloud: Git, GitHub, Docker, Linux, Google Cloud Platform (GCP).
- Key Projects:
  1. Exam Mind AI: AI-driven adaptive exam prep and study agent providing smart quizzes, flashcards, and weak-area analytics.
  2. Doc Intel AI / RAG Chatbot: Production-grade RAG pipeline to query complex PDFs and documents with vector search.
  3. AI Resume Builder: ATS optimization engine and resume generator tailoring bullet points for tech roles.
  4. Ishwor AI Voice Assistant: Real-time voice-interactive portfolio assistant supporting multi-lingual Hinglish voice chat.
  5. 3D Digital Lab Portfolio: Immersive WebGL portfolio with particle physics, interactive doodles, and blueprint mode.
- Research & Achievements: AI research in NLP optimization and computer vision; active hackathon participant and winner in AI/ML events.
- Contact Details:
  * Email: chaudharyishwor143@gmail.com
  * GitHub: https://github.com/rameshworchaudhary
  * LinkedIn: https://linkedin.com/in/rameshworchaudhary
- Status: Available for AI/ML roles, Full-Stack engineering, internships, and collaborative research projects.

STRICT INSTRUCTIONS:
1. Language: Automatically detect user language (English, Hindi, or Hinglish).
   - If asked in Hinglish (e.g. "bhai Rameshwor ke best projects kaunse hain?" or "AI kya hota hai?"), respond in natural, friendly Hinglish.
   - If asked in English, respond in clear, professional English.
2. Portfolio Accuracy & General/Educational Questions:
   - For Rameshwor's personal credentials (his projects, work, experience), stick accurately to the Knowledge Base.
   - For general questions (e.g. "What is AI?", "What is Machine Learning?", "How does RAG work?", "How to learn Python?"), answer intelligently and accurately using your general knowledge!
3. Length & Format: Keep answers conversational, friendly, and concise (2 to 4 sentences) because your response will be read aloud by Text-to-Speech. Avoid heavy markdown tables or code blocks unless requested.`;

function getFallbackResponse(userMsg) {
  const q = (userMsg || '').toLowerCase();

  if (q.includes('what is ai') || q.includes('ai kya') || q.includes('artificial intelligence')) {
    return "AI (Artificial Intelligence) human intelligence ko machines mein simulate karne ki technology hai, jisse systems learn, reason aur problems solve kar sakte hain. Rameshwor builds AI models like LLMs, RAG systems, and Computer Vision solutions!";
  }
  if (q.includes('machine learning') || q.includes('ml kya') || q.includes('what is ml')) {
    return "Machine Learning AI ka ek branch hai jahan algorithms data se patterns learn karke predictions banate hain bina explicit programming ke. Rameshwor PyTorch aur TensorFlow use karke ML models build karta hai.";
  }
  if (q.includes('who') || q.includes('about') || q.includes('rameshwor') || q.includes('ishwor') || q.includes('kaun')) {
    return "Rameshwor Chaudhary is an AI/ML Engineer and Creative Full-Stack Developer pursuing B.E. in Computer Science (AI/ML) at Chandigarh University. He specializes in PyTorch, RAG, LLMs, Computer Vision, and full-stack web applications.";
  }
  if (q.includes('project') || q.includes('work') || q.includes('build')) {
    return "Rameshwor's top projects include Exam Mind AI (an adaptive study agent), Doc Intel RAG Chatbot, AI Resume Builder, and his 3D Digital Lab Portfolio. You can check them out directly in the Projects section!";
  }
  if (q.includes('skill') || q.includes('language') || q.includes('tech') || q.includes('know') || q.includes('react') || q.includes('python')) {
    return "Rameshwor is skilled in Python, C++, JavaScript, TypeScript, PyTorch, TensorFlow, OpenCV, FastAPI, React, Node.js, Express, Three.js, Docker, and RAG architectures.";
  }
  if (q.includes('education') || q.includes('college') || q.includes('university') || q.includes('chandigarh') || q.includes('degree')) {
    return "Rameshwor is studying B.E. in Computer Science Engineering with specialization in AI & ML at Chandigarh University, Punjab, India.";
  }
  if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('github') || q.includes('linkedin') || q.includes('hire')) {
    return "You can reach Rameshwor via email at chaudharyishwor143@gmail.com, or connect on GitHub (rameshworchaudhary) and LinkedIn (in/rameshworchaudhary). He is open for opportunities!";
  }
  if (q.includes('research') || q.includes('paper') || q.includes('achievement') || q.includes('hackathon')) {
    return "Rameshwor works on research topics in NLP optimization and computer vision, and has actively participated and won in AI/ML hackathons.";
  }
  return "Rameshwor Chaudhary is an AI/ML Engineer & Full-Stack Developer specializing in PyTorch, LLMs, RAG, and WebGL. Ask me anything about his skills, projects, or general AI and education topics!";
}

function buildMessagePayload(message, history = []) {
  const formattedHistory = history.slice(-6).map(item => ({
    role: item.role === 'user' ? 'user' : 'assistant',
    content: item.content
  }));

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...formattedHistory,
    { role: 'user', content: message }
  ];
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getChatReply(message, history = []) {
  // 1. Try Google Gemini API if GEMINI_API_KEY is available
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const contents = [
        ...history.slice(-6).map(item => ({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.content }]
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.6,
          maxOutputTokens: 300
        }
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (geminiError) {
      console.error('Gemini API Error:', geminiError);
    }
  }

  // 2. Try Groq API if GROQ_API_KEY is available
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey.trim() !== '' && !groqKey.includes('your_groq_api_key')) {
    try {
      const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey.trim()}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: buildMessagePayload(message, history),
          temperature: 0.6,
          max_tokens: 250
        })
      }, 7000);

      if (response && response.ok) {
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) {
          return reply;
        }
      } else {
        const errorText = response ? await response.text().catch(() => '') : '';
        console.warn('Groq API response not OK:', response?.status, errorText);
      }
    } catch (error) {
      console.error('Groq API Error:', error);
    }
  }

  // 3. Fallback response for offline or unconfigured states
  return getFallbackResponse(message);
}
