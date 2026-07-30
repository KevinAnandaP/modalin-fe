<script setup>
import { computed } from 'vue'
import BaseBadge from '@/components/BaseBadge.vue'
import BaseButton from '@/components/BaseButton.vue'

const props = defineProps({
  milestones: {
    type: Array,
    default: () => []
  },
  isBorrower: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['upload-proof', 'review-proof'])

const formatRupiah = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const getStatusBadge = (ms) => {
  const status = (ms.status || 'pending').toLowerCase()
  const proofStatus = ms.proof?.status?.toLowerCase()

  if (status === 'completed' || proofStatus === 'approved') {
    return { variant: 'success', label: 'Terverifikasi Selesai' }
  }
  if (proofStatus === 'submitted' || status === 'proof_submitted') {
    return { variant: 'warning', label: 'Bukti Menunggu Review' }
  }
  if (status === 'disbursed' || status === 'unlocked') {
    return { variant: 'primary', label: 'Dana Dicairkan' }
  }
  if (proofStatus === 'rejected') {
    return { variant: 'error', label: 'Bukti Perlu Revisi' }
  }
  return { variant: 'secondary', label: 'Belum Dicairkan' }
}

const getStepNodeStyle = (ms) => {
  const status = (ms.status || 'pending').toLowerCase()
  const proofStatus = ms.proof?.status?.toLowerCase()

  if (status === 'completed' || proofStatus === 'approved') {
    return 'bg-status-success-surface text-status-success-main border-status-success-main'
  }
  if (proofStatus === 'submitted' || status === 'proof_submitted') {
    return 'bg-status-warning-surface text-status-warning-active border-status-warning-active animate-pulse'
  }
  if (status === 'disbursed' || status === 'unlocked') {
    return 'bg-primary-10 text-primary-base border-primary-base'
  }
  if (proofStatus === 'rejected') {
    return 'bg-status-error-surface text-status-error-main border-status-error-main'
  }
  return 'bg-neutral-tertiary text-neutral-secondary border-neutral-secondary/30'
}
</script>

<template>
  <div class="space-y-6 font-inter">
    <div class="flex items-center justify-between">
      <h3 class="text-semibold-20 font-bold text-neutral-primary">Tahapan Milestone & Pencairan Dana</h3>
      <span class="text-regular-12 text-neutral-secondary">
        Total {{ milestones.length }} Tahap
      </span>
    </div>

    <div v-if="!milestones || milestones.length === 0" class="p-8 text-center bg-white rounded-2xl border border-primary-base/10">
      <p class="text-regular-14 text-neutral-secondary">Belum ada tahapan milestone yang terdaftar.</p>
    </div>

    <div v-else class="relative space-y-6 before:absolute before:inset-0 before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-primary-base/15">
      <div 
        v-for="(ms, index) in milestones" 
        :key="ms.id || index"
        class="relative flex items-start gap-4 pl-10"
      >
        <!-- Step Node Badge Icon -->
        <div 
          :class="[
            'absolute left-0 top-0.5 w-10 h-10 rounded-full border-2 flex items-center justify-center text-semibold-14 font-bold shadow-xs transition-all',
            getStepNodeStyle(ms)
          ]"
        >
          <span v-if="ms.status === 'completed' || ms.proof?.status === 'approved'">✓</span>
          <span v-else>{{ ms.order_number || (index + 1) }}</span>
        </div>

        <!-- Content Card -->
        <div class="flex-1 bg-white rounded-2xl p-5 border border-primary-base/10 shadow-xs space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-semibold-12 text-primary-base font-bold">
                Milestone {{ ms.order_number || (index + 1) }}
              </span>
              <BaseBadge :variant="getStatusBadge(ms).variant" class="!text-semibold-12">
                {{ getStatusBadge(ms).label }}
              </BaseBadge>
            </div>
            <span class="text-semibold-14 font-mono font-bold text-primary-base">
              {{ formatRupiah(ms.target_amount) }}
            </span>
          </div>

          <div>
            <h4 class="text-semibold-16 font-semibold text-neutral-primary">{{ ms.title }}</h4>
            <p v-if="ms.description" class="text-regular-14 text-neutral-secondary mt-1 leading-relaxed">
              {{ ms.description }}
            </p>
          </div>

          <!-- Proof / Disbursement Extra Info Panel -->
          <div v-if="ms.proof || ms.disbursement" class="p-3.5 bg-neutral-tertiary/60 rounded-xl space-y-2 text-regular-12 border border-primary-base/5">
            <div v-if="ms.disbursement" class="flex justify-between text-neutral-secondary">
              <span>Tanggal Pencairan:</span>
              <span class="font-bold text-neutral-primary">{{ ms.disbursement.disbursed_at || 'Sudah Dicairkan' }}</span>
            </div>
            <div v-if="ms.proof" class="space-y-1">
              <div class="flex justify-between text-neutral-secondary">
                <span>Bukti Pengeluaran:</span>
                <span class="font-bold text-primary-base font-mono">{{ formatRupiah(ms.proof.amount_spent) }}</span>
              </div>
              <p v-if="ms.proof.notes" class="text-neutral-primary italic">
                "{{ ms.proof.notes }}"
              </p>
            </div>
          </div>

          <!-- Action Buttons for Borrower and Admin -->
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <!-- Borrower Action: Upload Proof -->
            <BaseButton
              v-if="isBorrower && (ms.status === 'disbursed' || ms.status === 'unlocked') && ms.proof?.status !== 'approved'"
              variant="primary"
              size="sm"
              @click="emit('upload-proof', ms)"
            >
              Upload Bukti Pemakaian Dana
            </BaseButton>

            <!-- Admin Action: Review Proof -->
            <BaseButton
              v-if="isAdmin && ms.proof && ms.proof.status === 'submitted'"
              variant="secondary"
              size="sm"
              @click="emit('review-proof', ms)"
            >
              Review Bukti Belanja
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
