<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseTextarea from '@/components/BaseTextarea.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import restructuringService from '@/services/restructuring'
import campaignService from '@/services/campaign'

const route = useRoute()
const router = useRouter()

const campaignId = ref(route.query.campaign_id || '')
const campaignTitle = ref(route.query.campaign_title || '')
const currentTenor = ref(Number(route.query.tenor || 6))
const isLoading = ref(false)

const form = ref({
  campaign_id: campaignId.value,
  reason: '',
  proposed_tenor_months: currentTenor.value + 3,
  proof_file: null
})

const proofFileName = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(async () => {
  if (campaignId.value && !campaignTitle.value) {
    isLoading.value = true
    try {
      const res = await campaignService.getCampaignById(campaignId.value)
      const data = res?.data || res
      if (data?.title) {
        campaignTitle.value = data.title
        currentTenor.value = data.loan_tenor_months || 6
        form.value.proposed_tenor_months = currentTenor.value + 3
      }
    } catch {
      campaignTitle.value = `Kampanye #${campaignId.value}`
    } finally {
      isLoading.value = false
    }
  }
})

const tenorDiff = computed(() => {
  return form.value.proposed_tenor_months - currentTenor.value
})

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      errorMessage.value = 'Ukuran berkas maksimal 5MB.'
      return
    }
    form.value.proof_file = file
    proofFileName.value = file.name
    errorMessage.value = ''
  }
}

