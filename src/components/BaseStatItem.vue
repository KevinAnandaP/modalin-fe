<script setup>
defineProps({
  value: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="flex flex-col items-center text-center p-4 font-inter">
    <div class="text-semibold-40 text-primary-base leading-tight">{{ value }}</div>
    <div class="text-regular-16 text-neutral-secondary mt-1">{{ label }}</div>
  </div>
</template>
