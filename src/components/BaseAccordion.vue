<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  defaultOpen: {
    type: Boolean,
    default: false
  }
})

const isOpen = ref(props.defaultOpen)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="border-b border-primary-base/15 transition-all duration-200 font-inter">
    <button
      class="w-full flex items-center justify-between py-5 bg-transparent border-none text-left cursor-pointer outline-none group"
      @click="toggle"
      :aria-expanded="isOpen"
    >
      <span :class="['text-semibold-20 transition-colors duration-200', isOpen ? 'text-primary-base' : 'text-neutral-primary group-hover:text-primary-base']">
        {{ title }}
      </span>
      <span class="text-semibold-24 text-neutral-primary w-8 h-8 flex items-center justify-center">
        {{ isOpen ? '−' : '+' }}
      </span>
    </button>
    <div v-show="isOpen" class="pb-5 text-regular-18 text-neutral-secondary leading-relaxed">
      <slot />
    </div>
  </div>
</template>
