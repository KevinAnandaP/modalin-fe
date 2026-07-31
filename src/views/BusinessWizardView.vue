<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseFileUpload from '@/components/BaseFileUpload.vue'
import { businessService } from '@/services/business'
import { Store, MapPin, CheckCircle2, ChevronLeft, ChevronRight, AlertCircle, Sparkles, ShieldAlert } from '@lucide/vue'

const router = useRouter()

const currentStep = ref(1) // 1: Info Utama, 2: Lokasi & Detail, 3: Review

const form = ref({
  businessName: '',
  categoryId: 1,
  description: '',
  businessType: 'running', // 'running' | 'starter'
  startedAt: '',
  locationAddress: '',
  latitude: -6.2088,
  longitude: 106.8456,
  photoUrl: 'https://via.placeholder.com/800x600.png?text=Foto+Usaha+UMKM',
  
  // Starter business specific fields
  targetMarket: '',
  supplierInfo: '',
  pricingEstimation: '',
  readinessProofUrl: 'https://via.placeholder.com/800x600.png?text=Bukti+Kesiapan',
  commitmentChecked: false
})

const categories = [
  { id: 1, name: 'Kuliner & F&B' },
  { id: 2, name: 'Fashion & Tekstil' },
  { id: 3, name: 'Perdagangan & Retail' },
  { id: 4, name: 'Jasa & Kreatif' },
  { id: 5, name: 'Pertanian & Peternakan' },
  { id: 6, name: 'Teknologi & Digital' }
]

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isForbidden = ref(false)

const isStep1Valid = computed(() => {
  return form.value.businessName.trim() !== '' && form.value.description.trim() !== ''
})

const isStep2Valid = computed(() => {
  if (form.value.locationAddress.trim() === '') return false
  if (form.value.businessType === 'starter') {
    return (
      form.value.targetMarket.trim() !== '' &&
      form.value.supplierInfo.trim() !== '' &&
      form.value.pricingEstimation.trim() !== '' &&
      form.value.commitmentChecked
    )
  }
  return true
})

