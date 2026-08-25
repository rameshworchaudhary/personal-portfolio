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
  1. Exam Mind AI: Adaptive AI exam prep and study platform.
  2. Doc Intel RAG Chatbot: Document search & QA pipeline using vector embeddings.
  3. AI Resume Builder: Smart ATS-optimized resume generator.
  4. Ishwor AI Voice Assistant: Real-time multi-lingual voice companion.
  5. 3D Digital Lab Portfolio: WebGL interactive portfolio with physics and blueprints.
- Contact: Email: chaudharyishwor143@gmail.com | GitHub: rameshworchaudhary | LinkedIn: in/rameshworchaudhary
- Status: Open for AI/ML engineering roles, internships, and research collaborations.`;

function getOfflineResponse(userMsg) {
  const q = (userMsg || '').toLowerCase().trim();

  // Greetings
  if (/\b(hi|hello|hey|namaste|pranam|hola|kasa ho|kaisa hai|kem cho|good morning|good evening)\b/i.test(q)) {
    return "Namaste! Main Ishwor hoon, Rameshwor ka AI voice companion. Aapko Rameshwor ke projects, AI/ML skills ya kisi tech topic ke baare mein kya jaanna hai?";
  }

  // Model / identity query
  if (q.includes('kaun sa model') || q.includes('which model') || q.includes('what model') || q.includes('who made you')) {
    return "Main Ishwor AI assistant hoon, powered by NVIDIA Nemotron 3 Ultra with high-speed Groq fallback, specially tuned for Rameshwor Chaudhary's portfolio!";
  }

  // Identity / Assistant Info
  if (q.includes('who are you') || q.includes('aap kaun ho') || q.includes('tum kaun') || q.includes('your name') || q.includes('tera naam')) {
    return "Main Ishwor hoon, Rameshwor Chaudhary ka intelligent AI voice assistant. Main portfolio visitors ko unke work aur general tech queries mein guide karta hoon.";
  }

  // Business Analysis query
  if (q.includes('business analysis') || q.includes('ba kya hai') || q.includes('business analyst')) {
    return "Business Analysis ek practice hai jisme business data, requirements aur processes ko analyze karke solutions design kiye jaate hain taaki business growth aur efficiency increase ho sake.";
  }

  // Rameshwor Profile / Bio
  if (q.includes('who is rameshwor') || q.includes('about rameshwor') || q.includes('about him') || q.includes('rameshwor kaun') || q.includes('tell me about')) {
    return "Rameshwor Chaudhary ek energetic AI/ML Engineer aur Full-Stack Developer hain jo Chandigarh University se B.E. in AI/ML kar rahe hain. Unka focus cutting-edge LLMs, RAG pipelines aur interactive WebGL applications build karne par hai.";
  }

  // Skills & Tech Stack
  if (/\b(skill|skills|stack|technologies|languages|tech)\b/i.test(q) || q.includes('tech stack') || q.includes('kya kya aata')) {
    return "Rameshwor Python, C++, JavaScript, TypeScript, PyTorch, TensorFlow, OpenCV, RAG, LLMs, FastAPI, React, Node.js, Three.js aur Docker mein proficient hain.";
  }

  // Specific Technologies
  if (/\b(python)\b/i.test(q)) {
    return "Python Rameshwor ki core language hai, jisme unhone AI model training, PyTorch pipelines, computer vision aur backend APIs develop kiye hain.";
  }
  if (/\b(rag|retrieval)\b/i.test(q) || q.includes('retrieval augmented')) {
    return "RAG (Retrieval-Augmented Generation) LLMs ko external documents aur vector databases se live factual data provide karta hai. Rameshwor ne Doc Intel RAG Chatbot build kiya hai!";
  }
  if (/\b(ai|artificial intelligence|generative ai)\b/i.test(q)) {
    return "Artificial Intelligence machines ko insani intelligence jaisi problem-solving aur learning abilities deta hai. Rameshwor deep learning aur generative AI tools develop karte hain.";
  }
  if (/\b(ml|machine learning)\b/i.test(q)) {
    return "Machine Learning data se pattern seekh kar predictions banata hai. Rameshwor PyTorch aur Scikit-Learn use karke ML models build karte hain.";
  }
  if (/\b(three\.?js|webgl|3d)\b/i.test(q)) {
    return "Rameshwor Three.js aur WebGL shaders ka use karke 3D digital labs aur interactive particle animations design karte hain, jaise is portfolio ka background canvas!";
  }

  // Projects / Work / Creations
  if (/\b(project|projects|work|creations|build|built|banaya|banaye)\b/i.test(q)) {
    return "Rameshwor ke top projects mein Exam Mind AI (adaptive study platform), Doc Intel RAG Chatbot, AI Resume Builder aur ye 3D Digital Lab shamil hain. Details ke liye Projects section dekhein!";
  }

  // Education / College
  if (/\b(education|college|university|chandigarh|cu|degree|study|studying|padhai)\b/i.test(q)) {
    return "Rameshwor Chandigarh University (Punjab, India) se B.E. Computer Science Engineering kar rahe hain with specialization in Artificial Intelligence & Machine Learning.";
  }

  // Contact / Hire
  if (/\b(contact|email|reach|phone|hire|job|hiring|internship|connect)\b/i.test(q)) {
    return "Aap unhe directly email kar sakte hain chaudharyishwor143@gmail.com par, ya LinkedIn aur GitHub par message bhej sakte hain. He is open for exciting opportunities!";
  }

  // Research / Achievements
  if (/\b(research|paper|hackathon|hackathons|achievement|achievements|award|awards)\b/i.test(q)) {
    return "Rameshwor NLP optimization aur Computer Vision research par work kar rahe hain, aur unhone multiple AI/ML hackathons mein participate kiya hai.";
  }

  // Fun / Jokes
  if (/\b(joke|jokes|funny|chutkula|hasao)\b/i.test(q)) {
    return "Ek developer ne doctor se kaha: 'Doctor sahab, meri aankhein dukh rahi hain jab main code run karta hoon.' Doctor ne kaha: 'Toh code run mat karo, bug free likho!'";
  }

  // Casual / slang reaction
  if (q.includes('chutiye') || q.includes('bhai') || q.includes('arre') || q.includes('kya bol raha')) {
    return "Arre bhai shant ho jao! Main Ishwor hoon, aapka AI assistant. Poocho kya madad chahiye coding, tech ya Rameshwor ke projects ke baare mein?";
  }

  // Neural Networks / Deep Learning
  if (/\b(neural|deep learning|cnn|rnn|transformer|llm|llms)\b/i.test(q)) {
    return "Neural networks brain ke biological neurons se inspired computational models hote hain. Rameshwor Transformer architectures aur PyTorch use karke custom models train karte hain!";
  }

  // Math basic calculation
  const mathMatch = q.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
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

  return "Main aapki baat samajh gaya! Aap mujhse Rameshwor ke projects, AI/ML skills, education ya kisi bhi computer science topic ke baare mein pooch sakte hain.";
}

function buildMessages(message, history = []) {
  const formattedHistory = (history || []).slice(-6).map(item => ({
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
 * Primary Provider: NVIDIA Nemotron 3 Ultra (with 503/429 exponential backoff retries)
 */
async function tryNvidiaNemotron(trimmedMsg, history) {
  const nemotronKey = (process.env.NEMOTRON_API_KEY || process.env.NVIDIA_API_KEY || process.env.OPENROUTER_API_KEY || '').trim();
  if (!nemotronKey || nemotronKey.includes('your_nemotron_api_key') || nemotronKey.includes('your_nvidia_api_key')) {
    return null;
  }

  console.log('[NVIDIA Nemotron] Request started');
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

  const model = (process.env.NEMOTRON_MODEL || '').trim() || (isOpenRouter
    ? 'nvidia/nemotron-3-ultra'
    : 'nvidia/nemotron-3-ultra');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${nemotronKey}`
  };

  if (isOpenRouter) {
    headers['HTTP-Referer'] = 'https://rameshworchaudhary.com.np';
    headers['X-Title'] = 'Rameshwor Chaudhary Portfolio';
  }

  const maxRetries = 3;
  const retryDelays = [1000, 2000, 4000];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model,
          messages: buildMessages(trimmedMsg, history),
          temperature: 0.7,
          max_tokens: 300
        })
      }, 10000);

      if (response && response.ok) {
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply && reply.trim()) {
          console.log('[NVIDIA Nemotron] Request successful');
          return reply.trim().replace(/\*\*/g, '').replace(/\*/g, '');
        }
      } else if (response && (response.status === 503 || response.status === 429)) {
        const status = response.status;
        const statusText = status === 503 ? '503 Service Temporarily Overloaded' : '429 Rate Limit Exceeded';

        if (attempt < maxRetries) {
          const waitTime = retryDelays[attempt] || 1000 * Math.pow(2, attempt);
          console.log(`[NVIDIA Nemotron] ${status} received (${statusText}), retrying attempt ${attempt + 1}/${maxRetries} in ${waitTime}ms...`);
          await delay(waitTime);
          continue;
        } else {
          console.warn(`[NVIDIA Nemotron] ${status} received, all ${maxRetries} retries exhausted.`);
          break;
        }
      } else {
        const errText = response ? await response.text().catch(() => '') : '';
        console.warn(`[NVIDIA Nemotron] API returned status ${response?.status}:`, errText);
        break;
      }
    } catch (err) {
      if (err.name === 'AbortError' && attempt < maxRetries) {
        const waitTime = retryDelays[attempt] || 1000;
        console.log(`[NVIDIA Nemotron] Request timeout/abort, retrying attempt ${attempt + 1}/${maxRetries} in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
      console.warn('[NVIDIA Nemotron] Request error:', err.message);
      break;
    }
  }

  console.log('[NVIDIA Nemotron] Request failed');
  return null;
}

/**
 * Secondary Fallback Provider: Groq (llama-3.3-70b-versatile or llama-3.1-8b-instant)
 */
async function tryGroqFallback(trimmedMsg, history) {
  const groqKey = (process.env.GROQ_API_KEY || '').trim();
  if (!groqKey || groqKey.includes('your_groq_api_key')) {
    return null;
  }

  console.log('[NVIDIA Nemotron] Trying Groq fallback...');
  console.log('[Groq] Fallback request started');

  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  const model = (process.env.GROQ_MODEL || '').trim() || 'llama-3.3-70b-versatile';

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
        max_tokens: 300
      })
    }, 10000);

    if (response && response.ok) {
      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (reply && reply.trim()) {
        console.log('[Groq] Fallback request successful');
        return reply.trim().replace(/\*\*/g, '').replace(/\*/g, '');
      }
    } else {
      const errText = response ? await response.text().catch(() => '') : '';
      console.warn(`[Groq] API returned status ${response?.status}:`, errText);
    }
  } catch (err) {
    console.warn('[Groq] Fallback request error:', err.message);
  }

  return null;
}

/**
 * Orchestrator:
 * User Request -> NVIDIA Nemotron (Primary) -> If fails -> Groq (Fallback) -> If fails -> Clean Safe Response
 */
export async function getChatReply(message, history = []) {
  const trimmedMsg = (message || '').trim();
  if (!trimmedMsg) {
    return "Namaste! Main Rameshwor ka AI voice assistant hoon. Aap mujhse koi bhi sawal pooch sakte hain!";
  }

  // 1. PRIMARY: Try NVIDIA Nemotron 3 Ultra
  const nvidiaReply = await tryNvidiaNemotron(trimmedMsg, history);
  if (nvidiaReply) {
    return nvidiaReply;
  }

  // 2. SECONDARY: Try Groq Fallback
  const groqReply = await tryGroqFallback(trimmedMsg, history);
  if (groqReply) {
    return groqReply;
  }

  // 3. Clean Error / Offline Fallback if both remote providers are unreachable
  console.log('[AI] NVIDIA and Groq both failed (or not configured). Using local engine.');
  return getOfflineResponse(trimmedMsg);
}
