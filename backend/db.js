// db.js
// Very small "database": entries are persisted as JSON on disk.
// Kept separate from routes.js so the storage mechanism can be swapped
// later (e.g. for SQLite) without touching any HTTP/validation code.

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'entries.json');

// Make sure the data file exists before anything tries to read it.
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
}

function readAll() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    // Corrupt or empty file shouldn't crash the server - start fresh.
    return [];
  }
}

function writeAll(entries) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

function getAllEntries() {
  return readAll();
}

function addEntry(entry) {
  const entries = readAll();
  entries.push(entry);
  writeAll(entries);
  return entry;
}

module.exports = {
  getAllEntries,
  addEntry,
};
