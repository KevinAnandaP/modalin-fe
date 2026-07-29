<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import MilestoneTracker from '@/components/MilestoneTracker.vue'
import FundUsageProofModal from '@/components/FundUsageProofModal.vue'
import RiskScoreBadge from '@/components/RiskScoreBadge.vue'
import RiskScoreCard from '@/components/RiskScoreCard.vue'
import campaignService from '@/services/campaign'

const route = useRoute()
const campaignId = route.params.id

const campaign = ref(null)
const budgetItems = ref([])
const milestones = ref([])

const isLoading = ref(true)
const errorMessage = ref('')
const activeTab = ref('tentang')

const isProofModalOpen = ref(false)
const selectedMilestoneForProof = ref(null)

const handleOpenProofModal = (ms) => {
  selectedMilestoneForProof.value = ms
  isProofModalOpen.value = true
}

const handleProofSuccess = () => {
  fetchDetailData()
}

const pledgeAmount = ref(100000)
const riskAccepted = ref(false)
const isPledging = ref(false)
const pledgeSuccessMessage = ref('')

const formatRupiah = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const progressPercentage = computed(() => {
  if (!campaign.value) return 0
  const target = campaign.value.target_amount || 1
  const collected = campaign.value.collected_amount || 0
  return Math.min(100, Math.round((collected / target) * 100))
})

const estimatedReturn = computed(() => {
  const rate = (campaign.value?.interest_rate || 10) / 100
  const months = (campaign.value?.tenor_months || 12) / 12
  return Math.round(pledgeAmount.value * (1 + rate * months))
})

const totalRabAmount = computed(() => {
  return budgetItems.value.reduce((acc, item) => {
    return acc + (item.quantity * item.unit_price)
  }, 0)
})

const fetchDetailData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const catalogRes = await campaignService.getCatalog({ search: '' })
    const catalogList = catalogRes.data || catalogRes || []
    let found = catalogList.find(c => c.id === campaignId)

    if (!found) {
      try {
        const detailRes = await campaignService.getCampaignById(campaignId)
        found = detailRes.data || detailRes
      } catch {
        found = null
      }
    }

    if (found) {
      campaign.value = found
    } else {
      campaign.value = {
        id: campaignId,
        title: 'Pengembangan Usaha Kedai Roti Kirana',
        description: 'Usaha pembuatan roti dan kue kering yang sudah berjalan selama 2 tahun di Bandung. Pengajuan dana ini digunakan untuk upgrade mesin mixer kapasitas 30L dan oven deck agar kapasitas produksi meningkat 3x lipat.',
        category: 'Kuliner',
        target_amount: 15000000,
        collected_amount: 10500000,
        tenor_months: 12,
        interest_rate: 12,
        status: 'published',
        risk_level: 'Low Risk (Tier 2)',
        business: {
          name: 'Kedai Roti Kirana',
          city: 'Bandung',
          owner: 'Kirana Citra'
        }
      }
    }

    try {
      const budgetRes = await campaignService.getBudgetItems(campaignId)
      budgetItems.value = budgetRes.data || budgetRes || []
    } catch {
      budgetItems.value = [
        { id: 'b1', item_name: 'Mixer Spiral Industri 30L', quantity: 1, unit_price: 9500000, category: 'Peralatan' },
        { id: 'b2', item_name: 'Oven Deck Listrik 2 Tray', quantity: 1, unit_price: 4500000, category: 'Peralatan' },
        { id: 'b3', item_name: 'Bahan Baku Tepung & Butter 50kg', quantity: 2, unit_price: 500000, category: 'Bahan Baku' }
      ]
    }

    try {
      const milestoneRes = await campaignService.getMilestones(campaignId)
      milestones.value = milestoneRes.data || milestoneRes || []
    } catch {
      milestones.value = [
        { id: 'm1', order_number: 1, title: 'Pembelian & Instalasi Mixer 30L', description: 'Pengadaan mesin mixer spiral dari supplier terverifikasi', target_amount: 9500000, status: 'unlocked' },
        { id: 'm2', order_number: 2, title: 'Pembelian Oven Deck 2 Tray', description: 'Pengadaan oven deck dan penataan aliran listrik tempat usaha', target_amount: 4500000, status: 'pending' },
        { id: 'm3', order_number: 3, title: 'Stok Bahan Baku Awal', description: 'Pembelian tepung terigu protein tinggi dan bahan pembuat roti', target_amount: 1000000, status: 'pending' }
      ]
    }

  } catch (err) {
    errorMessage.value = err.message || 'Gagal memuat detail campaign.'
  } finally {
    isLoading.value = false
  }
}

