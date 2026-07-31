<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/BaseInput.vue'
import { authService } from '@/services/auth'

const router = useRouter()
const route = useRoute()

const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const isLoading = ref(false)
const errorMessage = ref('')

// Google Completion Modal
const showGoogleModal = ref(false)
const googleTempToken = ref('')
const googleCompletionForm = ref({
  phone: '',
  city: '',
  address: '',
  termsAccepted: true
})
const isCompletingGoogle = ref(false)

// Helper: Redirect user based on approved roles
const redirectUserBasedOnRole = async () => {
  try {
    if (route.query.redirect) {
      router.push(route.query.redirect)
      return
    }

    const profileRes = await authService.getProfile()
    const rawData = profileRes?.data || profileRes
    const roles = rawData?.roles || rawData?.user?.roles || []

    if (Array.isArray(roles) && roles.length > 0) {
      if (roles.includes('admin')) {
        router.push('/admin')
      } else if (roles.includes('verifier')) {
        router.push('/verifier/dashboard')
      } else if (roles.includes('borrower')) {
        router.push('/business/detail')
      } else if (roles.includes('lender')) {
        router.push('/lender/portfolio')
      } else {
        router.push('/campaigns')
      }
    } else {
      router.push('/request-role')
    }
  } catch (err) {
    console.error('Failed to check profile roles:', err)
    router.push('/request-role')
  }
}

// Handle Google OAuth Callback
const checkGoogleCallback = async () => {
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const idToken = hashParams.get('id_token')

  if (idToken) {
    isLoading.value = true
    errorMessage.value = ''
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

      window.history.replaceState({}, document.title, window.location.pathname)

      const data = res?.data
      if (data?.is_new_user) {
        googleTempToken.value = data.temp_token
        showGoogleModal.value = true
      } else {
        await redirectUserBasedOnRole()
      }
    } catch (err) {
      errorMessage.value = err.message || 'Gagal memproses otentikasi Google.'
    } finally {
      isLoading.value = false
    }
  }
}

onMounted(() => {
  checkGoogleCallback()
})

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    await authService.login({
      email: form.value.email,
      password: form.value.password
    }, form.value.rememberMe)

    await redirectUserBasedOnRole()
  } catch (err) {
    errorMessage.value = err.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.'
  } finally {
    isLoading.value = false
  }
}

const triggerGoogleOAuth = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/login`

  if (!clientId || clientId.includes('your-google-client-id')) {
    alert('VITE_GOOGLE_CLIENT_ID belum dikonfigurasi di file modalin-fe/.env!')
    return
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'id_token',
      scope: 'openid email profile',
      prompt: 'select_account',
      nonce: Math.random().toString(36).substring(2)
    }).toString()

  window.location.href = googleAuthUrl
}

const handleCompleteGoogleAuth = async () => {
  if (!googleCompletionForm.value.phone || !googleCompletionForm.value.city || !googleCompletionForm.value.address) {
    errorMessage.value = 'Lengkapi nomor HP, kota, dan alamat Anda.'
    return
  }

  isCompletingGoogle.value = true
  errorMessage.value = ''

  try {
    await authService.completeGoogleAuth({
      temp_token: googleTempToken.value,
      phone: googleCompletionForm.value.phone,
      city: googleCompletionForm.value.city,
      address: googleCompletionForm.value.address,
      terms_accepted: googleCompletionForm.value.termsAccepted
    })
    showGoogleModal.value = false
    await redirectUserBasedOnRole()
  } catch (err) {
    errorMessage.value = err.message || 'Gagal melengkapi profil pendaftaran Google.'
  } finally {
    isCompletingGoogle.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white p-5 sm:p-8 lg:p-10 rounded-xl border border-primary-base/40 shadow-xs w-full max-w-md mx-auto font-inter">
      <div class="mb-6 text-center">
        <h2 class="text-2xl sm:text-[36px] font-semibold text-neutral-primary font-newsreader leading-tight">
          Masuk ke Modalin
        </h2>
        <p class="text-xs sm:text-base text-[#52605D] mt-2">
          Selamat datang kembali. Silakan masuk untuk melanjutkan.
        </p>
      </div>

      <div v-if="errorMessage" class="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2 text-left">
        <span class="font-medium">{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <BaseInput
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="username@gmail.com"
          variant="mint"
          :disabled="isLoading"
          required
        />

        <BaseInput
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="********************"
          variant="mint"
          :disabled="isLoading"
          required
        />

        <div class="flex items-center justify-between text-sm pt-1">
          <label class="flex items-center gap-2 cursor-pointer select-none text-neutral-primary">
            <input
              v-model="form.rememberMe"
              type="checkbox"
              :disabled="isLoading"
              class="w-4 h-4 rounded border-primary-base/30 text-primary-base focus:ring-primary-base cursor-pointer"
            />
            Ingat saya
          </label>
          <a href="#" class="text-primary-base hover:underline font-medium">Lupa password?</a>
        </div>

        <div class="pt-2 space-y-3">
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3.5 bg-primary-base hover:bg-[#0A5744] text-white font-semibold text-base rounded-lg transition-colors cursor-pointer shadow-xs text-center disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? 'Memproses...' : 'Masuk' }}</span>
          </button>

          <!-- Divider -->
          <div class="relative flex py-2 items-center">
            <div class="grow border-t border-gray-200"></div>
            <span class="shrink mx-4 text-xs text-[#52605D]">atau</span>
            <div class="grow border-t border-gray-200"></div>
          </div>

          <!-- Google OAuth Button -->
          <button
            type="button"
            @click="triggerGoogleOAuth"
            :disabled="isLoading"
            class="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-neutral-primary font-semibold text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2.5 shadow-xs"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Masuk dengan Google</span>
          </button>
        </div>
      </form>

      <!-- Google Completion Modal -->
      <div v-if="showGoogleModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl border border-primary-base/40 p-6 max-w-md w-full text-left space-y-4 shadow-lg font-inter">
          <h3 class="text-xl font-bold text-neutral-primary font-newsreader">Lengkapi Profil Google</h3>
          <p class="text-xs text-[#52605D]">
            Akun Google Anda terdeteksi baru. Mohon isi nomor HP, kota, dan alamat untuk menyelesaikan pendaftaran.
          </p>

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

      <div class="mt-8 text-center text-sm text-[#52605D]">
        Belum punya akun?
        <RouterLink to="/register" class="text-primary-base font-semibold hover:underline ml-1">
          Daftar di sini
        </RouterLink>
      </div>
    </div>
  </AuthLayout>
</template>
