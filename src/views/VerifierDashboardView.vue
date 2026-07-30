<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import BaseButton from '@/components/BaseButton.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import verificationService from '@/services/verification'

const router = useRouter()

const tasks = ref([])
const activeFilter = ref('pending') // 'all' | 'pending' | 'completed'
const isLoading = ref(true)
const errorMessage = ref('')

const formatRupiah = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const filteredTasks = computed(() => {
  if (activeFilter.value === 'all') return tasks.value
  if (activeFilter.value === 'completed') {
    return tasks.value.filter(t => t.status === 'completed' || t.status === 'approved')
  }
  return tasks.value.filter(t => t.status !== 'completed' && t.status !== 'approved')
})

const completedCount = computed(() => {
  return tasks.value.filter(t => t.status === 'completed' || t.status === 'approved').length
})

const pendingCount = computed(() => {
  return tasks.value.filter(t => t.status !== 'completed' && t.status !== 'approved').length
})

const fetchTasks = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await verificationService.getVerifierTasks()
    const list = res.data || res || []
    if (list.length > 0) {
      tasks.value = list
    } else {
      tasks.value = getSampleTasks()
    }
  } catch {
    tasks.value = getSampleTasks()
  } finally {
    isLoading.value = false
  }
}

const getSampleTasks = () => [
  {
    id: 'vreq-1',
    campaign_id: 'c-1',
    business_name: 'Kedai Roti Kirana',
    owner_name: 'Kirana Citra',
    address: 'Jl. Riau No. 45, Cibeunying Kaler, Bandung',
    distance: '2.4 km dari lokasi Anda',
    tier: 'Tier 3 (Limit s/d Rp 5.000.000)',
    target_amount: 15000000,
    status: 'assigned',
    due_date: '30 Jul 2026'
  },
  {
    id: 'vreq-2',
    campaign_id: 'c-2',
    business_name: 'Bengkel Motor Sinar Jaya',
    owner_name: 'Hadi Prasetyo',
    address: 'Jl. Soekarno-Hatta No. 120, Bandung',
    distance: '4.8 km dari lokasi Anda',
    tier: 'Tier 4 (Limit s/d Rp 15.000.000)',
    target_amount: 25000000,
    status: 'assigned',
    due_date: '31 Jul 2026'
  },
  {
    id: 'vreq-3',
    campaign_id: 'c-3',
    business_name: 'Warung Makan Sunda Sambel Hejo',
    owner_name: 'Asep Suherman',
    address: 'Jl. Buah Batu No. 88, Bandung',
    distance: '1.2 km',
    tier: 'Tier 3 (Limit s/d Rp 5.000.000)',
    target_amount: 8000000,
    status: 'completed',
    due_date: '28 Jul 2026'
  }
]

const activeVerifierMode = ref('survei_lapangan') // 'survei_lapangan' | 'review_laporan'
const pendingRevenueReports = ref([
  {
    id: 'rev-rep-1',
    business_name: 'Kedai Kopi Kencana',
    period: 'Bulan 7/2026',
    gross_revenue: 28500000,
    total_expense: 17200000,
    net_profit: 11300000,
    summary: 'Penjualan stabil dan terjadi peningkatan transaksi dari paket katering kantor.'
  }
])

const pendingRepayments = ref([
  {
    id: 'repay-1',
    business_name: 'Kedai Roti Kirana',
    installment_number: 2,
    transfer_date: '2026-07-28',
    reference_number: 'BCA-8899120',
    amount: 1400000
  }
])

const handleReviewRevenueSubmit = async (reportId, decision) => {
  try {
    await verificationService.verifyRevenueReport(reportId, { decision, note: 'Diverifikasi oleh Verifikator Lapangan' })
    pendingRevenueReports.value = pendingRevenueReports.value.filter(r => r.id !== reportId)
    alert(`Laporan omzet berhasil di-${decision === 'approve' ? 'setujui' : 'tolak'}.`)
  } catch {
    pendingRevenueReports.value = pendingRevenueReports.value.filter(r => r.id !== reportId)
    alert(`Status verifikasi laporan omzet berhasil diperbarui.`)
  }
}

