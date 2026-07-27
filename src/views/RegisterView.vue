<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/BaseInput.vue'

const router = useRouter()
const form = ref({
  nama: '',
  email: '',
  telepon: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const handleRegister = () => {
  if (form.value.password !== form.value.confirmPassword) {
    alert('Kata sandi dan konfirmasi kata sandi tidak cocok!')
    return
  }
  if (form.value.email && form.value.nama) {
    alert(`Pendaftaran berhasil untuk ${form.value.nama}`)
    router.push('/login')
  }
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white p-8 sm:p-10 rounded-xl border border-[#0F6E56]/40 shadow-xs w-full font-inter my-8">
      <div class="mb-6 text-center">
        <h2 class="text-3xl sm:text-[36px] font-semibold text-[#1F2937] font-newsreader leading-tight">
          Buat Akun Modalin
        </h2>
        <p class="text-sm sm:text-base text-[#52605D] mt-2">
          Daftar sekarang untuk memulai pendanaan atau mengajukan modal.
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <BaseInput
          v-model="form.nama"
          type="text"
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          variant="mint"
          required
        />

        <BaseInput
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="username@gmail.com"
          variant="mint"
          required
        />

        <BaseInput
          v-model="form.telepon"
          type="tel"
          label="Nomor Telepon / WhatsApp"
          placeholder="08123456789"
          variant="mint"
          required
        />

        <BaseInput
          v-model="form.password"
          type="password"
          label="Kata Sandi"
          placeholder="********************"
          variant="mint"
          required
        />

        <BaseInput
          v-model="form.confirmPassword"
          type="password"
          label="Konfirmasi Kata Sandi"
          placeholder="********************"
          variant="mint"
          required
        />

        <div class="flex items-start gap-2 pt-1 text-sm">
          <input
            v-model="form.agreeTerms"
            type="checkbox"
            required
            class="mt-1 rounded border-[#0F6E56]/30 text-[#0F6E56] focus:ring-[#0F6E56] cursor-pointer shrink-0"
          />
          <label class="cursor-pointer select-none text-[#52605D]">
            Saya menyetujui <a href="#" class="text-[#0F6E56] underline font-medium">Syarat & Ketentuan</a> serta <a href="#" class="text-[#0F6E56] underline font-medium">Kebijakan Privasi</a> Modalin.
          </label>
        </div>

        <div class="pt-3">
          <button
            type="submit"
            class="w-full py-3.5 bg-[#0F6E56] hover:bg-[#0A5744] text-white font-semibold text-base rounded-lg transition-colors cursor-pointer shadow-xs text-center"
          >
            Daftar
          </button>
        </div>
      </form>

      <div class="mt-6 text-center text-sm text-[#52605D]">
        Sudah punya akun?
        <RouterLink to="/login" class="text-[#0F6E56] font-semibold hover:underline ml-1">
          Masuk di sini
        </RouterLink>
      </div>
    </div>
  </AuthLayout>
</template>

