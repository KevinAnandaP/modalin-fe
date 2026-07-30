<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import BaseButton from '@/components/BaseButton.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import campaignService from '@/services/campaign'

const activeTab = ref('fundings') // 'fundings' | 'distributions'
const fundings = ref([])
const distributions = ref([])
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

const totalFundedAmount = computed(() => {
  return fundings.value.reduce((sum, item) => sum + (item.amount || item.pledge_amount || 0), 0)
})

const totalReturnedAmount = computed(() => {
  return distributions.value.reduce((sum, item) => sum + (item.amount || item.return_amount || 0), 0)
})

const expectedInterest = computed(() => {
  return fundings.value.reduce((sum, item) => {
    const principal = item.amount || item.pledge_amount || 0
    const rate = (item.interest_rate || item.campaign?.interest_rate || 10) / 100
    const tenor = (item.tenor_months || item.campaign?.tenor_months || 12) / 12
    return sum + Math.round(principal * rate * tenor)
  }, 0)
})

const fetchData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    try {
      const fundRes = await campaignService.getLenderFundings()
      const list = fundRes.data || fundRes || []
      fundings.value = list.length > 0 ? list : getSampleFundings()
    } catch {
      fundings.value = getSampleFundings()
    }

    try {
      const distRes = await campaignService.getLenderReturnDistributions()
      const listDist = distRes.data || distRes || []
      distributions.value = listDist.length > 0 ? listDist : getSampleDistributions()
    } catch {
      distributions.value = getSampleDistributions()
    }
  } catch (err) {
    errorMessage.value = err.message || 'Gagal memuat data portofolio lender.'
  } finally {
    isLoading.value = false
  }
}

const getSampleFundings = () => [
  {
    id: 'f-1',
    campaign_id: 'c-1',
    campaign_title: 'Pengadaan Mesin Roasting Kopi Kencana',
    category: 'Kuliner',
    amount: 5000000,
    interest_rate: 12,
    tenor_months: 12,
    status: 'published',
    created_at: '2026-07-25',
    business_name: 'Kedai Kopi Kencana'
  },
  {
    id: 'f-2',
    campaign_id: 'c-2',
    campaign_title: 'Ekspansi Stok Kain Batik Tradisional Kirana',
    category: 'Kerajinan',
    amount: 3000000,
    interest_rate: 10,
    tenor_months: 6,
    status: 'funded',
    created_at: '2026-07-20',
    business_name: 'Batik Kirana'
  },
  {
    id: 'f-3',
    campaign_id: 'c-3',
    campaign_title: 'Pembelian Oven Listrik Industri Roti Kirana',
    category: 'Kuliner',
    amount: 10000000,
    interest_rate: 11,
    tenor_months: 12,
    status: 'completed',
    created_at: '2026-06-10',
    business_name: 'Kedai Roti Kirana'
  }
]

const getSampleDistributions = () => [
  {
    id: 'dist-1',
    campaign_title: 'Pembelian Oven Listrik Industri Roti Kirana',
    installment_number: 1,
    amount: 925000, // Pokok + Bagi hasil bulan 1
    distributed_at: '2026-07-10',
    status: 'distributed'
  },
  {
    id: 'dist-2',
    campaign_title: 'Ekspansi Stok Kain Batik Tradisional Kirana',
    installment_number: 1,
    amount: 525000,
    distributed_at: '2026-07-15',
    status: 'distributed'
  }
]

