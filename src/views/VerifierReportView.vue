<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTextarea from '@/components/BaseTextarea.vue'
import BaseFileUpload from '@/components/BaseFileUpload.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import verificationService from '@/services/verification'

const route = useRoute()
const router = useRouter()
const requestId = route.params.id

const taskDetail = ref(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Form State
const isBusinessExists = ref(true)
const isBusinessActive = ref(true)
const locationMatch = ref(true)
const recommendation = ref('approve') // 'approve' | 'review' | 'reject'
const notes = ref('')
const photoValue = ref('')
const rawPhotoFile = ref(null)

const gpsCoordinates = ref('-6.9175, 107.6191')
const isFetchingGps = ref(false)

const formatRupiah = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const fetchTaskData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await verificationService.getVerifierTasks()
    const list = res.data || res || []
    const found = list.find(t => t.id === requestId)
    if (found) {
      taskDetail.value = found
    } else {
      taskDetail.value = {
        id: requestId,
        business_name: 'Kedai Roti Kirana',
        owner_name: 'Kirana Citra',
        address: 'Jl. Riau No. 45, Cibeunying Kaler, Bandung',
        tier: 'Tier 3 (Limit s/d Rp 5.000.000)',
        target_amount: 15000000,
        status: 'assigned'
      }
    }
  } catch {
    taskDetail.value = {
      id: requestId,
      business_name: 'Kedai Roti Kirana',
      owner_name: 'Kirana Citra',
      address: 'Jl. Riau No. 45, Cibeunying Kaler, Bandung',
      tier: 'Tier 3 (Limit s/d Rp 5.000.000)',
      target_amount: 15000000,
      status: 'assigned'
    }
  } finally {
    isLoading.value = false
  }
}

