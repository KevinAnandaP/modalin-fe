<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Lenis from 'lenis'
import BaseInput from '@/components/BaseInput.vue'
import { authService } from '@/services/auth'

const router = useRouter()
let lenis = null
let rafId = null

// Global Google Onboarding Modal State
const showGoogleModal = ref(false)
const googleTempToken = ref('')
const googleCompletionForm = ref({
  phone: '',
  city: '',
  address: '',
  termsAccepted: true
})
const isCompletingGoogle = ref(false)
const googleError = ref('')

// Global Handler for Google OAuth Hash Callback
const handleGlobalGoogleCallback = async () => {
  if (!window.location.hash || !window.location.hash.includes('id_token=')) return

  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const idToken = hashParams.get('id_token')

  if (idToken) {
    try {
      const base64Url = idToken.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const googleUser = JSON.parse(jsonPayload)

      const res = await authService.googleAuth({
        google_id: googleUser.sub,
        email: googleUser.email,
        full_name: googleUser.name || googleUser.email.split('@')[0]
      })

      // Clean URL hash fragment
      window.history.replaceState({}, document.title, window.location.pathname)

      const data = res?.data
      if (data?.is_new_user) {
        googleTempToken.value = data.temp_token
        showGoogleModal.value = true
      } else {
        // Check profile roles for redirection
        const profileRes = await authService.getProfile()
        const rawData = profileRes?.data || profileRes
        const roles = rawData?.roles || rawData?.user?.roles || []

        if (Array.isArray(roles) && roles.length > 0) {
          router.push('/')
        } else {
          router.push('/request-role')
        }
      }
    } catch (err) {
      console.error('Global Google OAuth Callback Error:', err)
      googleError.value = err.message || 'Gagal otentikasi Google.'
    }
  }
}

const handleCompleteGoogleAuth = async () => {
  if (!googleCompletionForm.value.phone || !googleCompletionForm.value.city || !googleCompletionForm.value.address) {
    googleError.value = 'Lengkapi nomor HP, kota, dan alamat Anda.'
    return
  }

  isCompletingGoogle.value = true
  googleError.value = ''

  try {
    await authService.completeGoogleAuth({
      temp_token: googleTempToken.value,
      phone: googleCompletionForm.value.phone,
      city: googleCompletionForm.value.city,
      address: googleCompletionForm.value.address,
      terms_accepted: googleCompletionForm.value.termsAccepted
    })
    showGoogleModal.value = false
    router.push('/request-role')
  } catch (err) {
    googleError.value = err.message || 'Gagal melengkapi profil pendaftaran Google.'
  } finally {
    isCompletingGoogle.value = false
  }
}

onMounted(() => {
  handleGlobalGoogleCallback()

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  })
  window.lenis = lenis

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

    <!-- Global Google Completion Modal -->
    <div v-if="showGoogleModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl border border-primary-base/40 p-6 max-w-md w-full text-left space-y-4 shadow-lg font-inter">
        <h3 class="text-xl font-bold text-neutral-primary font-newsreader">Lengkapi Profil Google</h3>
        <p class="text-xs text-[#52605D]">
          Akun Google Anda terdeteksi baru. Mohon isi nomor HP, kota, dan alamat untuk menyelesaikan pendaftaran.
        </p>

        <div v-if="googleError" class="p-2.5 bg-red-50 text-red-700 border border-red-200 text-xs rounded-lg">
          {{ googleError }}
        </div>

        <form @submit.prevent="handleCompleteGoogleAuth" class="space-y-3">
          <BaseInput
            v-model="googleCompletionForm.phone"
            type="tel"
            label="Nomor HP / WhatsApp"
            placeholder="08123456789"
            variant="mint"
            required
          />

          <BaseInput
            v-model="googleCompletionForm.city"
            type="text"
            label="Kota / Kabupaten Domisili"
            placeholder="Jakarta Selatan"
            variant="mint"
            required
          />

          <BaseInput
            v-model="googleCompletionForm.address"
            type="text"
            label="Alamat Lengkap"
            placeholder="Jl. Sudirman No. 12"
            variant="mint"
            required
          />

          <div class="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              @click="showGoogleModal = false"
              class="px-4 py-2 border border-gray-300 text-[#52605D] text-xs font-semibold rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isCompletingGoogle"
              class="px-4 py-2 bg-primary-base text-white text-xs font-semibold rounded-lg hover:bg-[#0A5744]"
            >
              Selesaikan Pendaftaran
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
