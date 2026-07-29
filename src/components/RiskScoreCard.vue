<script setup>
import { computed } from 'vue'
import RiskScoreBadge from '@/components/RiskScoreBadge.vue'

const props = defineProps({
  riskAssessment: {
    type: Object,
    default: () => ({
      financial_score: 85,
      verification_score: 90,
      repayment_score: 95,
      community_score: 80,
      final_score: 88,
      risk_level: 'low',
      data_limited: false
    })
  }
})

const assessment = computed(() => {
  return props.riskAssessment || {
    financial_score: 85,
    verification_score: 90,
    repayment_score: 95,
    community_score: 80,
    final_score: 88,
    risk_level: 'low',
    data_limited: false
  }
})

const factors = computed(() => [
  {
    key: 'financial',
    label: 'Catatan Keuangan & Omzet',
    score: assessment.value.financial_score ?? assessment.value.financialScore ?? 80,
    desc: 'Berdasarkan kestabilan laporan omzet & laba bulanan terverifikasi'
  },
  {
    key: 'verification',
    label: 'Verifikasi Lapangan & Legalitas',
    score: assessment.value.verification_score ?? assessment.value.verificationScore ?? 85,
    desc: 'Survei fisik lokasi usaha & verifikasi dokumen NIB oleh verifikator'
  },
  {
    key: 'repayment',
    label: 'Riwayat Pembayaran Cicilan',
    score: assessment.value.repayment_score ?? assessment.value.repaymentScore ?? 90,
    desc: 'Track record pengembalian pokok & tepat waktu cicilan sebelumnya'
  },
  {
    key: 'community',
    label: 'Dukungan & Vote Komunitas',
    score: assessment.value.community_score ?? assessment.value.communityScore ?? 75,
    desc: 'Tingkat kepercayaaan & testimoni dari komunitas warga sekitar'
  }
])

const getScoreColorClass = (val) => {
  if (val >= 80) return 'bg-primary-base'
  if (val >= 60) return 'bg-status-warning-active'
  return 'bg-status-error-main'
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 border border-primary-base/10 shadow-xs space-y-6 font-inter">
    <!-- Header Section -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-primary-base/10 pb-4">
      <div>
        <h3 class="text-semibold-18 font-bold text-neutral-primary">
          Analisis & Skor Kelayakan Risiko
        </h3>
        <p class="text-regular-12 text-neutral-secondary mt-0.5">
          Kalkulasi otomatis transparansi skor risiko berdasarkan 4 kriteria utama.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-right">
          <span class="text-regular-12 text-neutral-secondary block">Skor Akhir</span>
          <span class="text-semibold-24 font-bold text-primary-base font-mono">
            {{ assessment.final_score ?? assessment.finalScore ?? 88 }}/100
          </span>
        </div>
        <RiskScoreBadge 
          :risk-level="assessment.risk_level || assessment.riskLevel || 'low'" 
          size="lg" 
        />
      </div>
    </div>

    <!-- Data Limited Warning Alert -->
    <div v-if="assessment.data_limited" class="p-3.5 bg-status-warning-surface/40 border border-status-warning-active/20 rounded-xl text-regular-12 text-neutral-primary space-y-1">
      <p class="font-bold text-secondary-base">Informasi Terbatas (Data Limited):</p>
      <p class="text-neutral-secondary">
        Usaha ini masih memerlukan penyelesaian verifikasi lapangan atau pengumpulan data transaksi lanjutan.
      </p>
    </div>

    <!-- 4 Assessment Factors Grid -->
    <div class="space-y-4">
      <div 
        v-for="factor in factors" 
        :key="factor.key" 
        class="p-4 bg-neutral-tertiary/50 rounded-xl border border-primary-base/5 space-y-2"
      >
        <div class="flex items-center justify-between">
          <span class="text-semibold-14 font-semibold text-neutral-primary">
            {{ factor.label }}
          </span>
          <span class="text-semibold-14 font-bold font-mono text-primary-base">
            {{ factor.score }}/100
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-white h-2.5 rounded-full overflow-hidden border border-primary-base/10">
          <div 
            :class="['h-full rounded-full transition-all duration-500', getScoreColorClass(factor.score)]"
            :style="{ width: `${Math.min(100, Math.max(0, factor.score))}%` }"
          />
        </div>

        <p class="text-regular-12 text-neutral-secondary">
          {{ factor.desc }}
        </p>
      </div>
    </div>
  </div>
</template>
