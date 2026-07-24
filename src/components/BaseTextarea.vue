<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 4
  },
  id: {
    type: String,
    default: () => `textarea-${Math.random().toString(36).substr(2, 9)}`
  },
  error: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'underline' // 'boxed' | 'underline'
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const textareaClasses = computed(() => {
  const base = 'w-full text-regular-16 text-neutral-primary bg-transparent outline-none resize-y font-inter transition-all duration-200'
  if (props.variant === 'underline') {
    return `${base} py-2 border-b border-neutral-primary focus:border-primary-base rounded-none ${props.error ? 'border-status-error-main!' : ''}`
  }
  // boxed
  return `${base} px-4 py-2.5 bg-white border border-primary-base/20 rounded-lg focus:border-primary-base focus:ring-2 focus:ring-primary-base/15 ${props.error ? 'border-status-error-main!' : ''}`
})
</script>

<template>
  <div :class="['flex flex-col gap-1.5 w-full font-inter', disabled ? 'opacity-60 pointer-events-none' : '']">
    <label v-if="label" :for="id" class="text-medium-16 text-neutral-primary">
      {{ label }} <span v-if="required" class="text-status-error-main">*</span>
    </label>

    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :class="textareaClasses"
      @input="emit('update:modelValue', $event.target.value)"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    ></textarea>

    <span v-if="error" class="text-regular-16 text-status-error-main">{{ error }}</span>
  </div>
</template>