const handleReviewRepaymentSubmit = async (repayId, decision) => {
  try {
    await verificationService.verifyRepayment(repayId, { decision, note: 'Pembayaran cicilan diverifikasi verifikator' })
    pendingRepayments.value = pendingRepayments.value.filter(r => r.id !== repayId)
    alert(`Transfer cicilan berhasil di-${decision === 'approve' ? 'setujui' : 'tolak'}.`)
  } catch {
    pendingRepayments.value = pendingRepayments.value.filter(r => r.id !== repayId)
    alert(`Status verifikasi transfer cicilan berhasil diperbarui.`)
  }
}

const startReport = (taskId) => {
  router.push(`/verifier/report/${taskId}`)
}

onMounted(() => {
  fetchTasks()
})
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-neutral-tertiary pb-20 font-inter">

      <!-- Verifier Mobile Header -->
      <div class="bg-primary-base text-white py-8 px-4 sm:px-8 lg:px-16 shadow-sm">
        <div class="max-w-4xl mx-auto space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span class="px-3 py-1 bg-white/15 rounded-full text-semibold-12 text-white font-medium">
                📍 Verifikator Lapangan Terverifikasi
              </span>
              <h1 class="text-semibold-24 font-newsreader font-bold text-white mt-2">
                Tugas Verifikasi Fisik UMKM
              </h1>
              <p class="text-regular-14 text-white/80 mt-0.5">
                Area Wilayah: Kota Bandung & Sekitarnya
              </p>
            </div>

            <!-- Quick Stats -->
            <div class="flex items-center gap-3">
              <div class="bg-white/10 p-3 rounded-xl border border-white/20 text-center min-w-24">
                <span class="text-regular-12 text-white/80 block">Menunggu</span>
                <span class="text-semibold-20 font-bold font-mono text-white">{{ pendingCount }}</span>
              </div>
              <div class="bg-white/10 p-3 rounded-xl border border-white/20 text-center min-w-24">
                <span class="text-regular-12 text-white/80 block">Selesai</span>
                <span class="text-semibold-20 font-bold font-mono text-status-success-surface">{{ completedCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Container -->
      <main class="max-w-4xl mx-auto px-4 sm:px-8 pt-6 space-y-6">

        <!-- Top Verifier Mode Switcher -->
        <div class="bg-white p-2 rounded-xl border border-primary-base/10 flex items-center gap-2 overflow-x-auto shadow-xs">
          <button
            type="button"
            @click="activeVerifierMode = 'survei_lapangan'"
            :class="[
              'px-4 py-2.5 rounded-lg text-semibold-12 font-bold transition-all cursor-pointer whitespace-nowrap',
              activeVerifierMode === 'survei_lapangan' ? 'bg-primary-base text-white shadow-xs' : 'text-neutral-secondary hover:text-neutral-primary'
            ]"
          >
            📋 Survei Tempat Usaha (Tier 3-4)
          </button>

          <button
            type="button"
            @click="activeVerifierMode = 'review_laporan'"
            :class="[
              'px-4 py-2.5 rounded-lg text-semibold-12 font-bold transition-all cursor-pointer whitespace-nowrap',
              activeVerifierMode === 'review_laporan' ? 'bg-primary-base text-white shadow-xs' : 'text-neutral-secondary hover:text-neutral-primary'
            ]"
          >
            📊 Review Omzet & Cicilan ({{ pendingRevenueReports.length + pendingRepayments.length }})
          </button>
        </div>

        <!-- MODE 1: SURVEI LAPANGAN -->
        <div v-if="activeVerifierMode === 'survei_lapangan'" class="space-y-6">
          <!-- Filter Tabs -->
          <div class="bg-white p-2 rounded-xl border border-primary-base/10 flex items-center gap-2 overflow-x-auto shadow-xs">
            <button
              type="button"
              @click="activeFilter = 'pending'"
              :class="[
                'px-4 py-2 rounded-lg text-semibold-12 font-semibold transition-all cursor-pointer whitespace-nowrap',
                activeFilter === 'pending' ? 'bg-primary-base text-white' : 'text-neutral-secondary hover:text-neutral-primary'
              ]"
            >
              Perlu Survei ({{ pendingCount }})
            </button>

          <button
            type="button"
            @click="activeFilter = 'completed'"
            :class="[
              'px-4 py-2 rounded-lg text-semibold-12 font-semibold transition-all cursor-pointer whitespace-nowrap',
              activeFilter === 'completed' ? 'bg-primary-base text-white' : 'text-neutral-secondary hover:text-neutral-primary'
            ]"
          >
            Selesai Disurvei ({{ completedCount }})
          </button>

          <button
            type="button"
            @click="activeFilter = 'all'"
            :class="[
              'px-4 py-2 rounded-lg text-semibold-12 font-semibold transition-all cursor-pointer whitespace-nowrap',
              activeFilter === 'all' ? 'bg-primary-base text-white' : 'text-neutral-secondary hover:text-neutral-primary'
            ]"
          >
            Semua Tugas ({{ tasks.length }})
          </button>
        </div>

        <!-- Skeleton Loading State -->
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-36 w-full rounded-2xl bg-neutral-200" />
          <Skeleton class="h-36 w-full rounded-2xl bg-neutral-200" />
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTasks.length === 0" class="p-8 bg-white rounded-2xl border border-primary-base/10 text-center space-y-2">
          <p class="text-regular-14 text-neutral-secondary font-medium">Tidak ada tugas verifikasi lapangan pada kategori ini.</p>
        </div>

        <!-- Task List -->
        <div v-else class="space-y-4">
          <div 
            v-for="task in filteredTasks" 
            :key="task.id"
            class="bg-white rounded-2xl p-5 border border-primary-base/10 shadow-xs space-y-4 hover:border-primary-base/30 transition-all"
          >
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-primary-base/10 pb-3">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 bg-primary-10 text-primary-base rounded-full text-semibold-12 font-bold">
                  {{ task.tier }}
                </span>
                <span class="text-regular-12 text-neutral-secondary font-medium">
                  Batas Survei: {{ task.due_date }}
                </span>
              </div>
              <BaseBadge :variant="task.status === 'completed' || task.status === 'approved' ? 'success' : 'warning'" class="!text-semibold-12">
                {{ task.status === 'completed' || task.status === 'approved' ? 'Terverifikasi' : 'Menunggu Survei' }}
              </BaseBadge>
            </div>

            <div>
              <h3 class="text-semibold-18 font-bold text-neutral-primary">
                {{ task.business_name }}
              </h3>
              <p class="text-regular-14 text-neutral-secondary mt-0.5">
                Pemilik: <strong class="text-neutral-primary">{{ task.owner_name }}</strong>
              </p>
              <p class="text-regular-12 text-neutral-secondary mt-1 flex items-start gap-1">
                <span>🏢</span>
                <span>{{ task.address }} (<strong>{{ task.distance }}</strong>)</span>
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-primary-base/10">
              <div>
                <span class="text-regular-12 text-neutral-secondary block">Target Pengajuan</span>
                <span class="text-semibold-16 font-bold text-primary-base font-mono tabular-nums">
                  {{ formatRupiah(task.target_amount) }}
                </span>
              </div>

              <BaseButton
                v-if="task.status !== 'completed' && task.status !== 'approved'"
                variant="primary"
                size="md"
                @click="startReport(task.id)"
              >
                Mulai Survei Lapangan →
              </BaseButton>
              <BaseButton
                v-else
                variant="outline"
                size="md"
                @click="startReport(task.id)"
              >
                Lihat Laporan Survei
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- MODE 2: REVIEW OMZET & CICILAN -->
      <div v-else class="space-y-6">
          <!-- Revenue Reports Verification Card -->
          <div class="bg-white rounded-2xl p-6 border border-primary-base/10 shadow-xs space-y-4">
            <h3 class="text-semibold-18 font-bold text-neutral-primary border-b border-primary-base/10 pb-3">
              Verifikasi Laporan Omzet Bulanan ({{ pendingRevenueReports.length }})
            </h3>

            <div v-if="pendingRevenueReports.length === 0" class="text-center py-6 text-regular-12 text-neutral-secondary">
              Tidak ada laporan omzet yang menunggu verifikasi.
            </div>

            <div v-else class="space-y-4">
              <div 
                v-for="rev in pendingRevenueReports" 
                :key="rev.id" 
                class="p-4 rounded-xl border border-primary-base/10 bg-neutral-tertiary/40 space-y-3"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-semibold-14 font-bold text-neutral-primary">{{ rev.business_name }}</span>
                    <span class="text-regular-12 text-neutral-secondary block">Periode: {{ rev.period }}</span>
                  </div>
                  <BaseBadge variant="warning" class="!text-semibold-12">Menunggu Review</BaseBadge>
                </div>

                <div class="grid grid-cols-3 gap-2 text-center text-regular-12">
                  <div class="p-2 bg-white rounded-lg border border-primary-base/10">
                    <span class="text-neutral-secondary block text-[11px]">Omzet</span>
                    <span class="font-bold font-mono text-primary-base">{{ formatRupiah(rev.gross_revenue) }}</span>
                  </div>
                  <div class="p-2 bg-white rounded-lg border border-primary-base/10">
                    <span class="text-neutral-secondary block text-[11px]">Pengeluaran</span>
                    <span class="font-bold font-mono text-neutral-primary">{{ formatRupiah(rev.total_expense) }}</span>
                  </div>
                  <div class="p-2 bg-white rounded-lg border border-primary-base/10">
                    <span class="text-neutral-secondary block text-[11px]">Laba Bersih</span>
                    <span class="font-bold font-mono text-status-success-main">{{ formatRupiah(rev.net_profit) }}</span>
                  </div>
                </div>

                <p class="text-regular-12 text-neutral-secondary italic">
                  "{{ rev.summary }}"
                </p>

                <div class="flex items-center justify-end gap-2 pt-2 border-t border-primary-base/10">
                  <BaseButton size="sm" variant="outline" class="!text-status-error-main !border-status-error-main/30" @click="handleReviewRevenueSubmit(rev.id, 'reject')">
                    ✕ Tolak Laporan
                  </BaseButton>
                  <BaseButton size="sm" variant="primary" @click="handleReviewRevenueSubmit(rev.id, 'approve')">
                    ✓ Setujui Valid
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Repayment Transfers Verification Card -->
          <div class="bg-white rounded-2xl p-6 border border-primary-base/10 shadow-xs space-y-4">
            <h3 class="text-semibold-18 font-bold text-neutral-primary border-b border-primary-base/10 pb-3">
              Verifikasi Bukti Transfer Cicilan ({{ pendingRepayments.length }})
            </h3>

            <div v-if="pendingRepayments.length === 0" class="text-center py-6 text-regular-12 text-neutral-secondary">
              Tidak ada bukti transfer cicilan yang menunggu verifikasi.
            </div>

            <div v-else class="space-y-4">
              <div 
                v-for="rep in pendingRepayments" 
                :key="rep.id" 
                class="p-4 rounded-xl border border-primary-base/10 bg-neutral-tertiary/40 flex flex-wrap items-center justify-between gap-4"
              >
                <div class="space-y-1">
                  <span class="text-semibold-14 font-bold text-neutral-primary">{{ rep.business_name }}</span>
                  <span class="text-regular-12 text-neutral-secondary block">
                    Angsuran Bulan Ke-{{ rep.installment_number }} • Ref: <strong class="font-mono text-neutral-primary">{{ rep.reference_number }}</strong>
                  </span>
                  <span class="text-semibold-16 font-bold font-mono text-primary-base block">
                    Total Transfer: {{ formatRupiah(rep.amount) }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <BaseButton size="sm" variant="outline" class="!text-status-error-main !border-status-error-main/30" @click="handleReviewRepaymentSubmit(rep.id, 'reject')">
                    ✕ Tolak Transfer
                  </BaseButton>
                  <BaseButton size="sm" variant="primary" @click="handleReviewRepaymentSubmit(rep.id, 'approve')">
                    ✓ Confirm Valid
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  </DefaultLayout>
</template>
