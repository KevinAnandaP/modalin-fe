<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/BaseInput.vue'
import { authService } from '@/services/auth'

const router = useRouter()
const form = ref({
  nama: '',
  email: '',
  telepon: '',
  city: '',
  address: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Kata sandi dan konfirmasi kata sandi tidak cocok!'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authService.register({
      full_name: form.value.nama,
      email: form.value.email,
      phone: form.value.telepon,
      city: form.value.city,
      address: form.value.address,
      password: form.value.password,
      terms_accepted: form.value.agreeTerms
    })

    successMessage.value = 'Pendaftaran berhasil! Silakan masuk dengan akun Anda.'
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (err) {
    errorMessage.value = err.message || 'Pendaftaran gagal. Silakan periksa kembali data Anda.'
  } finally {
    isLoading.value = false
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

      <div v-if="errorMessage" class="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
        <span class="font-medium">{{ errorMessage }}</span>
      </div>

      <div v-if="successMessage" class="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-[#0F6E56] text-sm rounded-lg flex items-center gap-2">
        <span class="font-medium">{{ successMessage }}</span>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <BaseInput
          v-model="form.nama"
          type="text"
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          variant="mint"
          :disabled="isLoading"
          required
        />

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
          v-model="form.telepon"
          type="tel"
          label="Nomor Telepon / WhatsApp"
          placeholder="08123456789"
          variant="mint"
          :disabled="isLoading"
          required
        />

        <BaseInput
          v-model="form.city"
          type="text"
          label="Kota / Kabupaten"
          placeholder="Contoh: Jakarta Selatan"
          variant="mint"
          :disabled="isLoading"
          required
        />

        <BaseInput
          v-model="form.address"
          type="text"
          label="Alamat Lengkap"
          placeholder="Nama jalan, RT/RW, Kelurahan"
          variant="mint"
          :disabled="isLoading"
          required
        />

        <BaseInput
          v-model="form.password"
          type="password"
          label="Kata Sandi"
          placeholder="********************"
          variant="mint"
          :disabled="isLoading"
          required
        />

        <BaseInput
          v-model="form.confirmPassword"
          type="password"
          label="Konfirmasi Kata Sandi"
          placeholder="********************"
          variant="mint"
          :disabled="isLoading"
          required
        />

        <div class="flex items-start gap-2 pt-1 text-sm">
          <input
            v-model="form.agreeTerms"
            type="checkbox"
            :disabled="isLoading"
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
            :disabled="isLoading"
            class="w-full py-3.5 bg-[#0F6E56] hover:bg-[#0A5744] text-white font-semibold text-base rounded-lg transition-colors cursor-pointer shadow-xs text-center disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? 'Mendaftarkan...' : 'Daftar' }}</span>
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


