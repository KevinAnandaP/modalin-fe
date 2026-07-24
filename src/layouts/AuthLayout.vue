<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex flex-col min-h-screen bg-neutral-tertiary font-inter text-neutral-primary">
    <!-- Header -->
    <header class="py-6">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <RouterLink to="/" class="no-underline">
          <span class="text-semibold-32 text-primary-base">Modalin</span>
        </RouterLink>

        <RouterLink to="/" class="text-medium-16 text-primary-base hover:opacity-80 transition-opacity no-underline">
          &larr; Kembali ke Beranda
        </RouterLink>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="flex-1 flex items-center justify-center py-8">
      <div class="w-full max-w-md px-4">
        <slot />
      </div>
    </main>

    <!-- Minimalist Footer -->
    <footer class="py-6 text-center text-regular-16 text-neutral-secondary">
      <p>&copy; 2026 Modalin. Seluruh Hak Cipta Dilindungi.</p>
    </footer>
  </div>
</template>
