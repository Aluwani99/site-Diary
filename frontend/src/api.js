// api.js
// All backend calls live here so components never call fetch() directly.
// Makes it trivial to see the full API surface in one place, and to
// swap the transport later without touching component code.

const BASE_URL = '/api/entries';

export async function fetchEntries(contractFilter = '') {
  const url = contractFilter
    ? `${BASE_URL}?contract=${encodeURIComponent(contractFilter)}`
    : BASE_URL;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load entries.');
  return res.json();
}

export async function fetchSummary() {
  const res = await fetch(`${BASE_URL}/summary`);
  if (!res.ok) throw new Error('Failed to load summary.');
  return res.json();
}

export async function createEntry(entry) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });

  const data = await res.json();

  if (!res.ok) {
    // Backend returns { errors: [...] } on validation failure.
    const error = new Error('Validation failed.');
    error.details = data.errors || [];
    throw error;
  }

  return data;
}
