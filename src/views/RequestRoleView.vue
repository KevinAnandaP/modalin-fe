<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseFileUpload from '@/components/BaseFileUpload.vue'
import { authService } from '@/services/auth'
import { Store, Coins, ShieldCheck, AlertCircle } from '@lucide/vue'

const router = useRouter()

const selectedRole = ref('borrower') // 'borrower' | 'lender' | 'verifier'
const form = ref({
  identityCardUrl: 'https://via.placeholder.com/600x400.png?text=KTP+Verified',
  riskAgreement: false,
  ethicsAgreement: false,
  trainingCompleted: false
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRoleSubmit = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const payload = {
    role: selectedRole.value
  }

  if (selectedRole.value === 'lender') {
    if (!form.value.identityCardUrl) {
      errorMessage.value = 'Foto / URL Identitas (KTP) wajib diisi untuk peran Pemberi Modal.'
      isLoading.value = false
      return
    }
    if (!form.value.riskAgreement) {
      errorMessage.value = 'Anda wajib menyetujui Perjanjian Risiko Pendanaan.'
      isLoading.value = false
      return
    }
    payload.identity_card_url = form.value.identityCardUrl
    payload.risk_agreement_accepted = form.value.riskAgreement
  } else if (selectedRole.value === 'verifier') {
    if (!form.value.identityCardUrl) {
      errorMessage.value = 'Foto / URL Identitas (KTP) wajib diisi untuk peran Verifikator.'
      isLoading.value = false
      return
    }
    if (!form.value.ethicsAgreement || !form.value.trainingCompleted) {
      errorMessage.value = 'Anda wajib menyetujui Kode Etik Independensi dan menyelesaikan Mini-Training.'
      isLoading.value = false
      return
    }
    payload.identity_card_url = form.value.identityCardUrl
    payload.ethics_accepted = form.value.ethicsAgreement
    payload.training_completed = form.value.trainingCompleted
  }

  try {
    await authService.requestRole(payload)
    successMessage.value = 'Pengajuan peran berhasil dikirim! Mengalihkan ke halaman status...'
    setTimeout(() => {
      router.push('/role-status')
    }, 1500)
  } catch (err) {
    if (err.status === 409 || (err.message && err.message.includes('already open'))) {
      successMessage.value = 'Pengajuan peran untuk posisi ini sudah dikirimkan sebelumnya. Mengalihkan ke status pengajuan...'
      setTimeout(() => {
        router.push('/role-status')
      }, 1500)
    } else {
      errorMessage.value = err.message || 'Gagal mengajukan peran. Periksa kembali data pengajuan Anda.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white p-8 sm:p-10 rounded-xl border border-primary-base/40 shadow-xs w-full max-w-5xl mx-auto font-inter my-8">
      <!-- Header -->
      <div class="mb-8 text-center border-b border-gray-100 pb-6">
        <h2 class="text-3xl sm:text-[36px] font-semibold text-neutral-primary font-newsreader leading-tight">
          Pengajuan Peran Akun Modalin
        </h2>
        <p class="text-sm sm:text-base text-[#52605D] mt-2">
          Pilih peran utama Anda di sebelah kiri dan lengkapi persyaratan pengajuan di sebelah kanan.
        </p>
      </div>

      <div v-if="errorMessage" class="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
        <AlertCircle class="w-5 h-5 shrink-0 text-red-600" />
        <span class="font-medium">{{ errorMessage }}</span>
      </div>

      <div v-if="successMessage" class="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-primary-base text-sm rounded-lg flex items-center gap-2">
        <span class="font-medium">{{ successMessage }}</span>
      </div>

      <form @submit.prevent="handleRoleSubmit">
        <!-- Landscape Grid: Left Options Bar + Right Requirements & Form -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- LEFT SIDE: Opsi Peran (Column span 5) -->
          <div class="lg:col-span-5 space-y-3.5">
            <h3 class="text-sm font-semibold text-neutral-primary uppercase tracking-wider mb-2 text-left">
              Pilihan Peran Akun
            </h3>

            <!-- Borrower Option -->
            <div
              @click="selectedRole = 'borrower'"
              :class="[
                'p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 text-left select-none',
                selectedRole === 'borrower'
                  ? 'border-primary-base bg-[#D7EAE3]/30 shadow-xs'
                  : 'border-gray-200 hover:border-primary-base/50 bg-white'
              ]"
            >
              <div class="flex items-center gap-3">
                <div :class="['w-10 h-10 rounded-lg flex items-center justify-center shrink-0', selectedRole === 'borrower' ? 'bg-primary-base text-white' : 'bg-gray-100 text-[#52605D]']">
                  <Store class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-semibold text-sm text-neutral-primary">Peminjam Modal</h4>
                  <p class="text-xs text-[#52605D] mt-0.5">UMKM Berjalan atau Usaha Rintisan</p>
                </div>
              </div>
              <input
                type="radio"
                name="role"
                value="borrower"
                :checked="selectedRole === 'borrower'"
                class="w-4 h-4 text-primary-base focus:ring-primary-base shrink-0"
              />
            </div>

            <!-- Lender Option -->
            <div
              @click="selectedRole = 'lender'"
              :class="[
                'p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 text-left select-none',
                selectedRole === 'lender'
                  ? 'border-primary-base bg-[#D7EAE3]/30 shadow-xs'
                  : 'border-gray-200 hover:border-primary-base/50 bg-white'
              ]"
            >
              <div class="flex items-center gap-3">
                <div :class="['w-10 h-10 rounded-lg flex items-center justify-center shrink-0', selectedRole === 'lender' ? 'bg-primary-base text-white' : 'bg-gray-100 text-[#52605D]']">
                  <Coins class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-semibold text-sm text-neutral-primary">Pemberi Modal</h4>
                  <p class="text-xs text-[#52605D] mt-0.5">Pendanaan kampanye & imbal hasil</p>
                </div>
              </div>
              <input
                type="radio"
                name="role"
                value="lender"
                :checked="selectedRole === 'lender'"
                class="w-4 h-4 text-primary-base focus:ring-primary-base shrink-0"
              />
            </div>

            <!-- Verifier Option -->
            <div
              @click="selectedRole = 'verifier'"
              :class="[
                'p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 text-left select-none',
                selectedRole === 'verifier'
                  ? 'border-primary-base bg-[#D7EAE3]/30 shadow-xs'
                  : 'border-gray-200 hover:border-primary-base/50 bg-white'
              ]"
            >
              <div class="flex items-center gap-3">
                <div :class="['w-10 h-10 rounded-lg flex items-center justify-center shrink-0', selectedRole === 'verifier' ? 'bg-primary-base text-white' : 'bg-gray-100 text-[#52605D]']">
                  <ShieldCheck class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-semibold text-sm text-neutral-primary">Verifikator Lapangan</h4>
                  <p class="text-xs text-[#52605D] mt-0.5">Verifikasi fisik lokasi UMKM</p>
                </div>
              </div>
              <input
                type="radio"
                name="role"
                value="verifier"
                :checked="selectedRole === 'verifier'"
                class="w-4 h-4 text-primary-base focus:ring-primary-base shrink-0"
              />
            </div>
          </div>

          <!-- RIGHT SIDE: Syarat Ketentuan & Form Submit (Column span 7) -->
          <div class="lg:col-span-7 flex flex-col justify-between space-y-6 text-left border-l-0 lg:border-l lg:border-gray-100 lg:pl-8">
            <div class="space-y-5">
              <h3 class="text-sm font-semibold text-neutral-primary uppercase tracking-wider">
                Syarat Ketentuan & Form Pengajuan
              </h3>

              <div class="p-5 bg-[#F9FAFB] rounded-xl border border-gray-200 space-y-4">
                <h4 class="font-semibold text-base text-neutral-primary">
                  Ketentuan Peran {{ selectedRole === 'borrower' ? 'Peminjam Modal' : selectedRole === 'lender' ? 'Pemberi Modal' : 'Verifikator Lapangan' }}
                </h4>

                <div v-if="selectedRole === 'borrower'" class="text-sm text-[#52605D] space-y-3">
                  <p>Sebagai Peminjam Modal di Modalin, Anda dapat mengajukan pembiayaan usaha:</p>
                  <div class="p-3 bg-white border border-gray-200 rounded-lg text-xs space-y-1.5">
                    <p class="font-semibold text-neutral-primary">1. Modal Usaha Berjalan</p>
                    <p>Dibutuhkan untuk usaha yang telah aktif min. 1 bulan dengan melampirkan catatan keuangan bulanan.</p>
                  </div>
                  <div class="p-3 bg-white border border-gray-200 rounded-lg text-xs space-y-1.5">
                    <p class="font-semibold text-neutral-primary">2. Modal Rintisan</p>
                    <p>Dibutuhkan untuk ide bisnis baru dengan menyertakan rencana usaha, RAB penggunaan dana, & estimasi target pembeli.</p>
                  </div>
                </div>

                <div v-if="selectedRole === 'lender' || selectedRole === 'verifier'" class="space-y-4">
                  <BaseFileUpload
                    v-model="form.identityCardUrl"
                    label="Dokumen Identitas (KTP)"
                    accept="image/*,.pdf"
                    :disabled="isLoading"
                    required
                  />

                  <!-- Lender Terms -->
                  <div v-if="selectedRole === 'lender'" class="p-3.5 bg-[#FEF3C7]/40 border border-secondary-base/20 rounded-lg text-xs text-secondary-base space-y-2">
                    <p class="font-semibold">Catatan Risiko Pendanaan:</p>
                    <p>Pemberi modal memahami bahwa estimasi return bukan jaminan mutlak dan pendanaan memiliki risiko bisnis. Anda wajib membaca dan menyetujui lembar risiko sebelum mendanai.</p>

                    <div class="flex items-start gap-2 pt-2">
                      <input
                        v-model="form.riskAgreement"
                        type="checkbox"
                        id="risk-agreement"
                        :disabled="isLoading"
                        required
                        class="mt-0.5 rounded border-primary-base/30 text-primary-base focus:ring-primary-base cursor-pointer shrink-0"
                      />
                      <label for="risk-agreement" class="cursor-pointer select-none font-medium text-neutral-primary">
                        Saya memahami dan menyetujui Perjanjian Risiko Pendanaan.
                      </label>
                    </div>
                  </div>

                  <!-- Verifier Terms -->
                  <div v-if="selectedRole === 'verifier'" class="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-2">
                    <p class="font-semibold">Ketentuan Kode Etik Verifikator:</p>
                    <p>Verifikator tidak boleh memiliki konflik kepentingan (tidak boleh memverifikasi usaha sendiri, keluarga, atau relasi dekat).</p>

                    <div class="space-y-2 pt-2">
                      <div class="flex items-start gap-2">
                        <input
                          v-model="form.ethicsAgreement"
                          type="checkbox"
                          id="ethics-agreement"
                          :disabled="isLoading"
                          required
                          class="mt-0.5 rounded border-primary-base/30 text-primary-base focus:ring-primary-base cursor-pointer shrink-0"
                        />
                        <label for="ethics-agreement" class="cursor-pointer select-none font-medium text-neutral-primary">
                          Saya menyetujui Kode Etik & Independensi Verifikator.
                        </label>
                      </div>
                      <div class="flex items-start gap-2">
                        <input
                          v-model="form.trainingCompleted"
                          type="checkbox"
                          id="training-completed"
                          :disabled="isLoading"
                          required
                          class="mt-0.5 rounded border-primary-base/30 text-primary-base focus:ring-primary-base cursor-pointer shrink-0"
                        />
                        <label for="training-completed" class="cursor-pointer select-none font-medium text-neutral-primary">
                          Saya telah menyelesaikan Mini-Training Verifikator.
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-4">
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full py-3.5 bg-primary-base hover:bg-[#0A5744] text-white font-semibold text-base rounded-lg transition-colors cursor-pointer shadow-xs text-center disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg v-if="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isLoading ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Peran' }}</span>
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  </AuthLayout>
</template>
