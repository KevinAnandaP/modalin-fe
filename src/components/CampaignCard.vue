<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/BaseCard.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import BaseButton from '@/components/BaseButton.vue'
import RiskScoreBadge from '@/components/RiskScoreBadge.vue'

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  }
})

const formatRupiah = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const progressPercentage = computed(() => {
  const target = props.campaign.target_amount || 1
  const collected = props.campaign.collected_amount || 0
  const pct = Math.min(100, Math.round((collected / target) * 100))
  return pct
})

const statusBadgeVariant = computed(() => {
  switch (props.campaign.status) {
    case 'published':
      return 'success'
    case 'funded':
    case 'completed':
      return 'primary'
    case 'submitted':
      return 'warning'
    case 'rejected':
      return 'error'
    default:
      return 'outline'
  }
})

const statusLabel = computed(() => {
  switch (props.campaign.status) {
    case 'published':
      return 'Aktif'
    case 'funded':
      return 'Tendanai'
    case 'completed':
      return 'Selesai'
    case 'submitted':
      return 'Review'
    case 'rejected':
      return 'Ditolak'
    default:
      return props.campaign.status || 'Draft'
  }
})
</script>

<template>
  <BaseCard variant="default" padding="none" rounded="lg" class="group hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden border border-primary-base/15">
    <!-- Header Banner / Image Placeholder -->
    <div class="relative h-44 w-full bg-gradient-to-br from-primary-10 via-primary-20 to-primary-30 flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-primary-base/5 group-hover:bg-primary-base/0 transition-colors duration-300"></div>
      
      <!-- Category Badge Top-Left -->
      <div class="absolute top-3 left-3 z-10">
        <span class="inline-flex items-center px-3 py-1 text-semibold-12 font-semibold text-primary-base bg-white/90 backdrop-blur-md rounded-full shadow-xs">
          {{ campaign.category || 'UMKM' }}
        </span>
      </div>

      <!-- Status Badge Top-Right -->
      <div class="absolute top-3 right-3 z-10">
        <BaseBadge :variant="statusBadgeVariant" class="!px-2.5 !py-0.5 !text-semibold-12 font-medium">
          {{ statusLabel }}
        </BaseBadge>
      </div>

      <!-- Icon / Decorative Branding -->
      <div class="text-center p-4">
        <span class="text-semibold-24 font-newsreader text-primary-base/80 font-bold block">
          {{ campaign.business?.name || campaign.title || 'Campaign Modalin' }}
        </span>
      </div>
    </div>

    <!-- Body Content -->
    <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <h3 class="text-medium-20 text-neutral-primary font-semibold line-clamp-1 group-hover:text-primary-base transition-colors flex-1">
            {{ campaign.title }}
          </h3>
        </div>

        <RiskScoreBadge 
          :risk-level="campaign.risk_level || campaign.risk_assessment?.risk_level || 'low'"
          :score="campaign.risk_assessment?.final_score"
          size="sm"
        />

        <p class="text-regular-14 text-neutral-secondary line-clamp-2 mt-1.5 leading-relaxed">
          {{ campaign.description || 'Campaign pendanaan UMKM lokal untuk pengembangan usaha dan modal kerja.' }}
        </p>
      </div>

      <!-- Progress Bar Section -->
      <div class="space-y-2">
        <div class="flex justify-between items-center text-semibold-12 font-medium text-neutral-secondary">
          <span>Terkumpul</span>
          <span class="text-primary-base font-bold">{{ progressPercentage }}%</span>
        </div>
        
        <div class="w-full bg-neutral-tertiary h-2.5 rounded-full overflow-hidden border border-primary-base/10">
          <div 
            class="bg-primary-base h-full rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>

        <div class="flex justify-between items-baseline pt-1">
          <span class="text-semibold-16 text-primary-base font-bold tabular-nums">
            {{ formatRupiah(campaign.collected_amount || 0) }}
          </span>
          <span class="text-regular-12 text-neutral-secondary font-medium tabular-nums">
            dari {{ formatRupiah(campaign.target_amount) }}
          </span>
        </div>
      </div>

      <!-- Financial Metrics Grid -->
      <div class="grid grid-cols-2 gap-2 pt-3 border-t border-primary-base/10 text-regular-12">
        <div class="bg-primary-10/50 p-2.5 rounded-lg text-center">
          <span class="text-neutral-secondary block text-regular-12">Tenor</span>
          <span class="font-semibold text-neutral-primary text-semibold-14">{{ campaign.tenor_months || 12 }} Bulan</span>
        </div>
        <div class="bg-primary-10/50 p-2.5 rounded-lg text-center">
          <span class="text-neutral-secondary block text-regular-12">Imbal Hasil / Thn</span>
          <span class="font-semibold text-primary-base text-semibold-14">{{ campaign.interest_rate || 10 }}%</span>
        </div>
      </div>

      <!-- Card Action Footer -->
      <div class="pt-2">
        <RouterLink :to="`/campaigns/${campaign.id}`" class="no-underline block">
          <BaseButton variant="primary" size="md" class="w-full justify-center">
            Lihat Detail Campaign
          </BaseButton>
        </RouterLink>
      </div>
    </div>
  </BaseCard>
</template>