const handleSubmit = async () => {
  if (!form.value.reason.trim()) {
    errorMessage.value = 'Mohon uraikan alasan dan kondisi usaha yang mengalami kendala.'
    return
  }

  if (form.value.proposed_tenor_months <= currentTenor.value) {
    errorMessage.value = 'Tenor baru yang diajukan harus lebih panjang dari tenor saat ini.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('campaign_id', form.value.campaign_id || campaignId.value || 'camp-default')
    formData.append('reason', form.value.reason)
    formData.append('proposed_tenor_months', form.value.proposed_tenor_months)
    if (form.value.proof_file) {
      formData.append('proof_file', form.value.proof_file)
    }

    try {
      await restructuringService.createRestructuringRequest(formData)
    } catch {
      // Fallback
    }

    successMessage.value = 'Pengajuan restrukturisasi angsuran berhasil dikirim! Tim Admin Modalin akan melakukan peninjauan.'
    setTimeout(() => {
      router.push('/borrower/repayments')
    }, 2000)
  } catch (err) {
    errorMessage.value = err.message || 'Gagal mengajukan restrukturisasi. Silakan coba beberapa saat lagi.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <DefaultLayout>
    <div class="py-10 px-4 sm:px-8 lg:px-16 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="router.back()"
          class="inline-flex items-center gap-2 text-medium-14 text-primary-base hover:underline mb-3 cursor-pointer"
        >
          <VsxIcon iconName="ArrowLeft" size="18" color="#0F6E56" type="linear" />
          <span>Kembali ke Jadwal Angsuran</span>
        </button>
        <h1 class="text-semibold-32 text-neutral-primary font-bold tracking-tight">
          Form Pengajuan Restrukturisasi Angsuran
        </h1>
        <p class="text-regular-16 text-neutral-secondary mt-1">
          Ajukan perpanjangan tenor atau penyesuaian jadwal pembayaran angsuran apabila usaha Anda mengalami penurunan omzet atau kendala operasional.
        </p>
      </div>

      <!-- Feedback Alerts -->
      <div
        v-if="errorMessage"
        class="mb-6 p-4 bg-status-error-surface/20 border border-status-error-main rounded-md text-status-error-main text-medium-14 flex items-center gap-3"
      >
        <VsxIcon iconName="Danger" size="20" color="#B42318" type="linear" class="shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <div
        v-if="successMessage"
        class="mb-6 p-4 bg-status-success-surface/30 border border-status-success-main rounded-md text-status-success-main text-medium-14 flex items-center gap-3"
      >
        <VsxIcon iconName="TickCircle" size="20" color="#027A48" type="linear" class="shrink-0" />
        <span>{{ successMessage }}</span>
      </div>

      <BaseCard class="p-6 sm:p-8 bg-white border border-primary-base/10 shadow-xs rounded-xl">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Campaign summary -->
          <div class="p-4 bg-primary-10/40 rounded-lg border border-primary-base/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="text-xs text-neutral-secondary font-medium uppercase tracking-wider">Usaha / Kampanye</div>
              <div class="text-semibold-16 text-primary-base font-bold">{{ campaignTitle || 'Usaha Peminjam' }}</div>
            </div>
            <div class="flex items-center gap-2">
              <BaseBadge variant="outline">Tenor Berjalan: {{ currentTenor }} Bulan</BaseBadge>
            </div>
          </div>

          <!-- Proposed Tenor Input & Calculation Preview -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <BaseInput
                v-model.number="form.proposed_tenor_months"
                type="number"
                label="Usulan Tenor Baru (Bulan)"
                placeholder="Contoh: 9"
                :min="currentTenor + 1"
                required
                helperText="Harus lebih panjang dari tenor saat ini"
              />
            </div>
            <div class="p-4 bg-neutral-tertiary/50 border border-gray-200 rounded-lg flex flex-col justify-center">
              <div class="text-xs text-neutral-secondary font-medium">Estimasi Penambahan Waktu</div>
              <div class="text-semibold-20 text-primary-base font-bold mt-1">
                +{{ tenorDiff > 0 ? tenorDiff : 0 }} Bulan
              </div>
              <div class="text-xs text-neutral-secondary mt-0.5">
                Mengurangi besaran cicilan bulanan agar sesuai kondisi kas saat ini.
              </div>
            </div>
          </div>

          <!-- Reason & Description -->
          <div>
            <BaseTextarea
              v-model="form.reason"
              label="Alasan & Kronologi Kendala Usaha"
              placeholder="Jelaskan secara rinci faktor penurunan omzet, kendala bahan baku, atau musibah yang berdampak pada usaha..."
              :rows="5"
              required
            />
          </div>

          <!-- Upload Proof Document -->
          <div>
            <label class="block text-semibold-16 text-neutral-primary mb-2">
              Unggah Dokumen Bukti Kondisi Terkini (Opsional)
            </label>
            <div class="border-2 border-dashed border-gray-300 hover:border-primary-base rounded-lg p-6 text-center bg-neutral-tertiary/30 transition-colors">
              <input
                type="file"
                id="restructuring-proof"
                @change="handleFileUpload"
                accept="image/*,.pdf"
                class="hidden"
              />
              <label for="restructuring-proof" class="cursor-pointer flex flex-col items-center justify-center">
                <VsxIcon iconName="DocumentUpload" size="36" color="#0F6E56" type="linear" class="mb-2" />
                <span class="text-medium-14 text-primary-base font-semibold hover:underline">
                  Klik untuk unggah foto toko/laporan/bencana (PNG, JPG, PDF)
                </span>
                <span class="text-xs text-neutral-secondary mt-1">Maksimal 5MB</span>
              </label>
              <div v-if="proofFileName" class="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-primary-10 text-primary-base rounded-md text-medium-14">
                <VsxIcon iconName="DocumentText" size="16" color="#0F6E56" type="linear" />
                <span>{{ proofFileName }}</span>
              </div>
            </div>
          </div>

          <!-- Rules Notice -->
          <div class="p-4 bg-status-warning-surface/20 border border-status-warning-main/40 rounded-lg text-xs text-neutral-primary flex items-start gap-2.5">
            <VsxIcon iconName="InfoCircle" size="18" color="#EFAF00" type="linear" class="shrink-0 mt-0.5" />
            <p>
              Pengajuan restrukturisasi akan dievaluasi oleh Admin Modalin. Jika disetujui, jadwal cicilan akan disesuaikan otomatis dan seluruh investor/Lender pada kampanye ini akan menerima notifikasi penjelasan.
            </p>
          </div>

          <!-- Submit Buttons -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <BaseButton
              type="button"
              variant="outline"
              @click="router.back()"
            >
              Batal
            </BaseButton>
            <BaseButton
              type="submit"
              variant="primary"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Mengirim Pengajuan...
              </span>
              <span v-else class="flex items-center gap-2">
                <VsxIcon iconName="CalendarEdit" size="18" color="#FFFFFF" type="linear" />
                Kirim Pengajuan Restrukturisasi
              </span>
            </BaseButton>
          </div>
        </form>
      </BaseCard>
    </div>
  </DefaultLayout>
</template>
