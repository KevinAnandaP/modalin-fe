<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'dark', 'ghost'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  rounded: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  }
})

const emit = defineEmits(['click'])

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary-base text-white border-primary-base hover:bg-primary-60 hover:border-primary-60'
    case 'secondary':
      return 'bg-primary-10 text-primary-base border-primary-10 hover:bg-primary-20'
    case 'outline':
      return 'bg-transparent text-primary-base border-primary-base hover:bg-primary-10'
    case 'dark':
      return 'bg-primary-90 text-white border-primary-90 hover:bg-primary-100'
    case 'ghost':
      return 'bg-transparent text-neutral-primary border-transparent hover:bg-black/5'
    default:
      return 'bg-primary-base text-white border-primary-base'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-4 py-1.5 text-semibold-16'
    case 'md':
      return 'px-6 py-2.5 text-semibold-18'
    case 'lg':
      return 'px-8 py-3.5 text-semibold-20'
    default:
      return 'px-6 py-2.5 text-semibold-18'
  }
})

const buttonClasses = computed(() => [
  'inline-flex items-center justify-center gap-2 font-inter border transition-all duration-200 cursor-pointer no-underline leading-tight focus:outline-none focus:ring-2 focus:ring-primary-base focus:ring-offset-2',
  variantClasses.value,
  sizeClasses.value,
  props.rounded ? 'rounded-full' : 'rounded-lg',
  props.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
])

const handleClick = (e) => {
  if (!props.disabled) {
    emit('click', e)
  }
}
</script>

<template>
  <button :type="type" :class="buttonClasses" :disabled="disabled" @click="handleClick">
    <slot name="icon-left" />
    <span>
      <slot />
    </span>
    <slot name="icon-right" />
  </button>
</template>
