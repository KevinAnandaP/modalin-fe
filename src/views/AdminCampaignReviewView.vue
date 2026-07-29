<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTextarea from '@/components/BaseTextarea.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import campaignService from '@/services/campaign'

const campaigns = ref([])
const selectedFilter = ref('admin_review') // 'all' | 'admin_review' | 'published' | 'rejected'
const isLoading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

const activeModalCampaign = ref(null)
const reviewDecision = ref('published') // 'published' | 'rejected' | 'draft'
const adminNote = ref('')
const isSubmitting = ref(false)

const formatRupiah = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const filteredCampaigns = computed(() => {
  if (selectedFilter.value === 'all') return campaigns.value
  return campaigns.value.filter(c => c.status === selectedFilter.value)
})

const fetchCampaigns = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await campaignService.getCatalog({ search: '' })
    const list = res.data || res || []
    if (list.length > 0) {
      campaigns.value = list
    } else {
      campaigns.value = [
        {
          id: 'c-req-1',
          title: 'Pengadaan Mesin Roasting Kopi Kencana',
          description: 'Pengajuan modal usaha untuk pengadaan mesin roaster kapasitas 5kg guna efisiensi biaya bahan baku kedai kopi.',
          category: 'Kuliner',
          target_amount: 20000000,
          collected_amount: 0,
          tenor_months: 12,
          interest_rate: 11,
          status: 'admin_review',
          business: {
            name: 'Kedai Kopi Kencana',
            city: 'Bandung',
            owner: 'Rian Pratama'
          },
          budget_items: [
            { id: 'b1', item_name: 'Mesin Roaster 5kg', quantity: 1, unit_price: 16000000, category: 'Peralatan' },
            { id: 'b2', item_name: 'Green Beans Arabica 50kg', quantity: 2, unit_price: 2000000, category: 'Bahan Baku' }
          ]
        },
        {
          id: 'c-req-2',
          title: 'Ekspansi Stok Kain Batik Tradisional Kirana',
          description: 'Penambahan persediaan kain batik tulis khas Jawa Barat untuk persiapan pameran ekspor UMKM.',
          category: 'Kerajinan',
          target_amount: 12000000,
          collected_amount: 0,
          tenor_months: 6,
          interest_rate: 10,
          status: 'admin_review',
          business: {
            name: 'Batik Kirana Nusantara',
            city: 'Solo',
            owner: 'Kirana Dewi'
          },
          budget_items: [
            { id: 'b3', item_name: 'Kain Sutra Halus 100 Meter', quantity: 1, unit_price: 8000000, category: 'Bahan Baku' },
            { id: 'b4', item_name: 'Pewarna Alami & Malam', quantity: 1, unit_price: 4000000, category: 'Bahan Baku' }
          ]
        }
      ]
    }
  } catch (err) {
    errorMessage.value = err.message || 'Gagal memuat daftar campaign.'
  } finally {
    isLoading.value = false
  }
}

const openReviewModal = (item) => {
  activeModalCampaign.value = item
  reviewDecision.value = 'published'
  adminNote.value = ''
}

const closeReviewModal = () => {
  activeModalCampaign.value = null
}

const handleReviewSubmit = async () => {
  if (!activeModalCampaign.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await campaignService.reviewCampaign(activeModalCampaign.value.id, {
      decision: reviewDecision.value,
      admin_note: adminNote.value
    })

    const target = campaigns.value.find(c => c.id === activeModalCampaign.value.id)
    if (target) {
      target.status = reviewDecision.value
    }

    successMessage.value = `Status campaign '${activeModalCampaign.value.title}' berhasil diperbarui menjadi ${reviewDecision.value}.`
    closeReviewModal()
  } catch (err) {
    errorMessage.value = err.message || 'Gagal menyimpan keputusan review.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchCampaigns()
})
</script>

