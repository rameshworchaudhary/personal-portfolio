import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getChatReply } from './chat-handler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Redirect non-www domain to canonical www domain
app.use((req, res, next) => {
  const host = req.headers.host;
  if (host && host.toLowerCase() === 'rameshworchaudhary.com.np') {
    return res.redirect(301, `https://www.rameshworchaudhary.com.np${req.originalUrl || req.url}`);
  }
  next();
});

app.use((req, res, next) => {
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  res.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.web3forms.com https:; frame-ancestors 'none'; base-uri 'self'");
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
  try {
    const { message, query, history = [] } = req.body || {};
    const userMsg = message || query;
    if (!userMsg || typeof userMsg !== 'string') {
      return res.status(400).json({ error: 'Valid message string is required.' });
    }

    const reply = await getChatReply(userMsg, Array.isArray(history) ? history : []);
    return res.json({
      reply,
      response: reply,
      message: reply
    });
  } catch (err) {
    console.error('Chat API Error:', err);
    return res.status(500).json({ error: 'Server error processing chat request.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}
