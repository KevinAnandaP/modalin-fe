<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex flex-col min-h-screen bg-[#EDF6F4] font-inter text-neutral-primary items-center justify-center p-4 sm:p-6">
    <main class="w-full flex items-center justify-center">
      <slot />
    </main>
  </div>
</template>


