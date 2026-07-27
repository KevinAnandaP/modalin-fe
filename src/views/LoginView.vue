<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/BaseInput.vue'

const router = useRouter()
const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const handleLogin = () => {
  if (form.value.email && form.value.password) {
    alert(`Login berhasil untuk ${form.value.email}`)
    router.push('/')
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

      <form @submit.prevent="handleLogin" class="space-y-5">
        <BaseInput
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="username@gmail.com"
          variant="mint"
          required
        />

        <BaseInput
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="********************"
          variant="mint"
          required
        />

        <div class="flex items-center justify-between text-sm pt-1">
          <label class="flex items-center gap-2 cursor-pointer select-none text-[#1F2937]">
            <input
              v-model="form.rememberMe"
              type="checkbox"
              class="w-4 h-4 rounded border-[#0F6E56]/30 text-[#0F6E56] focus:ring-[#0F6E56] cursor-pointer"
            />
            Ingat saya
          </label>
          <a href="#" class="text-[#0F6E56] hover:underline font-medium">Lupa password?</a>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            class="w-full py-3.5 bg-[#0F6E56] hover:bg-[#0A5744] text-white font-semibold text-base rounded-lg transition-colors cursor-pointer shadow-xs text-center"
          >
            Masuk
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

