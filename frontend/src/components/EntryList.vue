<script setup>
// EntryList.vue
// Purely presentational: receives already-sorted, already-filtered
// entries as a prop and renders them. No API calls, no state.

defineProps({
  entries: {
    type: Array,
    required: true,
  },
});

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<template>
  <div class="card">
    <div v-if="entries.length === 0" class="empty-state">
      No entries yet.
    </div>

    <div v-else class="entry" v-for="entry in entries" :key="entry.id">
      <div class="entry-header">
        <span class="entry-contract">{{ entry.contractName }}</span>
        <span>{{ formatDate(entry.date) }} · {{ entry.weather || 'No weather logged' }}</span>
      </div>
      <p class="entry-notes">{{ entry.notes }}</p>
      <div class="entry-author">— {{ entry.authorName }}</div>
    </div>
  </div>
</template>
