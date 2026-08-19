// routes/entries.js
// All /api/entries* endpoints live here. Route handlers stay thin:
// they parse the request, delegate to db.js / validateEntry.js, and
// shape the response. No business logic lives directly in server.js.

const express = require('express');
const router = express.Router();
const db = require('../db');
const { validateEntry } = require('../validateEntry');
const { randomUUID } = require('crypto');

// GET /api/entries
// GET /api/entries?contract=Hilltop%20Mall
// Returns entries newest-first, optionally filtered by contract name.
router.get('/', (req, res) => {
  const { contract } = req.query;
  let entries = db.getAllEntries();

  if (contract) {
    const needle = contract.toLowerCase();
    entries = entries.filter((e) =>
      e.contractName.toLowerCase().includes(needle)
    );
  }

  entries = sortNewestFirst(entries);

  res.json(entries);
});

// POST /api/entries
// Body: { date, contractName, weather, notes, authorName }
router.post('/', (req, res) => {
  const { valid, errors } = validateEntry(req.body);

  if (!valid) {
    return res.status(400).json({ errors });
  }

  const { date, contractName, weather, notes, authorName } = req.body;

  const entry = {
    id: randomUUID(),
    date,
    contractName: contractName.trim(),
    weather: (weather || '').trim(),
    notes: notes.trim(),
    authorName: authorName.trim(),
    createdAt: new Date().toISOString(),
  };

  db.addEntry(entry);

  res.status(201).json(entry);
});

// GET /api/entries/summary
// Returns entries grouped by contract with a count per contract,
// e.g. [{ contractName: "Hilltop Mall", count: 4 }, ...]
router.get('/summary', (req, res) => {
  const entries = db.getAllEntries();
  const counts = {};

  for (const entry of entries) {
    counts[entry.contractName] = (counts[entry.contractName] || 0) + 1;
  }

  const summary = Object.entries(counts)
    .map(([contractName, count]) => ({ contractName, count }))
    .sort((a, b) => b.count - a.count);

  res.json(summary);
});

function sortNewestFirst(entries) {
  return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
}

module.exports = router;
