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

const beforeEnter = (el) => {
  el.style.height = '0px'
  el.style.opacity = '0'
}

const enter = (el) => {
  el.style.height = el.scrollHeight + 'px'
  el.style.opacity = '1'
}

const afterEnter = (el) => {
  el.style.height = 'auto'
}

const beforeLeave = (el) => {
  el.style.height = el.scrollHeight + 'px'
  el.style.opacity = '1'
}

const leave = (el) => {
  el.offsetHeight
  el.style.height = '0px'
  el.style.opacity = '0'
}
</script>

<template>
  <div class="border-b border-neutral-secondary font-inter">
    <button
      type="button"
      class="w-full flex items-center justify-between py-5 bg-transparent border-none text-left cursor-pointer outline-none group select-none"
      @click="toggle"
      :aria-expanded="isOpen"
    >
      <span class="text-medium-18 text-neutral-primary group-hover:text-primary-base transition-colors duration-200">
        {{ title }}
      </span>
      <span
        :class="[
          'text-regular-20 text-neutral-primary w-6 h-6 flex items-center justify-center font-normal transition-transform duration-300',
          isOpen ? 'rotate-180 text-primary-base' : 'rotate-0'
        ]"
      >
        {{ isOpen ? '−' : '+' }}
      </span>
    </button>

    <Transition
      name="accordion"
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
    >
      <div v-show="isOpen" class="overflow-hidden transition-all duration-300 ease-in-out">
        <div class="pb-5 text-regular-16 text-neutral-secondary leading-relaxed">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>
