<script setup>
// EntryFilter.vue
// A single controlled input. Emits 'update:modelValue' so it can be
// used with v-model from the parent, keeping filter state in one place.

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="filter-row">
    <input
      type="text"
      placeholder="Filter by contract name…"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
