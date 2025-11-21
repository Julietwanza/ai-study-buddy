const express = require('express');
const router = express.Router();
const axios = require('axios');
const Deck = require('../models/Deck');
const Flashcard = require('../models/Flashcard');

const HF_TOKEN = process.env.HF_API_TOKEN;
const HF_MODEL = process.env.HF_MODEL_ID || 'google/flan-t5-large';
const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
const HEADERS = { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' };

function extractJsonArray(text) {
  const m = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch(e) { return null; }
}

// CRUD flashcards
router.get('/flashcards', async (req, res) => {
  const cards = await Flashcard.find().sort({ createdAt: -1 }).limit(500).populate('deck', 'name').exec();
  res.json(cards.map(c => ({ id: c._id, question: c.question, answer: c.answer, deck: c.deck ? c.deck.name : null })));
});

router.post('/flashcards', async (req, res) => {
  try {
    const { cards = [], deck = 'My First Deck' } = req.body;
    let deckDoc = await Deck.findOne({ name: deck }).exec();
    if (!deckDoc) deckDoc = await Deck.create({ name: deck });
    const toInsert = cards.map(c => ({ deck: deckDoc._id, question: (c.question||'').trim(), answer: (c.answer||'').trim() })).filter(c => c.question && c.answer);
    if (toInsert.length) await Flashcard.insertMany(toInsert);
    res.json({ ok: true, inserted: toInsert.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/flashcards/:id', async (req, res) => {
  try {
    const { question, answer } = req.body;
    const updated = await Flashcard.findByIdAndUpdate(req.params.id, { question, answer }, { new: true }).exec();
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/flashcards/:id', async (req, res) => {
  try { await Flashcard.findByIdAndDelete(req.params.id).exec(); res.json({ ok: true }); } catch(e){ res.status(500).json({ error: e.message }); }
});

// Advanced generator endpoint
router.post('/generate', async (req, res) => {
  try {
    const notes = (req.body.notes || '').trim();
    if (!notes) return res.status(400).json({ error: 'Notes required' });

    const prompt = `You are an expert study assistant. Read the student's notes below and create exactly 5 flashcards. Return strictly as a compact JSON array with 5 objects like {"question":"...","answer":"..."}. Keep questions concise and answers 1–3 sentences. Use the student's terminology.\n\nNOTES:\n${notes}`;

    const apiResp = await axios.post(HF_URL, {
      inputs: prompt,
      parameters: { max_new_tokens: 400, temperature: 0.3, return_full_text: false }
    }, { headers: HEADERS, timeout: 60000 });

    let raw = '';
    if (Array.isArray(apiResp.data) && apiResp.data.length && apiResp.data[0].generated_text) raw = apiResp.data[0].generated_text;
    else if (typeof apiResp.data === 'string') raw = apiResp.data;
    else raw = JSON.stringify(apiResp.data);

    const arr = extractJsonArray(raw);
    if (!arr) return res.status(502).json({ error: 'Model returned unexpected format', raw });

    const cards = arr.slice(0,5).map(it => ({ question: (it.question||'').trim(), answer: (it.answer||'').trim() })).filter(c=>c.question && c.answer);
    if (!cards.length) return res.status(502).json({ error: 'Model did not return usable cards', raw });

    res.json({ cards });
  } catch (e) {
    if (e.response && e.response.data) return res.status(502).json({ error: 'HF API error', body: e.response.data });
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
