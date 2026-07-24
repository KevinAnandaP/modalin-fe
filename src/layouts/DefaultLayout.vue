<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex flex-col min-h-screen bg-neutral-tertiary font-inter text-neutral-primary">
    <!-- Header / Navbar -->
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-primary-base/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <RouterLink to="/" class="no-underline">
          <span class="text-semibold-24 text-primary-base">Modalin</span>
        </RouterLink>

        <nav class="hidden md:flex items-center gap-8">
          <RouterLink to="/" class="text-medium-16 text-neutral-primary hover:text-primary-base transition-colors no-underline">
            Beranda
          </RouterLink>
          <a href="#tentang" class="text-medium-16 text-neutral-primary hover:text-primary-base transition-colors no-underline">
            Tentang
          </a>
          <a href="#fitur" class="text-medium-16 text-neutral-primary hover:text-primary-base transition-colors no-underline">
            Fitur Utama
          </a>
          <a href="#faq" class="text-medium-16 text-neutral-primary hover:text-primary-base transition-colors no-underline">
            FAQ
          </a>
        </nav>

        <div class="flex items-center gap-3">
          <RouterLink
            to="/login"
            class="px-5 py-2.5 text-semibold-16 text-primary-base bg-transparent border border-primary-base rounded-full hover:bg-primary-10 transition-colors no-underline"
          >
            Masuk
          </RouterLink>
          <RouterLink
            to="/register"
            class="px-5 py-2.5 text-semibold-16 text-white bg-primary-base rounded-full hover:bg-primary-60 transition-colors no-underline"
          >
            Daftar
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-primary-90 text-white pt-12 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex flex-col md:flex-row justify-between gap-8">
        <div class="max-w-md">
          <h3 class="text-semibold-24 text-primary-10 mb-3">Modalin</h3>
          <p class="text-regular-16 text-primary-20 leading-relaxed">
            Platform pendanaan UMKM terpercaya untuk pertumbuhan bisnis Anda.
          </p>
        </div>
        <div class="flex gap-12 sm:gap-16">
          <div class="flex flex-col gap-2">
            <h4 class="text-semibold-16 text-primary-10 mb-2">Navigasi</h4>
            <RouterLink to="/" class="text-regular-16 text-primary-20 hover:text-white transition-colors no-underline">Beranda</RouterLink>
            <RouterLink to="/login" class="text-regular-16 text-primary-20 hover:text-white transition-colors no-underline">Masuk</RouterLink>
            <RouterLink to="/register" class="text-regular-16 text-primary-20 hover:text-white transition-colors no-underline">Daftar</RouterLink>
          </div>
          <div class="flex flex-col gap-2">
            <h4 class="text-semibold-16 text-primary-10 mb-2">Legal & Privasi</h4>
            <a href="#" class="text-regular-16 text-primary-20 hover:text-white transition-colors no-underline">Syarat & Ketentuan</a>
            <a href="#" class="text-regular-16 text-primary-20 hover:text-white transition-colors no-underline">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
      <div class="border-t border-white/10 py-5 text-center text-regular-16 text-primary-30">
        <div class="max-w-7xl mx-auto px-4">
          <p>&copy; 2026 Modalin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
