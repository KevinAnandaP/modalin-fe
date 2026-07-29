<script setup>
import { computed } from 'vue'

const props = defineProps({
  riskLevel: {
    type: String,
    default: 'low'
  },
  score: {
    type: [Number, String],
    default: null
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  }
})

const normalizedLevel = computed(() => {
  const lvl = (props.riskLevel || '').toLowerCase()
  if (lvl.includes('high') || lvl.includes('tier 4')) return 'high'
  if (lvl.includes('medium') || lvl.includes('tier 3')) return 'medium'
  return 'low'
})

const badgeConfig = computed(() => {
  switch (normalizedLevel.value) {
    case 'high':
      return {
        bgClass: 'bg-status-error-surface text-status-error-main border-status-error-main/20',
        dotClass: 'bg-status-error-main',
        label: props.riskLevel && props.riskLevel.length > 10 ? props.riskLevel : 'High Risk'
      }
    case 'medium':
      return {
        bgClass: 'bg-status-warning-surface text-status-warning-active border-status-warning-active/20',
        dotClass: 'bg-status-warning-active',
        label: props.riskLevel && props.riskLevel.length > 10 ? props.riskLevel : 'Medium Risk'
      }
    default:
      return {
        bgClass: 'bg-primary-10 text-primary-base border-primary-base/20',
        dotClass: 'bg-primary-base',
        label: props.riskLevel && props.riskLevel.length > 10 ? props.riskLevel : 'Low Risk'
      }
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-2.5 py-0.5 text-semibold-12 gap-1.5'
    case 'lg':
      return 'px-4 py-2 text-semibold-16 gap-2'
    default:
      return 'px-3 py-1 text-semibold-12 gap-2'
  }
})
</script>

<template>
  <span 
    :class="[
      'inline-flex items-center rounded-full font-inter font-bold border transition-all select-none',
      badgeConfig.bgClass,
      sizeClasses
    ]"
  >
    <span :class="['w-1.5 h-1.5 rounded-full shrink-0', badgeConfig.dotClass]" />
    <span>{{ badgeConfig.label }}</span>
    <span v-if="score !== null && score !== undefined" class="font-mono text-regular-12 opacity-85">
      ({{ score }}/100)
    </span>
  </span>
</template>
