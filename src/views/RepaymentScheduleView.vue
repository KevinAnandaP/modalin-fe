<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import BaseButton from '@/components/BaseButton.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import RepaymentModal from '@/components/RepaymentModal.vue'
import campaignService from '@/services/campaign'

const route = useRoute()
const campaignId = route.params.id || 'c-1'

const schedules = ref([])
const campaignDetail = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

const isPaymentModalOpen = ref(false)
const selectedSchedule = ref(null)

const formatRupiah = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const totalLoanAmount = computed(() => {
  return campaignDetail.value?.target_amount || 15000000
})

const paidAmount = computed(() => {
  return schedules.value
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + (s.total_amount || 0), 0)
})

const remainingAmount = computed(() => {
  return schedules.value
    .filter(s => s.status !== 'paid')
    .reduce((sum, s) => sum + (s.total_amount || 0), 0)
})

const fetchSchedules = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    try {
      const res = await campaignService.getRepaymentSchedules(campaignId)
      const list = res.data || res || []
      schedules.value = list.length > 0 ? list : getSampleSchedules()
    } catch {
      schedules.value = getSampleSchedules()
    }

    campaignDetail.value = {
      id: campaignId,
      title: 'Pengadaan Mesin Roasting Kopi Kencana',
      target_amount: 15000000,
      tenor_months: 12,
      interest_rate: 12
    }
  } catch (err) {
    errorMessage.value = err.message || 'Gagal memuat jadwal cicilan.'
  } finally {
    isLoading.value = false
  }
}

const getSampleSchedules = () => [
  {
    id: 'sch-1',
    installment_number: 1,
    due_date: '15 Agu 2026',
    principal_amount: 1250000,
    interest_amount: 150000,
    total_amount: 1400000,
    status: 'paid'
  },
  {
    id: 'sch-2',
    installment_number: 2,
    due_date: '15 Sep 2026',
    principal_amount: 1250000,
    interest_amount: 150000,
    total_amount: 1400000,
    status: 'due'
  },
  {
    id: 'sch-3',
    installment_number: 3,
    due_date: '15 Okt 2026',
    principal_amount: 1250000,
    interest_amount: 150000,
    total_amount: 1400000,
    status: 'upcoming'
  },
  {
    id: 'sch-4',
    installment_number: 4,
    due_date: '15 Nov 2026',
    principal_amount: 1250000,
    interest_amount: 150000,
    total_amount: 1400000,
    status: 'upcoming'
  }
]

const handleOpenPayment = (sch) => {
  selectedSchedule.value = sch
  isPaymentModalOpen.value = true
}

const handlePaymentSuccess = ({ installmentNumber }) => {
  const target = schedules.value.find(s => s.installment_number === installmentNumber)
  if (target) {
    target.status = 'pending_review'
  }
}

