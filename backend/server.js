// server.js
// App entry point. Deliberately thin: just middleware + route mounting.
// Actual logic lives in routes/entries.js, db.js, validateEntry.js.

const express = require('express');
const cors = require('cors');
const entriesRouter = require('./routes/entries');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/entries', entriesRouter);

// Simple health check - handy for confirming the server is up.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Site Diary API running on http://localhost:${PORT}`);
});
