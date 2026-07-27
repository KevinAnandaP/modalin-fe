<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { businessService } from '@/services/business'
import { Store, MapPin, CheckCircle2, ShieldAlert, PlusCircle, RefreshCw, FileText } from '@lucide/vue'

const router = useRouter()

const isLoading = ref(true)
const business = ref(null)
const errorMessage = ref('')

const fetchBusiness = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await businessService.getMyBusiness()
    business.value = res?.data || null
  } catch (err) {
    if (err?.status === 404) {
      router.push('/business/wizard')
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
    <div class="bg-white p-8 sm:p-10 rounded-xl border border-[#0F6E56]/40 shadow-xs w-full max-w-4xl mx-auto font-inter my-8 text-left">
      
      <div v-if="isLoading" class="py-16 flex flex-col items-center justify-center gap-3">
        <RefreshCw class="w-8 h-8 text-[#0F6E56] animate-spin" />
        <p class="text-sm text-[#52605D]">Memuat profil bisnis Anda...</p>
      </div>

      <div v-else-if="business" class="space-y-8">
        <!-- Business Header Banner -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-xl bg-[#D7EAE3] text-[#0F6E56] flex items-center justify-center shrink-0">
              <Store class="w-8 h-8" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-2xl font-bold text-[#1F2937] font-newsreader">{{ business.business_name }}</h2>
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
              class="px-4 py-2.5 bg-[#0F6E56] hover:bg-[#0A5744] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle class="w-4 h-4" />
              <span>Input Catatan Keuangan</span>
            </button>
          </div>
        </div>

        <!-- Limit & Trust Score Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-5 bg-[#D7EAE3]/40 border border-[#0F6E56]/30 rounded-xl space-y-1">
            <span class="text-xs font-medium text-[#52605D]">Limit Pinjaman Saat Ini:</span>
            <div class="text-2xl font-bold text-[#0F6E56] font-mono">
              {{ formatRupiah(business.current_borrowing_limit) }}
            </div>
            <p class="text-[11px] text-[#52605D] pt-1">
              Dapat ditingkatkan dengan rajin input catatan keuangan bulanan.
            </p>
          </div>

          <div class="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            <span class="text-xs font-medium text-[#52605D]">Skor Kepercayaan (Trust Score):</span>
            <div class="text-2xl font-bold text-[#1F2937] font-mono">
              {{ business.trust_score }} / 100
            </div>
            <p class="text-[11px] text-[#52605D] pt-1">
              Berdasarkan riwayat transaksi & verifikasi.
            </p>
          </div>

          <div class="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            <span class="text-xs font-medium text-[#52605D]">Status Verifikasi:</span>
            <div class="flex items-center gap-1.5 pt-1">
              <CheckCircle2 v-if="business.verification_status === 'verified'" class="w-5 h-5 text-[#0F6E56]" />
              <ShieldAlert v-else class="w-5 h-5 text-amber-600" />
              <span class="text-base font-bold text-[#1F2937] capitalize">{{ business.verification_status }}</span>
            </div>
            <p class="text-[11px] text-[#52605D]">
              {{ business.verification_status === 'verified' ? 'Profil telah diverifikasi admin.' : 'Menunggu peninjauan lapangan oleh Verifikator.' }}
            </p>
          </div>
        </div>

        <!-- Description Box -->
        <div class="p-6 bg-[#F9FAFB] rounded-xl border border-gray-200 space-y-2">
          <h3 class="font-semibold text-sm text-[#1F2937]">Deskripsi Profil Usaha</h3>
          <p class="text-sm text-[#52605D] leading-relaxed">{{ business.description }}</p>
        </div>

      </div>
    </div>
  </AuthLayout>
</template>
