<script setup>
// SummaryView.vue
// Purely presentational: receives the summary array (already grouped
// and counted by the backend) and renders it.

defineProps({
  summary: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="card">
    <div v-if="summary.length === 0" class="empty-state">
      No entries yet.
    </div>

    <div v-else class="summary-row" v-for="row in summary" :key="row.contractName">
      <span>{{ row.contractName }}</span>
      <span class="summary-count">{{ row.count }}</span>
    </div>
  </div>
</template>
