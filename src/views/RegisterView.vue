<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'

const router = useRouter()
const role = ref('peminjam')
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
    alert(`Pendaftaran berhasil untuk ${form.value.nama} sebagai ${role.value === 'peminjam' ? 'Peminjam UMKM' : 'Pemberi Modal'}`)
    router.push('/login')
  }
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-primary-base/10 max-w-lg w-full mx-auto font-inter">
      <div class="text-center mb-6">
        <h2 class="text-semibold-32 text-neutral-primary font-newsreader">Buat Akun Modalin</h2>
        <p class="text-regular-16 text-neutral-secondary mt-2">Daftar sekarang untuk memulai pendanaan atau mengajukan modal.</p>
      </div>

      <div class="relative bg-primary-10/60 p-1.5 rounded-lg inline-flex items-center justify-center border border-primary-base/10 w-full mb-6">
        <div
          class="absolute top-1.5 bottom-1.5 bg-white rounded-md shadow-xs transition-all duration-300 ease-in-out"
          :style="{
            left: role === 'peminjam' ? '0.375rem' : 'calc(50% + 0.1875rem)',
            width: 'calc(50% - 0.5625rem)'
          }"
        ></div>

        <button
          type="button"
          @click="role = 'peminjam'"
          :class="[
            'relative z-10 flex-1 px-4 py-2 text-medium-16 font-semibold transition-colors duration-300 cursor-pointer text-center select-none whitespace-nowrap',
            role === 'peminjam' ? 'text-primary-base' : 'text-neutral-secondary hover:text-neutral-primary'
          ]"
        >
          Peminjam (UMKM)
        </button>
        <button
          type="button"
          @click="role = 'pemberi'"
          :class="[
            'relative z-10 flex-1 px-4 py-2 text-medium-16 font-semibold transition-colors duration-300 cursor-pointer text-center select-none whitespace-nowrap',
            role === 'pemberi' ? 'text-primary-base' : 'text-neutral-secondary hover:text-neutral-primary'
          ]"
        >
          Pemberi Modal
        </button>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <BaseInput
          v-model="form.nama"
          type="text"
          label="Nama Lengkap"
          placeholder="Nama Lengkap"
          required
        />

        <BaseInput
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="nama@email.com"
          required
        />

        <BaseInput
          v-model="form.telepon"
          type="tel"
          label="Nomor Telepon / WhatsApp"
          placeholder="08123456789"
          required
        />

        <BaseInput
          v-model="form.password"
          type="password"
          label="Kata Sandi"
          placeholder="••••••••"
          required
        />

        <BaseInput
          v-model="form.confirmPassword"
          type="password"
          label="Konfirmasi Kata Sandi"
          placeholder="••••••••"
          required
        />

        <div class="flex items-start gap-2 pt-1 text-regular-14">
          <input
            v-model="form.agreeTerms"
            type="checkbox"
            required
            class="mt-1 rounded border-primary-base/20 text-primary-base focus:ring-primary-base cursor-pointer shrink-0"
          />
          <label class="cursor-pointer select-none text-neutral-secondary">
            Saya menyetujui <a href="#" class="text-primary-base underline">Syarat & Ketentuan</a> serta <a href="#" class="text-primary-base underline">Kebijakan Privasi</a> Modalin.
          </label>
        </div>

        <div class="pt-3">
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            rounded
            class="w-full justify-center"
          >
            Daftar
          </BaseButton>
        </div>
      </form>

      <div class="mt-6 pt-5 border-t border-neutral-primary/10 text-center text-regular-14 text-neutral-secondary">
        Sudah punya akun?
        <RouterLink to="/login" class="text-primary-base font-semibold hover:underline ml-1">
          Masuk di sini
        </RouterLink>
      </div>
    </div>
  </AuthLayout>
</template>
