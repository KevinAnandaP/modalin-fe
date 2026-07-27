<script setup>
import { ref, computed } from 'vue'
import { Eye, EyeOff } from '@lucide/vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
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
  type: {
    type: String,
    default: 'text'
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
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
    default: 'boxed' // 'boxed' | 'underline' | 'mint'
  },
  inputClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const showPassword = ref(false)

const actualType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const inputClasses = computed(() => {
  const base = 'w-full text-regular-16 text-neutral-primary outline-none transition-all duration-200 font-inter'
  
  if (props.variant === 'underline') {
    return `${base} py-2 bg-transparent border-b border-neutral-primary focus:border-primary-base rounded-none ${props.error ? 'border-status-error-main!' : ''} ${props.inputClass}`
  }
  
  if (props.variant === 'mint') {
    return `${base} px-4 py-3 bg-[#D7EAE3] border border-[#0F6E56]/40 rounded-lg text-neutral-primary placeholder-[#67887F] focus:border-primary-base focus:ring-2 focus:ring-primary-base/20 ${props.error ? 'border-status-error-main!' : ''} ${props.inputClass}`
  }

  return `${base} px-4 py-2.5 bg-white border border-primary-base/20 rounded-lg focus:border-primary-base focus:ring-2 focus:ring-primary-base/15 ${props.error ? 'border-status-error-main!' : ''} ${props.inputClass}`
})
</script>

<template>
  <div :class="['flex flex-col gap-1.5 w-full font-inter', disabled ? 'opacity-60 pointer-events-none' : '']">
    <label v-if="label" :for="id" class="text-medium-14 text-neutral-primary font-medium">
      {{ label }} <span v-if="required" class="text-status-error-main">*</span>
    </label>

    <div class="relative flex items-center w-full">
      <div v-if="$slots['icon-left']" class="absolute left-3 flex items-center pointer-events-none text-neutral-secondary">
        <slot name="icon-left" />
      </div>

      <input
        :id="id"
        :type="actualType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          inputClasses,
          $slots['icon-left'] ? 'pl-10' : '',
          ($slots['icon-right'] || type === 'password') ? 'pr-10' : ''
        ]"
        @input="emit('update:modelValue', $event.target.value)"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />

      <div v-if="type === 'password'" class="absolute right-3 flex items-center">
        <button
          type="button"
          @click="togglePassword"
          class="text-[#0F6E56] hover:text-[#0A4939] focus:outline-none transition-colors cursor-pointer"
          tabindex="-1"
        >
          <EyeOff v-if="showPassword" class="w-5 h-5" />
          <Eye v-else class="w-5 h-5" />
        </button>
      </div>
      <div v-else-if="$slots['icon-right']" class="absolute right-3 flex items-center text-neutral-secondary">
        <slot name="icon-right" />
      </div>
    </div>

    <span v-if="error" class="text-regular-14 text-status-error-main mt-0.5">{{ error }}</span>
    <span v-else-if="hint" class="text-regular-14 text-neutral-secondary mt-0.5">{{ hint }}</span>
  </div>
</template>
