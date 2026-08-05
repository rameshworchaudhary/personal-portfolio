import { getChatReply } from '../chat-handler.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (!body || typeof body === 'string') {
      try {
        body = JSON.parse(body || '{}');
      } catch (parseError) {
        return res.status(400).json({ error: 'Invalid JSON body.' });
      }
    }

    const { message, history = [] } = body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid message string is required.' });
    }

    const reply = await getChatReply(message, history);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('API chat handler error:', error);
    return res.status(500).json({ error: 'Server error processing chat request.' });
  }
}
