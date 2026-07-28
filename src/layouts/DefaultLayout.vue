<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import logoUrl from '@/assets/Logo.svg'
import logoWhiteUrl from '@/assets/Logo-White.svg'
import { getAuthToken, removeAuthToken } from '@/services/api'

const route = useRoute()
const router = useRouter()

const isLandingPage = computed(() => route.path === '/')
const isAuthenticated = computed(() => !!getAuthToken())
const activeSection = ref('')

const landingSections = [
  { id: 'cara-kerja', label: 'Cara Kerja' },
  { id: 'terkait', label: 'Terkait Modalin' },
  { id: 'tentang', label: 'Tentang Kami' },
  { id: 'testimoni', label: 'Testimoni' },
  { id: 'faq', label: 'FAQ' }
]

const handleLogout = () => {
  removeAuthToken()
  router.push('/login')
}

const handleDashboardClick = (e) => {
  if (!isAuthenticated.value) {
    if (e) e.preventDefault()
    router.push('/login')
  }
}

// Lenis smooth scroll handler
const scrollToSection = (sectionId, event) => {
  if (event) event.preventDefault()
  const target = document.getElementById(sectionId)
  if (target) {
    if (window.lenis) {
      window.lenis.scrollTo(target, { offset: -90 })
    } else {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

// Scroll spy for section focus
let observer = null

const setupScrollSpy = () => {
  if (!isLandingPage.value || typeof window === 'undefined') return

  if (observer) observer.disconnect()

  const sectionIds = landingSections.map(s => s.id)
  const elements = sectionIds.map(id => document.getElementById(id)).filter(Boolean)

  if (elements.length === 0) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    },
    {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0.1
    }
  )

  elements.forEach(el => observer.observe(el))
}

onMounted(() => {
  setupScrollSpy()
})

watch(isLandingPage, (val) => {
  if (val) {
    setTimeout(setupScrollSpy, 150)
  } else if (observer) {
    observer.disconnect()
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-neutral-tertiary font-inter text-neutral-primary">
    <header class="pt-6 pb-2 bg-transparent sticky top-0 z-50">
      <div class="w-full px-4 sm:px-8 lg:px-16">
        <div class="bg-primary-10 rounded-full px-6 sm:px-10 py-3.5 flex items-center justify-between shadow-xs border border-primary-base/10">
          <!-- Logo & Brand Name -->
          <RouterLink to="/" class="flex items-center gap-3 no-underline">
            <img :src="logoUrl" alt="Modalin Logo" class="h-9 w-9" />
            <span class="text-semibold-32 font-newsreader text-primary-base font-bold tracking-tight">Modalin</span>
          </RouterLink>

          <!-- Navigation Links -->
          <nav class="hidden lg:flex items-center gap-6 md:gap-8">
            <!-- Landing Page Navigation with Scroll Spy & Lenis Smooth Scroll -->
            <template v-if="isLandingPage">
              <a
                v-for="sec in landingSections"
                :key="sec.id"
                :href="`#${sec.id}`"
                @click="scrollToSection(sec.id, $event)"
                class="text-regular-16 text-neutral-primary hover:text-primary-base transition-colors no-underline cursor-pointer"
                :class="{ 'font-semibold text-primary-base': activeSection === sec.id }"
              >
                {{ sec.label }}
              </a>

              <RouterLink
                to="/campaigns"
                class="px-4 py-1.5 rounded-full bg-primary-base text-white text-medium-14 font-medium hover:bg-primary-60 shadow-xs transition-all no-underline inline-flex items-center gap-1.5"
              >
                <span>Katalog Campaign</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </RouterLink>
            </template>

            <!-- Non-Landing Page Navigation -->
            <template v-else>
              <RouterLink
                to="/"
                class="text-regular-16 text-neutral-primary hover:text-primary-base transition-colors no-underline"
                :class="{ 'font-semibold text-primary-base': route.path === '/' }"
              >
                Beranda
              </RouterLink>

              <RouterLink
                to="/campaigns"
                class="text-regular-16 text-neutral-primary hover:text-primary-base transition-colors no-underline"
                :class="{ 'font-semibold text-primary-base': route.path.startsWith('/campaigns') }"
              >
                Katalog Campaign
              </RouterLink>

              <RouterLink
                to="/campaign/wizard"
                class="text-regular-16 text-neutral-primary hover:text-primary-base transition-colors no-underline"
                :class="{ 'font-semibold text-primary-base': route.path === '/campaign/wizard' }"
              >
                Ajukan Pendanaan
              </RouterLink>

              <RouterLink
                to="/business/detail"
                @click="handleDashboardClick"
                class="text-regular-16 text-neutral-primary hover:text-primary-base transition-colors no-underline"
                :class="{ 'font-semibold text-primary-base': route.path.startsWith('/business') || route.path.startsWith('/role') || route.path.startsWith('/financial') }"
              >
                Dashboard Saya
              </RouterLink>
            </template>
          </nav>

          <!-- Auth Actions -->
          <div class="flex items-center gap-4">
            <template v-if="isAuthenticated">
              <button
                @click="handleLogout"
                class="text-medium-16 text-status-error-main underline underline-offset-4 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-0"
              >
                Keluar
              </button>
            </template>
            <template v-else>
              <RouterLink
                to="/login"
                class="text-medium-16 text-primary-base underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                Masuk
              </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 w-full">
      <slot />
    </main>

    <footer class="pt-12 pb-2 bg-neutral-tertiary w-full mt-auto">
      <div class="mx-4 sm:mx-8 lg:mx-16 bg-primary-base text-white rounded-none p-8 sm:p-12 lg:p-14 shadow-sm">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div class="lg:col-span-5 space-y-6">
            <div class="flex items-center gap-3">
              <img :src="logoWhiteUrl" alt="Modalin Logo White" class="h-9 w-auto" />
              <span class="text-semibold-32 font-newsreader text-white font-bold tracking-tight">Modalin</span>
            </div>

            <p class="text-regular-16 text-white/90 max-w-sm leading-relaxed">
              Platform crowdfunding komunitas untuk membantu UMKM lokal berkembang secara transparan dan berkelanjutan.
            </p>

            <div class="flex items-center gap-4 text-white text-xl">
              <a href="#" aria-label="X" class="hover:opacity-80 transition-opacity text-white">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" class="hover:opacity-80 transition-opacity text-white">
                <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="TikTok" class="hover:opacity-80 transition-opacity text-white">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.33-6.33V9.05a8.3 8.3 0 0 0 4.92 1.58V7.19a4.8 4.8 0 0 1-1-.5z"/></svg>
              </a>
              <a href="#" aria-label="WhatsApp" class="hover:opacity-80 transition-opacity text-white">
                <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </a>
            </div>
          </div>

          <div class="lg:col-span-7 flex flex-wrap justify-between items-start gap-y-6 text-sm text-center">
            <div>
              <h4 class="text-semibold-16 text-white font-semibold mb-3">Cara Kerja</h4>
              <ul class="space-y-1.5 text-white/80 text-xs sm:text-sm">
                <li><a href="#cara-kerja" @click="scrollToSection('cara-kerja', $event)" class="hover:text-white no-underline">Cara Kerja</a></li>
                <li><a href="#cara-kerja" @click="scrollToSection('cara-kerja', $event)" class="hover:text-white no-underline">Cara Kerja</a></li>
                <li><a href="#terkait" @click="scrollToSection('terkait', $event)" class="hover:text-white no-underline">Terkait Modalin</a></li>
                <li><a href="#tentang" @click="scrollToSection('tentang', $event)" class="hover:text-white no-underline">Tentang Kami</a></li>
                <li><a href="#faq" @click="scrollToSection('faq', $event)" class="hover:text-white no-underline">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 class="text-semibold-16 text-white font-semibold mb-3">Terkait Modalin</h4>
              <ul class="space-y-1.5 text-white/80 text-xs sm:text-sm">
                <li><a href="#terkait" @click="scrollToSection('terkait', $event)" class="hover:text-white no-underline">Terkait Modalin</a></li>
                <li><a href="#terkait" @click="scrollToSection('terkait', $event)" class="hover:text-white no-underline">Terkait Modalin</a></li>
                <li><a href="#terkait" @click="scrollToSection('terkait', $event)" class="hover:text-white no-underline">Terkait Modalin</a></li>
                <li><a href="#terkait" @click="scrollToSection('terkait', $event)" class="hover:text-white no-underline">Terkait Modalin</a></li>
                <li><a href="#terkait" @click="scrollToSection('terkait', $event)" class="hover:text-white no-underline">Terkait Modalin</a></li>
              </ul>
            </div>

            <div>
              <h4 class="text-semibold-16 text-white font-semibold mb-3">Tentang Kami</h4>
              <ul class="space-y-1.5 text-white/80 text-xs sm:text-sm">
                <li><a href="#tentang" @click="scrollToSection('tentang', $event)" class="hover:text-white no-underline">Tentang Kami</a></li>
                <li><a href="#tentang" @click="scrollToSection('tentang', $event)" class="hover:text-white no-underline">Tentang Kami</a></li>
                <li><a href="#tentang" @click="scrollToSection('tentang', $event)" class="hover:text-white no-underline">Tentang Kami</a></li>
                <li><a href="#tentang" @click="scrollToSection('tentang', $event)" class="hover:text-white no-underline">Tentang Kami</a></li>
                <li><a href="#tentang" @click="scrollToSection('tentang', $event)" class="hover:text-white no-underline">Tentang Kami</a></li>
              </ul>
            </div>

            <div>
              <h4 class="text-semibold-16 text-white font-semibold mb-3">Testimoni</h4>
              <ul class="space-y-1.5 text-white/80 text-xs sm:text-sm">
                <li><a href="#testimoni" @click="scrollToSection('testimoni', $event)" class="hover:text-white no-underline">Testimoni</a></li>
                <li><a href="#testimoni" @click="scrollToSection('testimoni', $event)" class="hover:text-white no-underline">Testimoni</a></li>
                <li><a href="#testimoni" @click="scrollToSection('testimoni', $event)" class="hover:text-white no-underline">Testimoni</a></li>
                <li><a href="#testimoni" @click="scrollToSection('testimoni', $event)" class="hover:text-white no-underline">Testimoni</a></li>
                <li><a href="#testimoni" @click="scrollToSection('testimoni', $event)" class="hover:text-white no-underline">Testimoni</a></li>
              </ul>
            </div>

            <div>
              <h4 class="text-semibold-16 text-white font-semibold mb-3">FAQ</h4>
              <ul class="space-y-1.5 text-white/80 text-xs sm:text-sm">
                <li><a href="#faq" @click="scrollToSection('faq', $event)" class="hover:text-white no-underline">FAQ</a></li>
                <li><a href="#faq" @click="scrollToSection('faq', $event)" class="hover:text-white no-underline">FAQ</a></li>
                <li><a href="#faq" @click="scrollToSection('faq', $event)" class="hover:text-white no-underline">FAQ</a></li>
                <li><a href="#faq" @click="scrollToSection('faq', $event)" class="hover:text-white no-underline">FAQ</a></li>
                <li><a href="#faq" @click="scrollToSection('faq', $event)" class="hover:text-white no-underline">FAQ</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="border-t border-white/20 mt-10 mb-6"></div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-white/80">
          <p>&copy; 2026 Modalin. All rights reserved.</p>
          <div class="flex gap-6">
            <a href="#" class="text-white/80 hover:text-white underline">Privacy Policy</a>
            <a href="#" class="text-white/80 hover:text-white underline">Terms of Service</a>
          </div>
        </div>

      </div>

      <div class="mx-4 sm:mx-8 lg:mx-16 relative overflow-hidden h-25 sm:h-37.5 md:h-45 flex justify-center items-start pt-1">
        <svg viewBox="0 0 1000 240" class="w-full h-auto select-none pointer-events-none">
          <defs>
            <linearGradient id="modalinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0F6E56" stop-opacity="0.4" />
              <stop offset="55%" stop-color="#0F6E56" stop-opacity="0.1" />
              <stop offset="100%" stop-color="#0F6E56" stop-opacity="0.0" />
            </linearGradient>
          </defs>
          <text
            x="50%"
            y="190"
            text-anchor="middle"
            font-family="Newsreader, Georgia, serif"
            font-weight="bold"
            font-size="230"
            fill="url(#modalinGradient)"
            letter-spacing="-3"
          >
            Modalin
          </text>
        </svg>
      </div>
    </footer>
  </div>
</template>
