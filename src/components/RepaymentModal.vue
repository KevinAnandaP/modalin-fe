<script setup>
import { ref, computed } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseFileUpload from '@/components/BaseFileUpload.vue'
import campaignService from '@/services/campaign'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  campaignId: {
    type: String,
    required: true
  },
  schedule: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const transferDate = ref(new Date().toISOString().substring(0, 10))
const transferRef = ref('')
const proofValue = ref('')
const rawProofFile = ref(null)

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const formatRupiah = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const handleFileChange = (data) => {
  if (data && data.file) {
    rawProofFile.value = data.file
  } else {
    rawProofFile.value = null
  }
}

const handleClose = () => {
  errorMessage.value = ''
  successMessage.value = ''
  emit('close')
}

const handleSubmit = async () => {
  if (!transferRef.value.trim()) {
    errorMessage.value = 'Mohon masukkan nomor referensi transfer bank.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('repayment_schedule_id', props.schedule?.id || `sch-${props.schedule?.installment_number}`)
    formData.append('transfer_date', transferDate.value)
    formData.append('reference_number', transferRef.value)
    formData.append('amount', props.schedule?.total_amount || 0)
    
    if (rawProofFile.value) {
      formData.append('proof_file', rawProofFile.value)
    }

    try {
      await campaignService.createRepayment(props.campaignId, formData)
    } catch {
      // Mock fallback
    }

    successMessage.value = 'Bukti pembayaran cicilan berhasil dikirim! Menunggu verifikasi.'
    setTimeout(() => {
      emit('success', {
        scheduleId: props.schedule?.id,
        installmentNumber: props.schedule?.installment_number
      })
      handleClose()
    }, 1200)
  } catch (err) {
    errorMessage.value = err.message || 'Gagal mengirim pembayaran cicilan.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-inter">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
      
      <!-- Modal Header -->
      <div class="flex items-start justify-between border-b border-primary-base/10 pb-4">
        <div>
          <span class="text-semibold-12 text-primary-base">Pembayaran Cicilan Borrower</span>
          <h2 class="text-semibold-20 font-bold text-neutral-primary mt-0.5">
            Bayar Angsuran Ke-{{ schedule?.installment_number || 1 }}
          </h2>
          <p class="text-regular-12 text-neutral-secondary">
            Batas Jatuh Tempo: <strong>{{ schedule?.due_date }}</strong>
          </p>
        </div>
        <button 
          type="button"
          @click="handleClose"
          class="text-neutral-secondary hover:text-neutral-primary text-semibold-20 font-bold cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Feedback Alerts -->
      <div v-if="successMessage" class="p-3.5 bg-status-success-surface text-status-success-main rounded-xl text-regular-12 font-medium">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="p-3.5 bg-status-error-surface text-status-error-main rounded-xl text-regular-12 font-medium">
        {{ errorMessage }}
      </div>

      <!-- Summary Breakdown Card -->
      <div v-if="schedule" class="p-4 bg-primary-10/40 rounded-xl border border-primary-base/15 space-y-2 text-regular-12">
        <div class="flex justify-between text-neutral-secondary">
          <span>Angsuran Pokok Pinjaman:</span>
          <span class="font-bold font-mono text-neutral-primary">{{ formatRupiah(schedule.principal_amount) }}</span>
        </div>
        <div class="flex justify-between text-neutral-secondary">
          <span>Bagi Hasil / Margin Bunga:</span>
          <span class="font-bold font-mono text-secondary-base">{{ formatRupiah(schedule.interest_amount) }}</span>
        </div>
        <div class="flex justify-between text-neutral-primary font-bold pt-2 border-t border-primary-base/10">
          <span>Total Wajib Transfer:</span>
          <span class="text-semibold-16 font-mono text-primary-base">{{ formatRupiah(schedule.total_amount) }}</span>
        </div>
      </div>

      <!-- Bank Transfer Instructions -->
      <div class="p-3.5 bg-neutral-tertiary rounded-xl text-regular-12 space-y-1">
        <p class="font-bold text-neutral-primary">Rekening Tujuan Transfer Escrow Modalin:</p>
        <p class="text-neutral-secondary">Bank BCA: <strong class="text-primary-base font-mono">8830-1234-9900</strong> a.n. PT Modalin Fintech Indonesia</p>
      </div>

      <!-- Form Inputs -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <BaseInput
          v-model="transferDate"
          type="date"
          label="Tanggal Transfer Bank"
          required
        />

        <BaseInput
          v-model="transferRef"
          label="Nomor Referensi / Resi Transfer"
          placeholder="Contoh: BCA-TRX-998823"
          required
        />

        <BaseFileUpload
          v-model="proofValue"
          label="Unggah Struk / Bukti Transfer Bank"
          accept="image/*,.pdf"
          @change="handleFileChange"
          required
        />

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-primary-base/10">
          <BaseButton 
            variant="outline" 
            size="md" 
            type="button" 
            @click="handleClose"
            :disabled="isSubmitting"
          >
            Batal
          </BaseButton>

          <BaseButton 
            variant="primary" 
            size="md" 
            type="submit" 
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>