<template>
  <AdminLayout>
    <div class="min-h-screen bg-neutral-tertiary pb-20">
      <!-- Header Title Bar -->
      <div class="bg-white border-b border-primary-base/10 py-6 px-4 sm:px-8 lg:px-16">
        <div class="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <span class="text-xs font-semibold text-primary-base">Admin Moderation Panel</span>
            <h1 class="text-semibold-32 font-newsreader font-bold text-neutral-primary">
              Peninjauan Campaign UMKM
            </h1>
          </div>
          <RouterLink to="/campaigns">
            <BaseButton variant="outline" size="sm">Lihat Katalog Publik</BaseButton>
          </RouterLink>
        </div>
      </div>

      <!-- Main Container -->
      <main class="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 pt-8 space-y-6">
        <!-- Alert Messages -->
        <div v-if="successMessage" class="p-4 bg-status-success-surface/40 border border-status-success-main/30 rounded-xl text-status-success-main text-xs font-medium">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="p-4 bg-status-error-surface/30 border border-status-error-main/30 rounded-xl text-status-error-main text-xs font-medium">
          {{ errorMessage }}
        </div>

        <!-- Filter Tab Bar -->
        <div class="bg-white rounded-2xl p-4 border border-primary-base/10 shadow-xs flex flex-wrap items-center gap-2">
          <button
            type="button"
            @click="selectedFilter = 'admin_review'"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
              selectedFilter === 'admin_review' ? 'bg-primary-base text-white' : 'bg-neutral-tertiary text-neutral-secondary hover:text-neutral-primary'
            ]"
          >
            Perlu Review (Admin Review)
          </button>
          <button
            type="button"
            @click="selectedFilter = 'published'"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
              selectedFilter === 'published' ? 'bg-primary-base text-white' : 'bg-neutral-tertiary text-neutral-secondary hover:text-neutral-primary'
            ]"
          >
            Disetujui (Published)
          </button>
          <button
            type="button"
            @click="selectedFilter = 'rejected'"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
              selectedFilter === 'rejected' ? 'bg-primary-base text-white' : 'bg-neutral-tertiary text-neutral-secondary hover:text-neutral-primary'
            ]"
          >
            Ditolak (Rejected)
          </button>
          <button
            type="button"
            @click="selectedFilter = 'all'"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
              selectedFilter === 'all' ? 'bg-primary-base text-white' : 'bg-neutral-tertiary text-neutral-secondary hover:text-neutral-primary'
            ]"
          >
            Semua Status
          </button>
        </div>

        <!-- Loading State Skeleton -->
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-24 w-full rounded-2xl bg-neutral-200" />
          <Skeleton class="h-24 w-full rounded-2xl bg-neutral-200" />
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredCampaigns.length === 0" class="bg-white rounded-2xl p-12 text-center border border-primary-base/10 space-y-3">
          <p class="text-medium-16 font-semibold text-neutral-primary">Tidak Ada Campaign pada Kategori Ini</p>
          <p class="text-xs text-neutral-secondary">Seluruh pengajuan campaign telah selesai ditinjau.</p>
        </div>

        <!-- Campaign Table / Cards -->
        <div v-else class="space-y-4">
          <div
            v-for="item in filteredCampaigns"
            :key="item.id"
            class="bg-white rounded-2xl p-6 border border-primary-base/10 shadow-xs flex flex-wrap md:flex-nowrap items-center justify-between gap-6"
          >
            <div class="space-y-2 max-w-xl">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 bg-primary-10 text-primary-base rounded-full text-[11px] font-semibold">
                  {{ item.category || 'UMKM' }}
                </span>
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize',
                    item.status === 'published' ? 'bg-status-success-surface/50 text-status-success-main' :
                    item.status === 'rejected' ? 'bg-status-error-surface/50 text-status-error-main' :
                    'bg-status-warning-surface/50 text-status-warning-main'
                  ]"
                >
                  {{ item.status }}
                </span>
              </div>

              <h3 class="text-medium-18 font-bold text-neutral-primary leading-snug">
                {{ item.title }}
              </h3>

              <p class="text-xs text-neutral-secondary">
                Bisnis: <strong class="text-neutral-primary">{{ item.business?.name }}</strong> ({{ item.business?.city || 'Indonesia' }})
              </p>
            </div>

            <div class="flex items-center gap-6 shrink-0">
              <div class="text-right">
                <span class="text-xs text-neutral-secondary block">Target Nominal</span>
                <span class="text-semibold-16 font-bold text-primary-base font-mono tabular-nums">
                  {{ formatRupiah(item.target_amount) }}
                </span>
                <span class="text-[11px] text-neutral-secondary block">Tenor {{ item.tenor_months }} bln ({{ item.interest_rate }}%)</span>
              </div>

              <BaseButton
                variant="primary"
                size="sm"
                @click="openReviewModal(item)"
              >
                Tinjau & Verifikasi
              </BaseButton>
            </div>
          </div>
        </div>
      </main>

      <!-- Review Detail Modal -->
      <div v-if="activeModalCampaign" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start border-b border-primary-base/10 pb-4">
            <div>
              <span class="text-xs font-semibold text-primary-base">Detail Peninjauan Campaign</span>
              <h2 class="text-semibold-24 font-newsreader font-bold text-neutral-primary">
                {{ activeModalCampaign.title }}
              </h2>
            </div>
            <button @click="closeReviewModal" class="text-neutral-secondary hover:text-neutral-primary text-xl font-bold cursor-pointer">
              ✕
            </button>
          </div>

          <div class="space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-4 p-4 bg-neutral-tertiary rounded-xl border border-primary-base/10">
              <div>
                <span class="text-neutral-secondary block">Nama Bisnis:</span>
                <span class="font-bold text-neutral-primary text-sm">{{ activeModalCampaign.business?.name }}</span>
              </div>
              <div>
                <span class="text-neutral-secondary block">Kategori:</span>
                <span class="font-bold text-primary-base text-sm">{{ activeModalCampaign.category }}</span>
              </div>
              <div>
                <span class="text-neutral-secondary block">Target Dana:</span>
                <span class="font-bold text-neutral-primary text-sm font-mono">{{ formatRupiah(activeModalCampaign.target_amount) }}</span>
              </div>
              <div>
                <span class="text-neutral-secondary block">Tenor / Imbal Hasil:</span>
                <span class="font-bold text-neutral-primary text-sm">{{ activeModalCampaign.tenor_months }} Bulan ({{ activeModalCampaign.interest_rate }}%)</span>
              </div>
            </div>

            <div>
              <span class="font-bold text-neutral-primary block mb-1">Deskripsi Campaign:</span>
              <p class="text-neutral-secondary leading-relaxed bg-neutral-tertiary/40 p-3 rounded-lg border border-primary-base/10">
                {{ activeModalCampaign.description }}
              </p>
            </div>
          </div>

          <!-- Decision Form -->
          <form @submit.prevent="handleReviewSubmit" class="space-y-4 border-t border-primary-base/10 pt-4">
            <div>
              <label class="block text-xs font-bold text-neutral-primary mb-2">Keputusan Verifikasi Admin</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="reviewDecision = 'published'"
                  :class="[
                    'py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                    reviewDecision === 'published' ? 'bg-status-success-main text-white border-status-success-main' : 'bg-white text-neutral-primary border-neutral-300'
                  ]"
                >
                  ✓ Setujui (Publish)
                </button>
                <button
                  type="button"
                  @click="reviewDecision = 'draft'"
                  :class="[
                    'py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                    reviewDecision === 'draft' ? 'bg-status-warning-main text-white border-status-warning-main' : 'bg-white text-neutral-primary border-neutral-300'
                  ]"
                >
                  ✎ Minta Revisi
                </button>
                <button
                  type="button"
                  @click="reviewDecision = 'rejected'"
                  :class="[
                    'py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                    reviewDecision === 'rejected' ? 'bg-status-error-main text-white border-status-error-main' : 'bg-white text-neutral-primary border-neutral-300'
                  ]"
                >
                  ✕ Tolak
                </button>
              </div>
            </div>

            <BaseTextarea
              v-model="adminNote"
              label="Catatan Verifikator / Alasan (Opsional)"
              placeholder="Berikan catatan peninjauan kelayakan usaha atau rekomendasi..."
              rows="3"
            />

            <div class="flex justify-end gap-3 pt-2">
              <BaseButton variant="outline" size="sm" type="button" @click="closeReviewModal">
                Batal
              </BaseButton>
              <BaseButton variant="primary" size="sm" type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Simpan...' : 'Simpan Keputusan' }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
