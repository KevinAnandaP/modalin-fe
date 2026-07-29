<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { authService } from '@/services/auth'
import { Clock, CheckCircle2, RefreshCw, ShieldCheck, Store, Coins } from '@lucide/vue'

const router = useRouter()

const isLoading = ref(true)
const profile = ref(null)
const roles = ref([])
const statusState = ref('pending') // 'pending' | 'approved' | 'rejected'

const fetchStatus = async () => {
  isLoading.value = true
  try {
    const res = await authService.getProfile()
    profile.value = res?.data?.user || null
    roles.value = res?.data?.roles || []

    if (roles.value.length > 0) {
      statusState.value = 'approved'
    } else {
      statusState.value = 'pending'
    }
  } catch {
    router.push('/login')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStatus()
})

const handleNextAction = (targetRole) => {
  if (targetRole === 'borrower') {
    router.push('/business/wizard')
  } else if (targetRole === 'lender') {
    router.push('/campaigns')
  } else {
    router.push('/')
  }
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white p-8 sm:p-10 rounded-xl border border-primary-base/40 shadow-xs w-full max-w-xl mx-auto font-inter my-8 text-center">
      <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center gap-3">
        <RefreshCw class="w-8 h-8 text-primary-base animate-spin" />
        <p class="text-sm text-[#52605D]">Memuat status pengajuan peran akun...</p>
      </div>

      <div v-else>
        <!-- APPROVED ROLE STATE -->
        <div v-if="statusState === 'approved'" class="space-y-6">
          <div class="w-16 h-16 bg-[#E1F5EE] text-primary-base rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 class="w-10 h-10" />
          </div>
          <div>
            <span class="inline-block px-3 py-1 bg-[#E1F5EE] text-primary-base text-xs font-semibold rounded-full mb-3">
              Peran Disetujui (Approved)
            </span>
            <h2 class="text-2xl font-semibold text-neutral-primary font-newsreader">
              Status Peran Akun Anda Aktif
            </h2>
            <p class="text-sm text-[#52605D] mt-2">
              Akun Anda telah disetujui untuk peran: <span class="font-semibold text-neutral-primary capitalize">{{ roles.join(', ') }}</span>.
            </p>
          </div>

          <!-- Role Action Cards based on active roles -->
          <div class="space-y-3 pt-2 text-left">
            <div v-if="roles.includes('borrower')" class="p-4 bg-[#F9FAFB] rounded-lg border border-gray-200 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Store class="w-5 h-5 text-primary-base" />
                <div>
                  <h4 class="font-semibold text-sm text-neutral-primary">Peran Peminjam (UMKM)</h4>
                  <p class="text-xs text-[#52605D]">Buat profil usaha & ajukan modal usaha/rintisan</p>
                </div>
              </div>
              <button
                @click="handleNextAction('borrower')"
                class="px-3.5 py-2 bg-primary-base text-white text-xs font-semibold rounded-lg hover:bg-[#0A5744] transition-colors cursor-pointer"
              >
                Isi Profil Bisnis
              </button>
            </div>

            <div v-if="roles.includes('lender')" class="p-4 bg-[#F9FAFB] rounded-lg border border-gray-200 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Coins class="w-5 h-5 text-primary-base" />
                <div>
                  <h4 class="font-semibold text-sm text-neutral-primary">Peran Pemberi Modal</h4>
                  <p class="text-xs text-[#52605D]">Jelajahi katalog & danai kampanye usaha</p>
                </div>
              </div>
              <button
                @click="handleNextAction('lender')"
                class="px-3.5 py-2 bg-primary-base text-white text-xs font-semibold rounded-lg hover:bg-[#0A5744] transition-colors cursor-pointer"
              >
                Lihat Katalog
              </button>
            </div>

            <div v-if="roles.includes('verifier')" class="p-4 bg-[#F9FAFB] rounded-lg border border-gray-200 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <ShieldCheck class="w-5 h-5 text-primary-base" />
                <div>
                  <h4 class="font-semibold text-sm text-neutral-primary">Peran Verifikator</h4>
                  <p class="text-xs text-[#52605D]">Lihat daftar tugas verifikasi lapangan</p>
                </div>
              </div>
              <button
                @click="handleNextAction('verifier')"
                class="px-3.5 py-2 bg-primary-base text-white text-xs font-semibold rounded-lg hover:bg-[#0A5744] transition-colors cursor-pointer"
              >
                Area Verifikator
              </button>
            </div>
          </div>

          <div class="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#52605D]">
            <span>Ingin mengajukan peran tambahan?</span>
            <button @click="router.push('/request-role')" class="text-primary-base font-semibold hover:underline cursor-pointer">
              + Ajukan Peran Lain
            </button>
          </div>
        </div>

        <!-- PENDING STATE (Diajukan -> Ditinjau Admin) -->
        <div v-else-if="statusState === 'pending'" class="space-y-6">
          <div class="w-16 h-16 bg-[#FEF3C7] text-secondary-base rounded-full flex items-center justify-center mx-auto">
            <Clock class="w-10 h-10 animate-pulse" />
          </div>
          <div>
            <span class="inline-block px-3 py-1 bg-[#FEF3C7] text-secondary-base text-xs font-semibold rounded-full mb-3">
              Diajukan ➔ Ditinjau Admin (Under Review)
            </span>
            <h2 class="text-2xl font-semibold text-neutral-primary font-newsreader">
              Pengajuan Peran Sedang Ditinjau Admin
            </h2>
            <p class="text-sm text-[#52605D] mt-2">
              Tim Admin Modalin sedang melakukan verifikasi data profil & dokumen pengajuan Anda.
            </p>
          </div>

          <div class="p-4 bg-[#F9FAFB] rounded-lg border border-gray-200 text-left text-xs text-[#52605D] space-y-1">
            <span class="font-semibold text-neutral-primary block">Tahapan Alur Pengajuan:</span>
            <p>1. Pendaftaran Akun (Selesai)</p>
            <p class="text-secondary-base font-medium">2. Pengajuan Role (Sedang Ditinjau Admin)</p>
            <p class="text-gray-400">3. Persetujuan & Akses Fitur Penuh (Menunggu)</p>
          </div>

          <div class="pt-2 flex flex-col gap-3">
            <button
              @click="fetchStatus"
              class="w-full py-3 bg-primary-base hover:bg-[#0A5744] text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <RefreshCw class="w-4 h-4" />
              <span>Cek Status Terbaru</span>
            </button>
            <button
              @click="authService.logout(); router.push('/login')"
              class="w-full py-2.5 border border-gray-300 text-[#52605D] hover:text-neutral-primary font-medium text-sm rounded-lg transition-colors cursor-pointer"
            >
              Keluar Akun
            </button>
          </div>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
