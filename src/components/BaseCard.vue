<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default', // 'default' | 'primary-light' | 'bordered' | 'flat'
    validator: (v) => ['default', 'primary-light', 'bordered', 'flat'].includes(v)
  },
  padding: {
    type: String,
    default: 'md' // 'sm' | 'md' | 'lg' | 'none'
  },
  rounded: {
    type: String,
    default: 'md' // 'sm' | 'md' | 'lg' | 'xl'
  }
})

const cardClasses = computed(() => {
  let style = 'transition-all duration-200 font-inter'

  // Variant
  switch (props.variant) {
    case 'default':
      style += ' bg-white shadow-sm border border-primary-base/10 text-neutral-primary'
      break
    case 'primary-light':
      style += ' bg-primary-10 text-neutral-primary border border-primary-base/15'
      break
    case 'bordered':
      style += ' bg-transparent border border-primary-base/20 text-neutral-primary'
      break
    case 'flat':
      style += ' bg-neutral-tertiary text-neutral-primary'
      break
  }

  // Padding
  switch (props.padding) {
    case 'none': style += ' p-0'; break
    case 'sm': style += ' p-4'; break
    case 'md': style += ' p-6'; break
    case 'lg': style += ' p-8'; break
  }

  // Rounded
  switch (props.rounded) {
    case 'sm': style += ' rounded-lg'; break
    case 'md': style += ' rounded-xl'; break
    case 'lg': style += ' rounded-2xl'; break
    case 'xl': style += ' rounded-3xl'; break
  }

  return style
})
</script>

<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="mb-4">
      <slot name="header" />
    </div>
    <div>
      <slot />
    </div>
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-black/5">
      <slot name="footer" />
    </div>
  </div>
</template>