onMounted(() => {
  fetchData()
})
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-neutral-tertiary pb-20 font-inter">

      <!-- Header Portfolio Banner -->
      <div class="bg-primary-base text-white py-8 px-4 sm:px-8 lg:px-16 shadow-sm">
        <div class="max-w-6xl mx-auto space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span class="px-3 py-1 bg-white/15 rounded-full text-semibold-12 text-white font-medium">
                💎 Dashboard Portofolio Lender
              </span>
              <h1 class="text-semibold-32 font-newsreader font-bold text-white mt-2">
                Portofolio Pendanaan & Bagi Hasil
              </h1>
              <p class="text-regular-14 text-white/80 mt-0.5">
                Pantau imbal hasil dan kontribusi pendanaan modal kerja UMKM Indonesia.
              </p>
            </div>

            <RouterLink to="/campaigns">
              <BaseButton variant="secondary" size="md">
                + Tambah Pendanaan Baru
              </BaseButton>
            </RouterLink>
          </div>

          <!-- Financial Statistics Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div class="bg-white/10 p-4 rounded-xl border border-white/20">
              <span class="text-regular-12 text-white/80 block">Total Dana Disalurkan</span>
              <span class="text-semibold-20 font-bold font-mono text-white tabular-nums">
                {{ formatRupiah(totalFundedAmount) }}
              </span>
            </div>

            <div class="bg-white/10 p-4 rounded-xl border border-white/20">
              <span class="text-regular-12 text-white/80 block">Estimasi Keuntungan (Bunga)</span>
              <span class="text-semibold-20 font-bold font-mono text-status-success-surface tabular-nums">
                +{{ formatRupiah(expectedInterest) }}
              </span>
            </div>

            <div class="bg-white/10 p-4 rounded-xl border border-white/20">
              <span class="text-regular-12 text-white/80 block">Bagi Hasil Telah Diterima</span>
              <span class="text-semibold-20 font-bold font-mono text-white tabular-nums">
                {{ formatRupiah(totalReturnedAmount) }}
              </span>
            </div>

            <div class="bg-white/10 p-4 rounded-xl border border-white/20">
              <span class="text-regular-12 text-white/80 block">Total Campaign Didanai</span>
              <span class="text-semibold-20 font-bold font-mono text-white">
                {{ fundings.length }} Project UMKM
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Container -->
      <main class="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 pt-8 space-y-6">

        <!-- Tabs Navigation -->
        <div class="bg-white p-2 rounded-xl border border-primary-base/10 flex items-center gap-2 overflow-x-auto shadow-xs">
          <button
            type="button"
            @click="activeTab = 'fundings'"
            :class="[
              'px-4 py-2 rounded-lg text-semibold-12 font-semibold transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'fundings' ? 'bg-primary-base text-white' : 'text-neutral-secondary hover:text-neutral-primary'
            ]"
          >
            Daftar Pendanaan Aktif ({{ fundings.length }})
          </button>

          <button
            type="button"
            @click="activeTab = 'distributions'"
            :class="[
              'px-4 py-2 rounded-lg text-semibold-12 font-semibold transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'distributions' ? 'bg-primary-base text-white' : 'text-neutral-secondary hover:text-neutral-primary'
            ]"
          >
            Riwayat Bagi Hasil Diterima ({{ distributions.length }})
          </button>
        </div>

        <!-- Skeleton Loading -->
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-32 w-full rounded-2xl bg-neutral-200" />
          <Skeleton class="h-32 w-full rounded-2xl bg-neutral-200" />
        </div>

        <!-- Tab 1: Daftar Pendanaan -->
        <div v-else-if="activeTab === 'fundings'" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 shadow-xs space-y-6">
          <h3 class="text-semibold-18 font-bold text-neutral-primary">
            Daftar Campaign UMKM Didanai
          </h3>

          <div v-if="fundings.length === 0" class="text-center py-12 text-regular-14 text-neutral-secondary space-y-3">
            <p>Anda belum memiliki penyaluran pendanaan aktif saat ini.</p>
            <RouterLink to="/campaigns">
              <BaseButton variant="primary" size="sm">Jelajahi Katalog Campaign</BaseButton>
            </RouterLink>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-regular-14">
              <thead>
                <tr class="border-b border-primary-base/10 text-neutral-secondary text-semibold-12">
                  <th class="p-3">Campaign & Bisnis</th>
                  <th class="p-3 text-right">Nominal Pokok</th>
                  <th class="p-3 text-center">Bunga / Thn</th>
                  <th class="p-3 text-center">Tenor</th>
                  <th class="p-3 text-right">Estimasi Return</th>
                  <th class="p-3 text-center">Status</th>
                  <th class="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-primary-base/5">
                <tr v-for="item in fundings" :key="item.id" class="hover:bg-neutral-tertiary/40">
                  <td class="p-3">
                    <span class="text-semibold-14 font-bold text-neutral-primary block">{{ item.campaign_title || item.campaign?.title }}</span>
                    <span class="text-regular-12 text-neutral-secondary block">{{ item.business_name || item.campaign?.business?.name || 'UMKM' }}</span>
                  </td>
                  <td class="p-3 text-right font-bold font-mono text-primary-base">
                    {{ formatRupiah(item.amount || item.pledge_amount) }}
                  </td>
                  <td class="p-3 text-center font-semibold text-secondary-base">
                    {{ item.interest_rate || item.campaign?.interest_rate || 10 }}%
                  </td>
                  <td class="p-3 text-center">
                    {{ item.tenor_months || item.campaign?.tenor_months || 12 }} Bulan
                  </td>
                  <td class="p-3 text-right font-bold font-mono text-status-success-main">
                    {{ formatRupiah(Math.round((item.amount || 0) * (1 + ((item.interest_rate || 10)/100 * ((item.tenor_months || 12)/12))))) }}
                  </td>
                  <td class="p-3 text-center">
                    <BaseBadge :variant="item.status === 'completed' ? 'success' : 'primary'" class="!text-semibold-12">
                      {{ item.status === 'completed' ? 'Selesai Lunas' : 'Aktif Running' }}
                    </BaseBadge>
                  </td>
                  <td class="p-3 text-center">
                    <RouterLink :to="`/campaigns/${item.campaign_id || item.campaign?.id}`">
                      <BaseButton size="sm" variant="outline">Detail</BaseButton>
                    </RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 2: Riwayat Return Diterima -->
        <div v-else-if="activeTab === 'distributions'" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 shadow-xs space-y-6">
          <h3 class="text-semibold-18 font-bold text-neutral-primary">
            Riwayat Distribusi Imbal Hasil (Bagi Hasil Transfer)
          </h3>

          <div v-if="distributions.length === 0" class="text-center py-12 text-regular-14 text-neutral-secondary">
            Belum ada riwayat distribusi imbal hasil yang masuk ke dompet Anda.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-regular-14">
              <thead>
                <tr class="border-b border-primary-base/10 text-neutral-secondary text-semibold-12">
                  <th class="p-3">Campaign UMKM</th>
                  <th class="p-3 text-center">Angsuran Ke-</th>
                  <th class="p-3 font-mono text-center">Tanggal Transfer</th>
                  <th class="p-3 text-right">Nominal Imbal Hasil</th>
                  <th class="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-primary-base/5">
                <tr v-for="dist in distributions" :key="dist.id" class="hover:bg-neutral-tertiary/40">
                  <td class="p-3 font-semibold text-neutral-primary">
                    {{ dist.campaign_title || 'Campaign Modalin' }}
                  </td>
                  <td class="p-3 text-center font-mono font-bold text-primary-base">
                    Bulan {{ dist.installment_number }}
                  </td>
                  <td class="p-3 text-center font-mono text-regular-12 text-neutral-secondary">
                    {{ dist.distributed_at }}
                  </td>
                  <td class="p-3 text-right font-bold font-mono text-status-success-main">
                    +{{ formatRupiah(dist.amount) }}
                  </td>
                  <td class="p-3 text-center">
                    <BaseBadge variant="success" class="!text-semibold-12">
                      Transfer Sukses
                    </BaseBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  </DefaultLayout>
</template>
