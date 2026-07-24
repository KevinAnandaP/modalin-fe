<script setup>
import { onMounted, onUnmounted } from 'vue'
import Lenis from 'lenis'

let lenis = null
let rafId = null

onMounted(() => {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  })

  function raf(time) {
    lenis?.raf(time)
    rafId = requestAnimationFrame(raf)
  }

  rafId = requestAnimationFrame(raf)
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (lenis) lenis.destroy()
})
</script>

<template>
  <div id="app-root" class="min-h-screen flex flex-col bg-neutral-tertiary font-inter text-neutral-primary antialiased">
    <router-view />
  </div>
</template>
