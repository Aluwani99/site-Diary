<script setup>
// App.vue
// Owns the page-level state (entries, summary, filter, active tab) and
// wires the child components together. Child components stay "dumb" -
// they receive data via props and report events, they never fetch data
// themselves. Keeps the data flow easy to trace for the interview.

import { ref, onMounted, watch } from 'vue';
import { fetchEntries, fetchSummary, createEntry } from './api';
import EntryForm from './components/EntryForm.vue';
import EntryFilter from './components/EntryFilter.vue';
import EntryList from './components/EntryList.vue';
import SummaryView from './components/SummaryView.vue';

const activeTab = ref('list'); // 'list' | 'summary'
const entries = ref([]);
const summary = ref([]);
const filterText = ref('');
const loadError = ref('');

async function loadEntries() {
  try {
    entries.value = await fetchEntries(filterText.value);
    loadError.value = '';
  } catch (err) {
    loadError.value = err.message;
  }
}

async function loadSummary() {
  try {
    summary.value = await fetchSummary();
  } catch (err) {
    loadError.value = err.message;
  }
}

async function handleCreateEntry(newEntry) {
  // Let EntryForm catch the error and show it inline - re-throw here.
  try {
    await createEntry(newEntry);
    await loadEntries();
    await loadSummary();
  } catch (err) {
    throw err;
  }
}

// Re-fetch whenever the filter text changes (simple debounce-free version -
// fine for the small dataset this app is designed for).
watch(filterText, () => {
  loadEntries();
});

onMounted(() => {
  loadEntries();
  loadSummary();
});
</script>

<template>
  <h1>Site Diary</h1>
  <p class="subtitle">Daily site entries, filterable by contract.</p>

  <div class="tabs">
    <button :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">
      Entries
    </button>
    <button :class="{ active: activeTab === 'summary' }" @click="activeTab = 'summary'">
      Summary
    </button>
  </div>

  <EntryForm @submit="handleCreateEntry" />

  <div v-if="loadError" class="error-list">{{ loadError }}</div>

  <template v-if="activeTab === 'list'">
    <EntryFilter v-model="filterText" />
    <EntryList :entries="entries" />
  </template>

  <template v-else>
    <SummaryView :summary="summary" />
  </template>
</template>
