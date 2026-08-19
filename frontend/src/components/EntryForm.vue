<script setup>
// EntryForm.vue
// Handles only the "add an entry" concern. On submit it asks the parent
// (via emit) to actually create the entry - this component doesn't
// talk to the API directly, so it stays easy to test/reuse.

import { reactive, ref, computed } from 'vue';

const emit = defineEmits(['submit']);

const MAX_NOTES_LENGTH = 500;

const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd, for the input's max attribute

const form = reactive({
  date: today,
  contractName: '',
  weather: '',
  notes: '',
  authorName: '',
});

const clientErrors = ref([]);
const submitting = ref(false);

const notesOverLimit = computed(() => form.notes.length > MAX_NOTES_LENGTH);

function validateClientSide() {
  const errors = [];

  if (!form.date) errors.push('Date is required.');
  else if (form.date > today) errors.push('Date cannot be in the future.');

  if (!form.contractName.trim()) errors.push('Contract name is required.');
  if (!form.authorName.trim()) errors.push('Author name is required.');

  if (!form.notes.trim()) errors.push('Notes are required.');
  else if (notesOverLimit.value)
    errors.push(`Notes must be ${MAX_NOTES_LENGTH} characters or fewer.`);

  return errors;
}

async function handleSubmit() {
  clientErrors.value = validateClientSide();
  if (clientErrors.value.length > 0) return;

  submitting.value = true;
  try {
    await emit('submit', { ...form });
    resetForm();
  } catch (err) {
    // Parent re-throws API validation errors so we can show them here too.
    clientErrors.value = err.details && err.details.length ? err.details : [err.message];
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  form.date = today;
  form.contractName = '';
  form.weather = '';
  form.notes = '';
  form.authorName = '';
  clientErrors.value = [];
}
</script>

<template>
  <form class="card" @submit.prevent="handleSubmit">
    <div v-if="clientErrors.length" class="error-list">
      <strong>Please fix the following:</strong>
      <ul>
        <li v-for="(err, i) in clientErrors" :key="i">{{ err }}</li>
      </ul>
    </div>

    <div class="form-row">
      <label for="date">Date</label>
      <input id="date" type="date" v-model="form.date" :max="today" />
    </div>

    <div class="form-row">
      <label for="contractName">Contract name</label>
      <input
        id="contractName"
        type="text"
        v-model="form.contractName"
        placeholder="e.g. Hilltop Mall"
      />
    </div>

    <div class="form-row">
      <label for="weather">Weather</label>
      <input
        id="weather"
        type="text"
        v-model="form.weather"
        placeholder="e.g. Sunny, 24°C"
      />
    </div>

    <div class="form-row">
      <label for="notes">Notes</label>
      <textarea
        id="notes"
        v-model="form.notes"
        placeholder="What happened on site today?"
      ></textarea>
      <span class="char-count" :class="{ over: notesOverLimit }">
        {{ form.notes.length }} / {{ MAX_NOTES_LENGTH }}
      </span>
    </div>

    <div class="form-row">
      <label for="authorName">Author name</label>
      <input id="authorName" type="text" v-model="form.authorName" placeholder="Your name" />
    </div>

    <button class="btn-primary" type="submit" :disabled="submitting">
      {{ submitting ? 'Adding…' : 'Add entry' }}
    </button>
  </form>
</template>