const handlePledgeSubmit = async () => {
  if (!riskAccepted.value) {
    alert('Mohon menyetujui pernyataan pemahaman risiko terlebih dahulu.')
    return
  }
  if (pledgeAmount.value < 10000) {
    alert('Nominal pendanaan minimal adalah Rp 10.000.')
    return
  }

  isPledging.value = true
  pledgeSuccessMessage.value = ''
  try {
    const res = await campaignService.pledgeCampaign(campaignId, pledgeAmount.value)
    const newCollected = res?.data?.collected_amount || (campaign.value ? (campaign.value.collected_amount || 0) + Number(pledgeAmount.value) : Number(pledgeAmount.value))
    if (campaign.value) {
      campaign.value.collected_amount = newCollected
    }
    pledgeSuccessMessage.value = `Terima kasih! Pendanaan sebesar ${formatRupiah(pledgeAmount.value)} berhasil disalurkan.`
  } catch (err) {
    const errText = err.message || err.error || 'Gagal menyalurkan pendanaan.'
    if (err.status === 401) {
      alert('Silakan login terlebih dahulu sebagai Lender untuk mendanai campaign ini.')
    } else {
      alert(`Gagal: ${errText}`)
    }
  } finally {
    isPledging.value = false
  }
}


onMounted(() => {
  fetchDetailData()
})
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-neutral-tertiary pb-20">

      <!-- Loading State Skeleton -->
      <div v-if="isLoading" class="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 pt-8 space-y-6">
        <Skeleton class="h-10 w-2/3 bg-neutral-200" />
        <Skeleton class="h-6 w-1/3 bg-neutral-200" />
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-8 space-y-4">
            <Skeleton class="h-64 w-full rounded-2xl bg-neutral-200" />
            <Skeleton class="h-40 w-full rounded-2xl bg-neutral-200" />
          </div>
          <div class="lg:col-span-4">
            <Skeleton class="h-96 w-full rounded-2xl bg-neutral-200" />
          </div>
        </div>
      </div>

      <!-- Error State Alert -->
      <div v-else-if="errorMessage" class="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 pt-8">
        <div class="p-6 bg-white rounded-2xl border border-status-error-main/30 text-center space-y-4">
          <p class="text-status-error-main font-medium">{{ errorMessage }}</p>
          <RouterLink to="/campaigns">
            <BaseButton variant="primary" size="md">Kembali ke Katalog</BaseButton>
          </RouterLink>
        </div>
      </div>

      <!-- Detail Main Content -->
      <main v-else class="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 pt-8 space-y-8">
        <!-- Campaign Header Card -->
        <div class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 shadow-xs space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-primary-10 text-primary-base rounded-full text-semibold-12">
                {{ campaign.category || 'UMKM' }}
              </span>
              <span class="px-3 py-1 bg-status-info-surface/40 text-status-info-main rounded-full text-medium-12">
                {{ campaign.risk_level || 'Tier 2 Risk' }}
              </span>
            </div>
            <BaseBadge variant="success" class="!text-semibold-12">
              {{ campaign.status === 'published' ? 'Penggalangan Aktif' : campaign.status }}
            </BaseBadge>
          </div>

          <div>
            <h1 class="text-semibold-32 font-newsreader font-bold text-neutral-primary leading-tight">
              {{ campaign.title }}
            </h1>
            <p class="text-regular-14 text-neutral-secondary mt-1 flex items-center gap-2">
              <span>Bisnis: <strong class="text-neutral-primary">{{ campaign.business?.name }}</strong></span>
              <span>•</span>
              <span>Lokasi: {{ campaign.business?.city || 'Indonesia' }}</span>
            </p>
          </div>

          <!-- Financial Statistics Bar -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-neutral-tertiary rounded-xl border border-primary-base/10 text-center">
            <div>
              <span class="text-regular-12 text-neutral-secondary block">Target Dana</span>
              <span class="text-semibold-18 font-bold text-neutral-primary tabular-nums">{{ formatRupiah(campaign.target_amount) }}</span>
            </div>
            <div>
              <span class="text-regular-12 text-neutral-secondary block">Terkumpul</span>
              <span class="text-semibold-18 font-bold text-primary-base tabular-nums">{{ formatRupiah(campaign.collected_amount || 0) }}</span>
            </div>
            <div>
              <span class="text-regular-12 text-neutral-secondary block">Tenor</span>
              <span class="text-semibold-18 font-bold text-neutral-primary">{{ campaign.tenor_months }} Bulan</span>
            </div>
            <div>
              <span class="text-regular-12 text-neutral-secondary block">Imbal Hasil / Thn</span>
              <span class="text-semibold-18 font-bold text-secondary-base">{{ campaign.interest_rate }}%</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-2">
            <div class="flex justify-between items-center text-semibold-12">
              <span class="text-neutral-secondary">Pencapaian Pendanaan</span>
              <span class="text-primary-base">{{ progressPercentage }}%</span>
            </div>
            <div class="w-full bg-neutral-tertiary h-3 rounded-full overflow-hidden border border-primary-base/10">
              <div 
                class="bg-primary-base h-full rounded-full transition-all duration-500"
                :style="{ width: `${progressPercentage}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Main Section Grid (Content Left, Sticky Form Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Left Column (Tabs & Info) -->
          <div class="lg:col-span-8 space-y-6">
            <!-- Tabs Bar -->
            <div class="bg-white rounded-xl p-2 border border-primary-base/10 flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                @click="activeTab = 'tentang'"
                :class="[
                  'px-4 py-2 rounded-lg text-semibold-12 transition-all cursor-pointer whitespace-nowrap',
                  activeTab === 'tentang' ? 'bg-primary-base text-white' : 'text-neutral-secondary hover:text-neutral-primary'
                ]"
              >
                Tentang Campaign
              </button>

              <button
                type="button"
                @click="activeTab = 'rab'"
                :class="[
                  'px-4 py-2 rounded-lg text-semibold-12 transition-all cursor-pointer whitespace-nowrap',
                  activeTab === 'rab' ? 'bg-primary-base text-white' : 'text-neutral-secondary hover:text-neutral-primary'
                ]"
              >
                Rencana Anggaran (RAB)
              </button>

              <button
                type="button"
                @click="activeTab = 'milestone'"
                :class="[
                  'px-4 py-2 rounded-lg text-semibold-12 transition-all cursor-pointer whitespace-nowrap',
                  activeTab === 'milestone' ? 'bg-primary-base text-white' : 'text-neutral-secondary hover:text-neutral-primary'
                ]"
              >
                Tahapan Milestone
              </button>

              <button
                type="button"
                @click="activeTab = 'risiko'"
                :class="[
                  'px-4 py-2 rounded-lg text-semibold-12 transition-all cursor-pointer whitespace-nowrap',
                  activeTab === 'risiko' ? 'bg-primary-base text-white' : 'text-neutral-secondary hover:text-neutral-primary'
                ]"
              >
                Analisis Risiko
              </button>
            </div>

            <!-- Tab Content 1: Tentang Campaign -->
            <div v-if="activeTab === 'tentang'" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 space-y-6">
              <h3 class="text-semibold-20 font-bold text-neutral-primary">Deskripsi Penggunaan Modal</h3>
              <p class="text-regular-16 text-neutral-secondary leading-relaxed whitespace-pre-line">
                {{ campaign.description }}
              </p>

              <div class="border-t border-primary-base/10 pt-6 space-y-4">
                <h4 class="text-semibold-16 font-semibold text-neutral-primary">Informasi Pemilik Usaha</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-regular-12">
                  <div class="p-4 bg-primary-10/40 rounded-xl">
                    <span class="text-neutral-secondary block">Nama Usaha</span>
                    <span class="font-bold text-neutral-primary text-regular-14">{{ campaign.business?.name }}</span>
                  </div>
                  <div class="p-4 bg-primary-10/40 rounded-xl">
                    <span class="text-neutral-secondary block">Pemilik</span>
                    <span class="font-bold text-neutral-primary text-regular-14">{{ campaign.business?.owner || 'Pengelola UMKM' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab Content 2: Rencana Anggaran Biaya (RAB) -->
            <div v-else-if="activeTab === 'rab'" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-semibold-20 font-bold text-neutral-primary">Rencana Anggaran Biaya (RAB)</h3>
                <span class="text-semibold-12 text-primary-base">Total: {{ formatRupiah(totalRabAmount) }}</span>
              </div>

              <div class="overflow-x-auto border border-primary-base/10 rounded-xl">
                <table class="w-full text-left text-regular-12">
                  <thead class="bg-neutral-tertiary border-b border-primary-base/10 text-neutral-secondary">
                    <tr>
                      <th class="p-3.5">Nama Item</th>
                      <th class="p-3.5">Kategori</th>
                      <th class="p-3.5 text-center">Jumlah</th>
                      <th class="p-3.5 text-right">Harga Satuan</th>
                      <th class="p-3.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-primary-base/10 text-neutral-primary">
                    <tr v-for="item in budgetItems" :key="item.id" class="hover:bg-neutral-tertiary/50">
                      <td class="p-3.5 font-medium">{{ item.item_name }}</td>
                      <td class="p-3.5 text-neutral-secondary">{{ item.category || 'Umum' }}</td>
                      <td class="p-3.5 text-center font-mono">{{ item.quantity }}</td>
                      <td class="p-3.5 text-right font-mono">{{ formatRupiah(item.unit_price) }}</td>
                      <td class="p-3.5 text-right font-bold font-mono text-primary-base">
                        {{ formatRupiah(item.quantity * item.unit_price) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tab Content 3: Milestone Pencairan -->
            <div v-else-if="activeTab === 'milestone'" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 space-y-6">
              <MilestoneTracker 
                :milestones="milestones" 
                :is-borrower="true"
                @upload-proof="handleOpenProofModal"
              />
            </div>

            <!-- Tab Content 4: Analisis Kelayakan Risiko -->
            <div v-else-if="activeTab === 'risiko'">
              <RiskScoreCard :risk-assessment="campaign.risk_assessment || campaign.riskAssessment" />
            </div>
          </div>

          <!-- Right Column (Pledge / Direct Funding Widget) -->
          <div class="lg:col-span-4 sticky top-24 space-y-4">
            <BaseCard variant="default" padding="lg" rounded="lg" class="border border-primary-base/20 space-y-6 shadow-sm">
              <h3 class="text-semibold-20 font-bold text-neutral-primary">Danai Campaign Ini</h3>

              <div v-if="pledgeSuccessMessage" class="p-4 bg-status-success-surface/40 border border-status-success-main/30 rounded-xl text-status-success-main text-medium-12">
                {{ pledgeSuccessMessage }}
              </div>

              <form @submit.prevent="handlePledgeSubmit" class="space-y-4">
                <BaseInput
                  v-model.number="pledgeAmount"
                  type="number"
                  label="Nominal Pendanaan (Rp)"
                  placeholder="100000"
                  required
                />

                <div class="p-3.5 bg-primary-10/40 rounded-xl space-y-1.5 text-regular-12">
                  <div class="flex justify-between text-neutral-secondary">
                    <span>Estimasi Imbal Hasil:</span>
                    <span class="font-bold text-primary-base tabular-nums">{{ campaign.interest_rate }}% / thn</span>
                  </div>
                  <div class="flex justify-between text-neutral-primary font-bold">
                    <span>Estimasi Pengembalian:</span>
                    <span class="text-primary-base tabular-nums">{{ formatRupiah(estimatedReturn) }}</span>
                  </div>
                </div>

                <!-- Risk Disclosure Statement (System Requirement) -->
                <div class="p-3.5 bg-status-warning-surface/30 border border-status-warning-main/30 rounded-xl text-regular-12 text-neutral-secondary space-y-2">
                  <p class="font-bold text-secondary-base">Pemberitahuan Risiko Pendanaan:</p>
                  <p>Pendanaan UMKM memiliki risiko keterlambatan pembayaran. Estimasi pengembalian bukan jaminan mutlak.</p>
                  <label class="flex items-start gap-2 pt-1 cursor-pointer">
                    <input type="checkbox" v-model="riskAccepted" class="mt-0.5 rounded text-primary-base focus:ring-primary-base" />
                    <span class="text-neutral-primary font-medium">Saya memahami dan menyetujui risiko pendanaan.</span>
                  </label>
                </div>

                <BaseButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  class="w-full justify-center"
                  :disabled="isPledging || !riskAccepted"
                >
                  {{ isPledging ? 'Memproses...' : 'Danai Sekarang' }}
                </BaseButton>
              </form>
            </BaseCard>
          </div>
        </div>
      </main>

      <!-- Borrower Upload Fund Usage Proof Modal -->
      <FundUsageProofModal
        :is-open="isProofModalOpen"
        :campaign-id="campaignId"
        :milestone="selectedMilestoneForProof"
        @close="isProofModalOpen = false"
        @success="handleProofSuccess"
      />
    </div>
  </DefaultLayout>
</template>
