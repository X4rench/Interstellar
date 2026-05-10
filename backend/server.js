import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const POLZA_API_URL = process.env.POLZA_API_URL || 'https://api.polza.ai/api/v1/chat/completions';
const MODEL = process.env.POLZA_MODEL || 'grok-4.1-fast';
const PORT = Number(process.env.PORT) || 3001;
const POLZA_KEY = process.env.POLZA_API_KEY;

if (!POLZA_KEY) {
  console.error('[fatal] POLZA_API_KEY is not set. Create backend/.env from .env.');
  process.exit(1);
}

const MAX_PERSONA_LEN = 8000;
const MAX_MSG_LEN = 4000;
const MAX_HISTORY = 60;
const REQUEST_TIMEOUT_MS = 60_000;

const app = express();
app.use(cors());
app.use(express.json({ limit: '512kb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, model: MODEL });
});

app.post('/api/v1/chat', async (req, res) => {
  const { persona, messages } = req.body || {};

  if (typeof persona !== 'string' || !persona.trim()) {
    return res.status(400).json({ ok: false, error: 'BAD_PERSONA' });
  }
  if (persona.length > MAX_PERSONA_LEN) {
    return res.status(400).json({ ok: false, error: 'PERSONA_TOO_LONG' });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ ok: false, error: 'BAD_MESSAGES' });
  }
  if (messages.length > MAX_HISTORY) {
    return res.status(400).json({ ok: false, error: 'HISTORY_TOO_LONG' });
  }

  const aiMessages = [
    { role: 'system', content: persona },
    ...messages.map((m) => {
      const role = m?.role === 'user' ? 'user' : 'assistant';
      const content = String(m?.content ?? '').slice(0, MAX_MSG_LEN);
      return { role, content };
    }),
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(POLZA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POLZA_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: aiMessages,
        temperature: 0.9,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      console.error('[polza] upstream error', upstream.status, text.slice(0, 500));
      return res.status(502).json({ ok: false, error: 'UPSTREAM_ERROR', status: upstream.status });
    }

    const data = await upstream.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      console.error('[polza] empty content in response', JSON.stringify(data).slice(0, 500));
      return res.status(502).json({ ok: false, error: 'EMPTY_RESPONSE' });
    }

    return res.json({ ok: true, response: content });
  } catch (err) {
    if (err?.name === 'AbortError') {
      return res.status(504).json({ ok: false, error: 'TIMEOUT' });
    }
    console.error('[chat] internal error', err);
    return res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  } finally {
    clearTimeout(timer);
  }
});

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'NOT_FOUND' });
});

app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
  console.log(`[backend] model: ${MODEL}`);
  console.log(`[backend] upstream: ${POLZA_API_URL}`);
});