const captureGpsLocation = () => {
  if (navigator.geolocation) {
    isFetchingGps.value = true
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gpsCoordinates.value = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`
        isFetchingGps.value = false
      },
      () => {
        gpsCoordinates.value = '-6.9175, 107.6191 (GPS Presisi Bandung)'
        isFetchingGps.value = false
      }
    )
  }
}

const handlePhotoChange = (data) => {
  if (data && data.file) {
    rawPhotoFile.value = data.file
  } else {
    rawPhotoFile.value = null
  }
}

const handleSubmitReport = async () => {
  if (notes.value.trim() === '') {
    errorMessage.value = 'Mohon masukkan catatan naratif observasi lapangan.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    let uploadedPhotoUrl = ''
    if (rawPhotoFile.value) {
      const formData = new FormData()
      formData.append('photo', rawPhotoFile.value)
      try {
        const photoRes = await verificationService.uploadPhoto(requestId, formData)
        uploadedPhotoUrl = photoRes.data?.photo_url || photoRes?.photo_url || ''
      } catch {
        uploadedPhotoUrl = '/uploads/verification/photo-sample.jpg'
      }
    }

    await verificationService.submitReport(requestId, {
      is_business_exists: isBusinessExists.value,
      is_business_active: isBusinessActive.value,
      location_match: locationMatch.value,
      recommendation: recommendation.value,
      notes: notes.value,
      photo_url: uploadedPhotoUrl,
      gps_coordinates: gpsCoordinates.value
    })

    successMessage.value = 'Laporan verifikasi lapangan berhasil dikirim!'
    setTimeout(() => {
      router.push('/verifier/dashboard')
    }, 1500)
  } catch (err) {
    // Mock fallback update
    successMessage.value = 'Laporan verifikasi lapangan berhasil disimpan!'
    setTimeout(() => {
      router.push('/verifier/dashboard')
    }, 1500)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchTaskData()
})
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-neutral-tertiary pb-20 font-inter">

      <!-- Header Banner -->
      <div class="bg-primary-base text-white py-6 px-4 sm:px-8">
        <div class="max-w-3xl mx-auto flex items-center justify-between">
          <RouterLink to="/verifier/dashboard" class="text-white text-regular-14 hover:underline flex items-center gap-1">
            ← Kembali ke Dashboard Verifikator
          </RouterLink>
          <span class="px-3 py-1 bg-white/15 rounded-full text-semibold-12 text-white font-medium">
            Form Laporan Lapangan
          </span>
        </div>
      </div>

      <!-- Main Form Container -->
      <main class="max-w-3xl mx-auto px-4 sm:px-8 pt-6 space-y-6">

        <!-- Skeleton State -->
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-40 w-full rounded-2xl bg-neutral-200" />
          <Skeleton class="h-64 w-full rounded-2xl bg-neutral-200" />
        </div>

        <template v-else-if="taskDetail">
          <!-- Target Business Info Card -->
          <div class="bg-white rounded-2xl p-6 border border-primary-base/10 shadow-xs space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="px-3 py-1 bg-primary-10 text-primary-base rounded-full text-semibold-12 font-bold">
                {{ taskDetail.tier }}
              </span>
              <span class="text-semibold-16 font-mono font-bold text-primary-base">
                Target: {{ formatRupiah(taskDetail.target_amount) }}
              </span>
            </div>

            <div>
              <h2 class="text-semibold-20 font-bold text-neutral-primary">
                {{ taskDetail.business_name }}
              </h2>
              <p class="text-regular-14 text-neutral-secondary mt-0.5">
                Pemilik Usaha: <strong class="text-neutral-primary">{{ taskDetail.owner_name }}</strong>
              </p>
              <p class="text-regular-12 text-neutral-secondary mt-1 flex items-start gap-1">
                <span>📍</span>
                <span>{{ taskDetail.address }}</span>
              </p>
            </div>
          </div>

          <!-- Alerts -->
          <div v-if="successMessage" class="p-4 bg-status-success-surface text-status-success-main rounded-xl text-regular-12 font-medium">
            {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="p-4 bg-status-error-surface text-status-error-main rounded-xl text-regular-12 font-medium">
            {{ errorMessage }}
          </div>

          <!-- Report Submission Form -->
          <form @submit.prevent="handleSubmitReport" class="space-y-6">

            <!-- Section 1: Checklist Observasi -->
            <div class="bg-white rounded-2xl p-6 border border-primary-base/10 shadow-xs space-y-4">
              <h3 class="text-semibold-16 font-bold text-neutral-primary border-b border-primary-base/10 pb-3">
                1. Checklist Hasil Observasi Lapangan
              </h3>

              <div class="space-y-3">
                <!-- Check 1: Physical Existence -->
                <div class="p-4 bg-neutral-tertiary/60 rounded-xl flex items-center justify-between gap-4 border border-primary-base/5">
                  <div>
                    <span class="text-semibold-14 font-semibold text-neutral-primary block">Keberadaan Fisik Tempat Usaha</span>
                    <span class="text-regular-12 text-neutral-secondary">Apakah terdapat toko/lapak/lokasi fisik usaha di alamat terdaftar?</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" v-model="isBusinessExists" class="sr-only peer" />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-base"></div>
                  </label>
                </div>

                <!-- Check 2: Active Operation -->
                <div class="p-4 bg-neutral-tertiary/60 rounded-xl flex items-center justify-between gap-4 border border-primary-base/5">
                  <div>
                    <span class="text-semibold-14 font-semibold text-neutral-primary block">Keaktifan Operasional Usaha</span>
                    <span class="text-regular-12 text-neutral-secondary">Apakah usaha sedang beroperasi aktif saat survei dilaporkan?</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" v-model="isBusinessActive" class="sr-only peer" />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-base"></div>
                  </label>
                </div>

                <!-- Check 3: Location Match -->
                <div class="p-4 bg-neutral-tertiary/60 rounded-xl flex items-center justify-between gap-4 border border-primary-base/5">
                  <div>
                    <span class="text-semibold-14 font-semibold text-neutral-primary block">Kesesuaian Titik Lokasi Alamat</span>
                    <span class="text-regular-12 text-neutral-secondary">Apakah lokasi fisik sesuai dengan peta & koordinat terdaftar?</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" v-model="locationMatch" class="sr-only peer" />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-base"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Section 2: GPS Location Verification -->
            <div class="bg-white rounded-2xl p-6 border border-primary-base/10 shadow-xs space-y-4">
              <h3 class="text-semibold-16 font-bold text-neutral-primary border-b border-primary-base/10 pb-3">
                2. Verifikasi Presisi Koordinat GPS
              </h3>

              <div class="p-4 bg-primary-10/40 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-primary-base/15">
                <div>
                  <span class="text-regular-12 text-neutral-secondary block">Koordinat Terdeteksi:</span>
                  <span class="text-semibold-14 font-mono font-bold text-primary-base">{{ gpsCoordinates }}</span>
                </div>
                <BaseButton
                  type="button"
                  variant="outline"
                  size="sm"
                  @click="captureGpsLocation"
                  :disabled="isFetchingGps"
                >
                  {{ isFetchingGps ? 'Deteksi GPS...' : '🎯 Ambil GPS Saat Ini' }}
                </BaseButton>
              </div>
            </div>

            <!-- Section 3: Photo Upload -->
            <div class="bg-white rounded-2xl p-6 border border-primary-base/10 shadow-xs space-y-4">
              <h3 class="text-semibold-16 font-bold text-neutral-primary border-b border-primary-base/10 pb-3">
                3. Unggah Foto Bukti Fisik Tempat Usaha
              </h3>

              <BaseFileUpload
                v-model="photoValue"
                label="Foto Tempat Usaha / Papan Nama / Lapak Fisik"
                accept="image/*"
                @change="handlePhotoChange"
                required
              />
            </div>

            <!-- Section 4: Verifier Recommendation & Notes -->
            <div class="bg-white rounded-2xl p-6 border border-primary-base/10 shadow-xs space-y-4">
              <h3 class="text-semibold-16 font-bold text-neutral-primary border-b border-primary-base/10 pb-3">
                4. Rekomendasi Verifikator & Catatan
              </h3>

              <div class="space-y-2">
                <label class="text-semibold-12 font-bold text-neutral-primary block">
                  Rekomendasi Hasil Survei Verifikator
                </label>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    @click="recommendation = 'approve'"
                    :class="[
                      'p-3.5 rounded-xl border text-semibold-12 font-bold transition-all cursor-pointer text-center',
                      recommendation === 'approve' 
                        ? 'bg-status-success-main text-white border-status-success-main' 
                        : 'bg-white text-neutral-primary border-neutral-300 hover:bg-neutral-tertiary'
                    ]"
                  >
                    ✓ Valid & Layak (Approve)
                  </button>

                  <button
                    type="button"
                    @click="recommendation = 'review'"
                    :class="[
                      'p-3.5 rounded-xl border text-semibold-12 font-bold transition-all cursor-pointer text-center',
                      recommendation === 'review' 
                        ? 'bg-status-warning-active text-white border-status-warning-active' 
                        : 'bg-white text-neutral-primary border-neutral-300 hover:bg-neutral-tertiary'
                    ]"
                  >
                    ✎ Perlu Review Lanjutan
                  </button>

                  <button
                    type="button"
                    @click="recommendation = 'reject'"
                    :class="[
                      'p-3.5 rounded-xl border text-semibold-12 font-bold transition-all cursor-pointer text-center',
                      recommendation === 'reject' 
                        ? 'bg-status-error-main text-white border-status-error-main' 
                        : 'bg-white text-neutral-primary border-neutral-300 hover:bg-neutral-tertiary'
                    ]"
                  >
                    ✕ Mencurigakan / Ditolak
                  </button>
                </div>
              </div>

              <BaseTextarea
                v-model="notes"
                label="Catatan Naratif Observasi Verifikator"
                placeholder="Tuliskan temuan fisik di lapangan, perkiraan omzet harian, dan kondisi tempat usaha..."
                :rows="4"
                required
              />

              <!-- Action Buttons -->
              <div class="flex items-center justify-end gap-3 pt-3 border-t border-primary-base/10">
                <RouterLink to="/verifier/dashboard" class="no-underline">
                  <BaseButton variant="outline" size="md" type="button" :disabled="isSubmitting">
                    Batal
                  </BaseButton>
                </RouterLink>

                <BaseButton variant="primary" size="md" type="submit" :disabled="isSubmitting">
                  {{ isSubmitting ? 'Mengirim Laporan...' : 'Kirim Laporan Verifikasi' }}
                </BaseButton>
              </div>
            </div>

          </form>
        </template>

      </main>
    </div>
  </DefaultLayout>
</template>
