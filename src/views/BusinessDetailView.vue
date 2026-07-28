<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { businessService } from '@/services/business'
import { Store, MapPin, CheckCircle2, ShieldAlert, PlusCircle, RefreshCw, AlertCircle, Sparkles } from '@lucide/vue'

const router = useRouter()

const isLoading = ref(true)
const business = ref(null)
const isForbidden = ref(false)
const isNotFound = ref(false)
const errorMessage = ref('')

const fetchBusiness = async () => {
  isLoading.value = true
  errorMessage.value = ''
  isForbidden.value = false
  isNotFound.value = false

  try {
    const res = await businessService.getMyBusiness()
    business.value = res?.data || null
  } catch (err) {
    if (err?.status === 403 || err?.response?.status === 403) {
      isForbidden.value = true
      errorMessage.value = 'Akses ke Fitur Peminjam Modal membutuhkan persetujuan peran dari Admin.'
    } else if (err?.status === 404 || err?.response?.status === 404) {
      isNotFound.value = true
    } else {
      errorMessage.value = err.message || 'Gagal memuat data profil bisnis.'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchBusiness()
})

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0)
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white p-8 sm:p-10 rounded-xl border border-primary-base/40 shadow-xs w-full max-w-4xl mx-auto font-inter my-8 text-left">
      
      <!-- LOADING STATE -->
      <div v-if="isLoading" class="py-16 flex flex-col items-center justify-center gap-3">
        <RefreshCw class="w-8 h-8 text-primary-base animate-spin" />
        <p class="text-sm text-[#52605D]">Memuat profil bisnis Anda...</p>
      </div>

      <!-- FORBIDDEN (403) STATE -->
      <div v-else-if="isForbidden" class="py-10 text-center space-y-4 max-w-md mx-auto">
        <div class="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert class="w-8 h-8" />
        </div>
        <div>
          <span class="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full mb-2">
            Peran Dalam Peninjauan Admin (Under Review)
          </span>
          <h3 class="text-xl font-bold text-neutral-primary font-newsreader">
            Akses Peran Peminjam Membutuhkan Persetujuan
          </h3>
          <p class="text-xs text-[#52605D] mt-2 leading-relaxed">
            Pengajuan peran Peminjam Modal Anda sedang diverifikasi oleh Tim Admin. Silakan periksa status terbaru pengajuan peran Anda.
          </p>
        </div>
        <div class="pt-2 flex flex-col gap-2">
          <button
            @click="router.push('/role-status')"
            class="w-full py-2.5 bg-primary-base hover:bg-[#0A5744] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cek Status Pengajuan Peran
          </button>
        </div>
      </div>

      <!-- NOT FOUND (404) STATE -->
      <div v-else-if="isNotFound" class="py-10 text-center space-y-4 max-w-md mx-auto">
        <div class="w-16 h-16 bg-[#E1F5EE] text-primary-base rounded-full flex items-center justify-center mx-auto">
          <Store class="w-8 h-8" />
        </div>
        <div>
          <h3 class="text-xl font-bold text-neutral-primary font-newsreader">
            Belum Ada Profil Bisnis
          </h3>
          <p class="text-xs text-[#52605D] mt-2 leading-relaxed">
            Anda belum mendaftarkan profil usaha. Buat profil usaha Anda sekarang untuk mengaktifkan limit pinjaman modal.
          </p>
        </div>
        <div class="pt-2">
          <button
            @click="router.push('/business/wizard')"
            class="px-5 py-2.5 bg-primary-base hover:bg-[#0A5744] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            + Buat Profil Bisnis Baru
          </button>
        </div>
      </div>

      <!-- GENERIC ERROR STATE -->
      <div v-else-if="errorMessage" class="py-8 text-center space-y-3">
        <div class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-center gap-2">
          <AlertCircle class="w-5 h-5 shrink-0 text-red-600" />
          <span>{{ errorMessage }}</span>
        </div>
        <button @click="fetchBusiness" class="px-4 py-2 bg-primary-base text-white text-xs font-semibold rounded-lg">
          Coba Lagi
        </button>
      </div>

      <!-- SUCCESSFUL BUSINESS DATA DISPLAY -->
      <div v-else-if="business" class="space-y-8">
        <!-- Business Header Banner -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-xl bg-[#D7EAE3] text-primary-base flex items-center justify-center shrink-0">
              <Store class="w-8 h-8" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-2xl font-bold text-neutral-primary font-newsreader">{{ business.business_name }}</h2>
                <span :class="['px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize', business.business_type === 'starter' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800']">
                  {{ business.business_type === 'starter' ? 'Modal Rintisan' : 'Usaha Berjalan' }}
                </span>
              </div>
              <p class="text-xs text-[#52605D] flex items-center gap-1 mt-1">
                <MapPin class="w-3.5 h-3.5" />
                <span>{{ business.location_address }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="router.push('/financial-records')"
              class="px-4 py-2.5 bg-primary-base hover:bg-[#0A5744] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle class="w-4 h-4" />
              <span>Input Catatan Keuangan</span>
            </button>
          </div>
        </div>

        <!-- Limit & Trust Score Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-5 bg-[#D7EAE3]/40 border border-primary-base/30 rounded-xl space-y-1">
            <span class="text-xs font-medium text-[#52605D]">Limit Pinjaman Saat Ini:</span>
            <div class="text-2xl font-bold text-primary-base font-mono">
              {{ formatRupiah(business.current_borrowing_limit) }}
            </div>
            <p class="text-[11px] text-[#52605D] pt-1">
              Dapat ditingkatkan dengan rajin input catatan keuangan bulanan.
            </p>
          </div>

          <div class="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            <span class="text-xs font-medium text-[#52605D]">Skor Kepercayaan (Trust Score):</span>
            <div class="text-2xl font-bold text-neutral-primary font-mono">
              {{ business.trust_score }} / 100
            </div>
            <p class="text-[11px] text-[#52605D] pt-1">
              Berdasarkan riwayat transaksi & verifikasi.
            </p>
          </div>

          <div class="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            <span class="text-xs font-medium text-[#52605D]">Status Verifikasi:</span>
            <div class="flex items-center gap-1.5 pt-1">
              <CheckCircle2 v-if="business.verification_status === 'verified'" class="w-5 h-5 text-primary-base" />
              <ShieldAlert v-else class="w-5 h-5 text-amber-600" />
              <span class="text-base font-bold text-neutral-primary capitalize">{{ business.verification_status }}</span>
            </div>
            <p class="text-[11px] text-[#52605D]">
              {{ business.verification_status === 'verified' ? 'Profil telah diverifikasi admin.' : 'Menunggu peninjauan lapangan oleh Verifikator.' }}
            </p>
          </div>
        </div>

        <!-- Description Box -->
        <div class="p-6 bg-[#F9FAFB] rounded-xl border border-gray-200 space-y-2">
          <h3 class="font-semibold text-sm text-neutral-primary">Deskripsi Profil Usaha</h3>
          <p class="text-sm text-[#52605D] leading-relaxed">{{ business.description }}</p>
        </div>

      </div>
    </div>
  </AuthLayout>
</template>
