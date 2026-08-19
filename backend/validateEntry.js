// validateEntry.js
// Pure function: takes the raw request body, returns { valid, errors }.
// Kept separate from routes.js so validation rules can be tested on
// their own and reused (e.g. if a bulk-import endpoint is added later).

const MAX_NOTES_LENGTH = 500;

function validateEntry(body) {
  const errors = [];

  const { date, contractName, weather, notes, authorName } = body || {};

  // --- date ---
  if (!date) {
    errors.push('Date is required.');
  } else {
    const enteredDate = new Date(date);
    const today = new Date();
    // Compare by day only, ignore time-of-day, so "today" always passes.
    enteredDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (isNaN(enteredDate.getTime())) {
      errors.push('Date is not a valid date.');
    } else if (enteredDate > today) {
      errors.push('Date cannot be in the future.');
    }
  }

  // --- contract name ---
  if (!contractName || !contractName.trim()) {
    errors.push('Contract name is required.');
  }

  // --- notes ---
  if (!notes || !notes.trim()) {
    errors.push('Notes are required.');
  } else if (notes.length > MAX_NOTES_LENGTH) {
    errors.push(`Notes must be ${MAX_NOTES_LENGTH} characters or fewer.`);
  }

  // --- author name ---
  if (!authorName || !authorName.trim()) {
    errors.push('Author name is required.');
  }

  // weather is optional - no validation needed

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = { validateEntry, MAX_NOTES_LENGTH };