onMounted(() => {
  fetchSchedules()
})
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-neutral-tertiary pb-20 font-inter">

      <!-- Header Banner -->
      <div class="bg-primary-base text-white py-8 px-4 sm:px-8 lg:px-16 shadow-sm">
        <div class="max-w-6xl mx-auto space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span class="px-3 py-1 bg-white/15 rounded-full text-semibold-12 text-white font-medium">
                🏦 Tagihan & Cicilan Borrower
              </span>
              <h1 class="text-semibold-32 font-newsreader font-bold text-white mt-2">
                Jadwal & Pembayaran Angsuran
              </h1>
              <p class="text-regular-14 text-white/80 mt-0.5">
                Campaign: <strong>{{ campaignDetail?.title || 'Campaign Modalin' }}</strong>
              </p>
            </div>

            <RouterLink to="/business/detail">
              <BaseButton variant="secondary" size="md">
                ← Kembali ke Profil Usaha
              </BaseButton>
            </RouterLink>
          </div>

          <!-- Summary Stats Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div class="bg-white/10 p-4 rounded-xl border border-white/20">
              <span class="text-regular-12 text-white/80 block">Total Plafon Pinjaman</span>
              <span class="text-semibold-20 font-bold font-mono text-white tabular-nums">
                {{ formatRupiah(totalLoanAmount) }}
              </span>
            </div>

            <div class="bg-white/10 p-4 rounded-xl border border-white/20">
              <span class="text-regular-12 text-white/80 block">Angsuran Sudah Lunas</span>
              <span class="text-semibold-20 font-bold font-mono text-status-success-surface tabular-nums">
                {{ formatRupiah(paidAmount) }}
              </span>
            </div>

            <div class="bg-white/10 p-4 rounded-xl border border-white/20">
              <span class="text-regular-12 text-white/80 block">Sisa Angsuran Tagihan</span>
              <span class="text-semibold-20 font-bold font-mono text-white tabular-nums">
                {{ formatRupiah(remainingAmount) }}
              </span>
            </div>

            <div class="bg-white/10 p-4 rounded-xl border border-white/20">
              <span class="text-regular-12 text-white/80 block">Status Performa</span>
              <span class="text-semibold-16 font-bold text-status-success-surface block mt-1">
                ✓ Sangat Lancar
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Container -->
      <main class="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 pt-8 space-y-6">

        <!-- Skeleton Loading -->
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-32 w-full rounded-2xl bg-neutral-200" />
          <Skeleton class="h-32 w-full rounded-2xl bg-neutral-200" />
        </div>

        <!-- Schedule Table Card -->
        <div v-else class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 shadow-xs space-y-6">
          <div class="flex items-center justify-between border-b border-primary-base/10 pb-4">
            <div>
              <h3 class="text-semibold-18 font-bold text-neutral-primary">
                Tabel Jadwal Angsuran Bulanan (Tenor {{ campaignDetail?.tenor_months || 12 }} Bulan)
              </h3>
              <p class="text-regular-12 text-neutral-secondary">
                Lakukan pembayaran sebelum tanggal jatuh tempo untuk menjaga skor risiko tetap rendah.
              </p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-regular-14">
              <thead>
                <tr class="border-b border-primary-base/10 text-neutral-secondary text-semibold-12">
                  <th class="p-3 text-center">Angsuran Ke-</th>
                  <th class="p-3 font-mono text-center">Jatuh Tempo</th>
                  <th class="p-3 text-right">Pokok Pinjaman</th>
                  <th class="p-3 text-right">Imbal Hasil (Margin)</th>
                  <th class="p-3 text-right">Total Tagihan</th>
                  <th class="p-3 text-center">Status</th>
                  <th class="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-primary-base/5">
                <tr v-for="sch in schedules" :key="sch.id" class="hover:bg-neutral-tertiary/40">
                  <td class="p-3 text-center font-bold text-neutral-primary font-mono">
                    Bulan {{ sch.installment_number }}
                  </td>
                  <td class="p-3 text-center font-mono text-regular-12 text-neutral-secondary">
                    {{ sch.due_date }}
                  </td>
                  <td class="p-3 text-right font-mono text-neutral-primary">
                    {{ formatRupiah(sch.principal_amount) }}
                  </td>
                  <td class="p-3 text-right font-mono text-secondary-base">
                    {{ formatRupiah(sch.interest_amount) }}
                  </td>
                  <td class="p-3 text-right font-bold font-mono text-primary-base">
                    {{ formatRupiah(sch.total_amount) }}
                  </td>
                  <td class="p-3 text-center">
                    <BaseBadge 
                      :variant="
                        sch.status === 'paid' ? 'success' :
                        sch.status === 'pending_review' ? 'warning' :
                        sch.status === 'due' ? 'error' : 'outline'
                      "
                      class="!text-semibold-12 capitalize"
                    >
                      {{ 
                        sch.status === 'paid' ? 'Lunas' :
                        sch.status === 'pending_review' ? 'Review Verifikator' :
                        sch.status === 'due' ? 'Perlu Dibayar' : 'Belum Jatuh Tempo'
                      }}
                    </BaseBadge>
                  </td>
                  <td class="p-3 text-center">
                    <BaseButton
                      v-if="sch.status === 'due' || sch.status === 'upcoming'"
                      size="sm"
                      variant="primary"
                      @click="handleOpenPayment(sch)"
                    >
                      Bayar Cicilan
                    </BaseButton>
                    <span v-else-if="sch.status === 'pending_review'" class="text-semibold-12 text-secondary-base italic font-medium">
                      Menunggu Review
                    </span>
                    <span v-else class="text-semibold-12 text-status-success-main font-bold">
                      ✓ Paid
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <!-- Repayment Modal -->
      <RepaymentModal
        :is-open="isPaymentModalOpen"
        :campaign-id="campaignId"
        :schedule="selectedSchedule"
        @close="isPaymentModalOpen = false"
        @success="handlePaymentSuccess"
      />
    </div>
  </DefaultLayout>
</template>
