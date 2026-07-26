<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'success', 'warning', 'error', 'outline'].includes(v)
  },
  active: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const badgeClasses = computed(() => {
  let style = 'inline-flex items-center gap-2 px-4 py-2 text-medium-16 rounded-full border transition-all duration-200 select-none font-inter'
  
  if (props.clickable) style += ' cursor-pointer'

  switch (props.variant) {
    case 'primary':
      style += props.active || props.clickable
        ? ' bg-primary-10 text-primary-base border-transparent hover:bg-primary-base hover:text-white'
        : ' bg-primary-10 text-primary-base border-transparent'
      break
    case 'secondary':
      style += props.active
        ? ' bg-primary-10 text-primary-base border-primary-base/20'
        : ' bg-neutral-tertiary text-neutral-primary border-primary-base/15 hover:bg-primary-10 hover:text-primary-base'
      break
    case 'success':
      style += ' bg-status-success-surface text-status-success-main border-transparent'
      break
    case 'warning':
      style += ' bg-status-warning-surface text-status-warning-active border-transparent'
      break
    case 'error':
      style += ' bg-status-error-surface text-status-error-main border-transparent'
      break
    case 'outline':
      style += ' bg-transparent text-primary-base border-primary-base'
      break
  }

  return style
})
</script>

<template>
  <span :class="badgeClasses" @click="clickable && emit('click', $event)">
    <slot name="icon" />
    <slot />
  </span>
</template>
