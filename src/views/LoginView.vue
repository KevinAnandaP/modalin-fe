<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
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
    <div class="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-primary-base/10 max-w-md w-full mx-auto font-inter">
      <div class="text-center mb-8">
        <h2 class="text-semibold-32 text-neutral-primary font-newsreader">Selamat Datang Kembali</h2>
        <p class="text-regular-16 text-neutral-secondary mt-2">Masukkan akun Modalin Anda untuk melanjutkan.</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <BaseInput
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="nama@email.com"
          required
        />

        <BaseInput
          v-model="form.password"
          type="password"
          label="Kata Sandi"
          placeholder="••••••••"
          required
        />

        <div class="flex items-center justify-between text-regular-14">
          <label class="flex items-center gap-2 cursor-pointer select-none text-neutral-secondary">
            <input
              v-model="form.rememberMe"
              type="checkbox"
              class="rounded border-primary-base/20 text-primary-base focus:ring-primary-base cursor-pointer"
            />
            Ingat Saya
          </label>
          <a href="#" class="text-primary-base hover:underline font-medium">Lupa Kata Sandi?</a>
        </div>

        <div class="pt-2">
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            rounded
            class="w-full justify-center"
          >
            Masuk
          </BaseButton>
        </div>
      </form>

      <div class="mt-8 pt-6 border-t border-neutral-primary/10 text-center text-regular-14 text-neutral-secondary">
        Belum punya akun?
        <RouterLink to="/register" class="text-primary-base font-semibold hover:underline ml-1">
          Daftar sekarang
        </RouterLink>
      </div>
    </div>
  </AuthLayout>
</template>