const nextStep = () => {
  errorMessage.value = ''
  if (currentStep.value === 1 && !isStep1Valid.value) {
    errorMessage.value = 'Lengkapi Nama Usaha dan Deskripsi sebelum melanjutkan.'
    return
  }
  if (currentStep.value === 2 && !isStep2Valid.value) {
    errorMessage.value = 'Lengkapi Alamat Usaha' + (form.value.businessType === 'starter' ? ' dan Detail Modal Rintisan.' : '.')
    return
  }
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  errorMessage.value = ''
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleSubmit = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const payload = {
    business_name: form.value.businessName,
    category_id: Number(form.value.categoryId),
    description: form.value.description,
    business_type: form.value.businessType,
    location_address: form.value.locationAddress,
    latitude: form.value.latitude,
    longitude: form.value.longitude,
    photo_url: form.value.photoUrl
  }

  if (form.value.startedAt) {
    payload.started_at = new Date(form.value.startedAt).toISOString()
  }

  if (form.value.businessType === 'starter') {
    payload.target_market = form.value.targetMarket
    payload.supplier_info = form.value.supplierInfo
    payload.pricing_estimation = form.value.pricingEstimation
    payload.readiness_proof_url = form.value.readinessProofUrl
    payload.commitment_checked = form.value.commitmentChecked
  }

  try {
    await businessService.createBusiness(payload)
    successMessage.value = 'Profil bisnis berhasil dibuat! Mengalihkan ke halaman detail...'
    setTimeout(() => {
      router.push('/business/detail')
    }, 1500)
  } catch (err) {
    if (err?.status === 403) {
      isForbidden.value = true
      errorMessage.value = 'Akses Peran Peminjam Modal belum disetujui oleh Admin.'
    } else {
      errorMessage.value = err.message || 'Gagal membuat profil bisnis. Periksa kembali kelengkapan data Anda.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white p-4 sm:p-8 lg:p-10 rounded-xl border border-primary-base/40 shadow-xs w-full max-w-3xl mx-auto font-inter my-4 sm:my-8">
      
      <!-- Title Header -->
      <div class="mb-6 sm:mb-8 text-center border-b border-gray-100 pb-4 sm:pb-6">
        <h2 class="text-2xl sm:text-[36px] font-semibold text-neutral-primary font-newsreader leading-tight">
          Profil Bisnis
        </h2>
        <p class="text-xs sm:text-base text-[#52605D] mt-1.5 sm:mt-2">
          Lengkapi profil usaha Anda untuk menentukan limit pinjaman dan membuka akses pengajuan modal.
        </p>
      </div>

      <!-- 3-Step Progress Bar -->
      <div class="mb-8 flex items-center justify-between relative px-2 sm:px-6">
        <div class="absolute left-6 right-6 sm:left-10 sm:right-10 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0"></div>
        <div
          class="absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 h-1 bg-primary-base transition-all duration-300 z-0"
          :style="{ width: `${((currentStep - 1) / 2) * 82}%` }"
        ></div>

        <!-- Step 1 Indicator -->
        <div class="relative z-10 flex flex-col items-center gap-1 cursor-pointer" @click="currentStep = 1">
          <div :class="['w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-semibold text-[11px] sm:text-xs transition-colors shrink-0', currentStep >= 1 ? 'bg-primary-base text-white' : 'bg-gray-200 text-[#52605D]']">
            1
          </div>
          <span class="text-[10px] sm:text-xs font-medium text-neutral-primary text-center max-w-[64px] sm:max-w-none truncate sm:whitespace-normal">Info Utama</span>
        </div>

        <!-- Step 2 Indicator -->
        <div class="relative z-10 flex flex-col items-center gap-1 cursor-pointer" @click="currentStep >= 2 ? currentStep = 2 : null">
          <div :class="['w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-semibold text-[11px] sm:text-xs transition-colors shrink-0', currentStep >= 2 ? 'bg-primary-base text-white' : 'bg-gray-200 text-[#52605D]']">
            2
          </div>
          <span class="text-[10px] sm:text-xs font-medium text-neutral-primary text-center max-w-[64px] sm:max-w-none truncate sm:whitespace-normal">Lokasi & Detail</span>
        </div>

        <!-- Step 3 Indicator -->
        <div class="relative z-10 flex flex-col items-center gap-1 cursor-pointer" @click="currentStep === 3 ? null : null">
          <div :class="['w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-semibold text-[11px] sm:text-xs transition-colors shrink-0', currentStep === 3 ? 'bg-primary-base text-white' : 'bg-gray-200 text-[#52605D]']">
            3
          </div>
          <span class="text-[10px] sm:text-xs font-medium text-neutral-primary text-center max-w-[64px] sm:max-w-none truncate sm:whitespace-normal">Review</span>
        </div>
      </div>

      <!-- Error / Forbidden Banner -->
      <div v-if="isForbidden" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2">
        <div class="flex items-center gap-2 text-amber-900 font-semibold text-sm">
          <ShieldAlert class="w-5 h-5 text-amber-700 shrink-0" />
          <span>Akses Peran Peminjam Membutuhkan Persetujuan Admin</span>
        </div>
        <p class="text-xs text-amber-800">
          Pengajuan peran Peminjam Modal Anda masih dalam status peninjauan (*under review*). Setelah Admin menyetujui peran Anda, Anda dapat menyimpan profil bisnis.
        </p>
        <button @click="router.push('/role-status')" class="px-3.5 py-1.5 bg-primary-base text-white text-xs font-semibold rounded-lg hover:bg-[#0A5744] cursor-pointer">
          Cek Status Pengajuan Peran
        </button>
      </div>

      <div v-else-if="errorMessage" class="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2 text-left">
        <AlertCircle class="w-5 h-5 shrink-0 text-red-600" />
        <span class="font-medium">{{ errorMessage }}</span>
      </div>

      <div v-if="successMessage" class="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-primary-base text-sm rounded-lg flex items-center gap-2 text-left">
        <CheckCircle2 class="w-5 h-5 shrink-0" />
        <span class="font-medium">{{ successMessage }}</span>
      </div>

      <form @submit.prevent="handleSubmit">
        
        <!-- STEP 1: INFO UTAMA -->
        <div v-if="currentStep === 1" class="space-y-5 text-left">
          <h3 class="text-lg font-semibold text-neutral-primary border-b border-gray-100 pb-2">
            Langkah 1: Informasi Utama Usaha
          </h3>

          <!-- Business Type Selector -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-neutral-primary">Jalur Pengajuan Usaha</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                @click="form.businessType = 'running'"
                :class="[
                  'p-4 rounded-xl border-2 transition-all cursor-pointer select-none text-left',
                  form.businessType === 'running' ? 'border-primary-base bg-[#D7EAE3]/30' : 'border-gray-200 bg-white'
                ]"
              >
                <div class="flex items-center gap-2.5">
                  <Store class="w-5 h-5 text-primary-base" />
                  <span class="font-semibold text-sm text-neutral-primary">Usaha Berjalan</span>
                </div>
                <p class="text-xs text-[#52605D] mt-1.5">
                  Untuk usaha aktif min. 1 bulan. Limit pinjaman Rp500rb - Rp15jt.
                </p>
              </div>

              <div
                @click="form.businessType = 'starter'"
                :class="[
                  'p-4 rounded-xl border-2 transition-all cursor-pointer select-none text-left',
                  form.businessType === 'starter' ? 'border-primary-base bg-[#D7EAE3]/30' : 'border-gray-200 bg-white'
                ]"
              >
                <div class="flex items-center gap-2.5">
                  <Sparkles class="w-5 h-5 text-primary-base" />
                  <span class="font-semibold text-sm text-neutral-primary">Modal Rintisan</span>
                </div>
                <p class="text-xs text-[#52605D] mt-1.5">
                  Untuk usaha baru dengan rencana jelas. Limit awal Rp300rb - Rp1.5jt.
                </p>
              </div>
            </div>
          </div>

          <BaseInput
            v-model="form.businessName"
            type="text"
            label="Nama Usaha / Proyek"
            placeholder="Contoh: Kopi Serumpun UMKM"
            variant="mint"
            :disabled="isLoading"
            required
          />

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-neutral-primary">Kategori Usaha</label>
            <select
              v-model="form.categoryId"
              class="w-full px-4 py-3 bg-[#D7EAE3] border border-primary-base/40 rounded-lg text-neutral-primary outline-none focus:border-primary-base"
            >
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-neutral-primary">Deskripsi Usaha / Proyek</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Jelaskan produk, layanan, atau gambaran usaha Anda..."
              class="w-full px-4 py-3 bg-[#D7EAE3] border border-primary-base/40 rounded-lg text-neutral-primary outline-none focus:border-primary-base placeholder-[#67887F]"
              required
            ></textarea>
          </div>

          <BaseInput
            v-if="form.businessType === 'running'"
            v-model="form.startedAt"
            type="date"
            label="Tanggal Berdiri / Mulai Usaha"
            variant="mint"
            :disabled="isLoading"
          />
        </div>

        <!-- STEP 2: LOKASI & DETAIL USAHA -->
        <div v-else-if="currentStep === 2" class="space-y-5 text-left">
          <h3 class="text-lg font-semibold text-neutral-primary border-b border-gray-100 pb-2">
            Langkah 2: Lokasi & Detail Usaha
          </h3>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-neutral-primary">Alamat Lengkap Lokasi Usaha / Lapak</label>
            <textarea
              v-model="form.locationAddress"
              rows="3"
              placeholder="Nama jalan, RT/RW, Kelurahan, Kecamatan, Kota..."
              class="w-full px-4 py-3 bg-[#D7EAE3] border border-primary-base/40 rounded-lg text-neutral-primary outline-none focus:border-primary-base placeholder-[#67887F]"
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInput
              v-model="form.latitude"
              type="number"
              step="any"
              label="Koordinat Latitude (GPS)"
              variant="mint"
              :disabled="isLoading"
            />
            <BaseInput
              v-model="form.longitude"
              type="number"
              step="any"
              label="Koordinat Longitude (GPS)"
              variant="mint"
              :disabled="isLoading"
            />
          </div>

          <BaseFileUpload
            v-model="form.photoUrl"
            label="Unggah Foto Usaha / Produk / Lapak"
            accept="image/*"
            :disabled="isLoading"
          />

          <!-- Integrated Starter Business Requirements in Step 2 if Modal Rintisan -->
          <div v-if="form.businessType === 'starter'" class="space-y-4 pt-4 border-t border-gray-100">
            <h4 class="font-semibold text-base text-neutral-primary">Persyaratan Modal Rintisan</h4>
            <div class="p-3.5 bg-[#FEF3C7]/40 border border-secondary-base/20 rounded-lg text-xs text-secondary-base">
              Isi target pembeli, supplier, dan estimasi harga jual untuk mempercepat peninjauan modal rintisan.
            </div>

            <BaseInput
              v-model="form.targetMarket"
              type="text"
              label="Target Pembeli Awal"
              placeholder="Contoh: Mahasiswa & pekerja kantoran sekitar lokasi"
              variant="mint"
              :disabled="isLoading"
              required
            />

            <BaseInput
              v-model="form.supplierInfo"
              type="text"
              label="Sumber Bahan / Supplier Alat"
              placeholder="Contoh: Distributor Bahan Pokok Pasar Grosir"
              variant="mint"
              :disabled="isLoading"
              required
            />

            <BaseInput
              v-model="form.pricingEstimation"
              type="text"
              label="Estimasi Harga Modal & Harga Jual"
              placeholder="Contoh: Modal Rp10.000/porsi, Harga Jual Rp15.000/porsi"
              variant="mint"
              :disabled="isLoading"
              required
            />

            <BaseFileUpload
              v-model="form.readinessProofUrl"
              label="Bukti Kesiapan Sederhana (Foto produk/lapak/dokumen)"
              accept="image/*,.pdf"
              :disabled="isLoading"
            />

            <div class="flex items-start gap-2 pt-2 text-sm">
              <input
                v-model="form.commitmentChecked"
                type="checkbox"
                id="commitment-checked"
                :disabled="isLoading"
                required
                class="mt-0.5 rounded border-primary-base/30 text-primary-base focus:ring-primary-base cursor-pointer shrink-0"
              />
              <label for="commitment-checked" class="cursor-pointer select-none font-medium text-neutral-primary">
                Saya berkomitmen untuk rajin mencatat pengeluaran & omzet bulanan setelah pencairan dana.
              </label>
            </div>
          </div>
        </div>

        <!-- STEP 3: REVIEW & SUBMIT -->
        <div v-else-if="currentStep === 3" class="space-y-5 text-left">
          <h3 class="text-lg font-semibold text-neutral-primary border-b border-gray-100 pb-2">
            Langkah 3: Review Ringkasan Profil Bisnis
          </h3>

          <div class="p-5 bg-[#F9FAFB] rounded-xl border border-gray-200 space-y-3 text-sm">
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-[#52605D]">Nama Usaha:</span>
              <span class="font-semibold text-neutral-primary">{{ form.businessName }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-[#52605D]">Jalur Usaha:</span>
              <span class="font-semibold text-neutral-primary capitalize">{{ form.businessType === 'starter' ? 'Modal Rintisan' : 'Usaha Berjalan' }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-[#52605D]">Kategori:</span>
              <span class="font-semibold text-neutral-primary">{{ categories.find(c => c.id === Number(form.categoryId))?.name }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-[#52605D]">Alamat Usaha:</span>
              <span class="font-semibold text-neutral-primary">{{ form.locationAddress }}</span>
            </div>
            <div v-if="form.businessType === 'starter'" class="flex justify-between">
              <span class="text-[#52605D]">Limit Awal Simulasi:</span>
              <span class="font-semibold text-primary-base">Rp 300.000</span>
            </div>
            <div v-else class="flex justify-between">
              <span class="text-[#52605D]">Limit Awal Simulasi:</span>
              <span class="font-semibold text-primary-base">Rp 500.000</span>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:gap-0 justify-between items-stretch sm:items-center pt-4 border-t border-gray-100">
          <button
            v-if="currentStep > 1"
            type="button"
            @click="prevStep"
            :disabled="isLoading"
            class="px-5 py-2.5 border border-gray-300 text-[#52605D] hover:text-neutral-primary font-semibold text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <div v-else></div>

          <button
            v-if="currentStep < 3"
            type="button"
            @click="nextStep"
            class="px-6 py-2.5 bg-primary-base hover:bg-[#0A5744] text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs w-full sm:w-auto"
          >
            <span>Selanjutnya</span>
            <ChevronRight class="w-4 h-4" />
          </button>

          <button
            v-else
            type="submit"
            :disabled="isLoading"
            class="px-8 py-3 bg-primary-base hover:bg-[#0A5744] text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? 'Menyimpan Profil...' : 'Simpan Profil Bisnis' }}</span>
          </button>
        </div>

      </form>

    </div>
  </AuthLayout>
</template>
