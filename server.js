import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getChatReply } from './chat-handler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
if (process.env.PORT && Number.isNaN(Number(process.env.PORT))) {
  console.warn('Invalid PORT env value, falling back to 3000');
}

// Redirect non-www domain to canonical www domain
app.use((req, res, next) => {
  const host = req.headers.host;
  if (host && host.toLowerCase() === 'rameshworchaudhary.com.np') {
    return res.redirect(301, `https://www.rameshworchaudhary.com.np${req.originalUrl || req.url}`);
  }
  next();
});

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid message string is required.' });
    }

    const reply = await getChatReply(message, history);
    return res.json({ reply });
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
