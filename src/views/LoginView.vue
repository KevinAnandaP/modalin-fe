<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/BaseInput.vue'
import { authService } from '@/services/auth'

const router = useRouter()
const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const { profile } = await authService.login({
      email: form.value.email,
      password: form.value.password
    }, form.value.rememberMe)

    const roles = profile?.roles || []
    if (roles.length > 0) {
      router.push('/')
    } else {
      router.push('/request-role')
    }
  } catch (err) {
    errorMessage.value = err.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white p-8 sm:p-10 rounded-xl border border-[#0F6E56]/40 shadow-xs w-full font-inter">
      <div class="mb-6 text-center">
        <h2 class="text-3xl sm:text-[36px] font-semibold text-[#1F2937] font-newsreader leading-tight">
          Masuk ke Modalin
        </h2>
        <p class="text-sm sm:text-base text-[#52605D] mt-2">
          Selamat datang kembali. Silakan masuk untuk melanjutkan.
        </p>
      </div>

      <div v-if="errorMessage" class="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
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
          <label class="flex items-center gap-2 cursor-pointer select-none text-[#1F2937]">
            <input
              v-model="form.rememberMe"
              type="checkbox"
              :disabled="isLoading"
              class="w-4 h-4 rounded border-[#0F6E56]/30 text-[#0F6E56] focus:ring-[#0F6E56] cursor-pointer"
            />
            Ingat saya
          </label>
          <a href="#" class="text-[#0F6E56] hover:underline font-medium">Lupa password?</a>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3.5 bg-[#0F6E56] hover:bg-[#0A5744] text-white font-semibold text-base rounded-lg transition-colors cursor-pointer shadow-xs text-center disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? 'Memproses...' : 'Masuk' }}</span>
          </button>
        </div>
      </form>

      <div class="mt-8 text-center text-sm text-[#52605D]">
        Belum punya akun?
        <RouterLink to="/register" class="text-[#0F6E56] font-semibold hover:underline ml-1">
          Daftar di sini
        </RouterLink>
      </div>
    </div>
  </AuthLayout>
</template>


