<script setup>
import { ref, onMounted, watch } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import CampaignCard from '@/components/CampaignCard.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import campaignService from '@/services/campaign'

const campaigns = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const searchQuery = ref('')
const selectedCategory = ref('')
const minAmount = ref('')
const maxAmount = ref('')

const categories = [
  { id: '', name: 'Semua Kategori' },
  { id: 'Kuliner', name: 'Kuliner' },
  { id: 'Fashion', name: 'Fashion' },
  { id: 'Pertanian', name: 'Pertanian & Peternakan' },
  { id: 'Jasa', name: 'Jasa' },
  { id: 'Teknologi', name: 'Teknologi & Digital' },
  { id: 'Perdagangan', name: 'Perdagangan' }
]

const fetchCampaigns = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const params = {}
    if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
    if (selectedCategory.value) params.category = selectedCategory.value
    if (minAmount.value) params.min_amount = minAmount.value
    if (maxAmount.value) params.max_amount = maxAmount.value

    const res = await campaignService.getCatalog(params)
    campaigns.value = res.data || res || []
  } catch (err) {
    errorMessage.value = err.message || 'Gagal memuat katalog campaign.'
    campaigns.value = []
  } finally {
    isLoading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  minAmount.value = ''
  maxAmount.value = ''
  fetchCampaigns()
}

// Debounce search input
let searchTimeout = null
const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchCampaigns()
  }, 400)
}

watch(selectedCategory, () => {
  fetchCampaigns()
})

onMounted(() => {
  fetchCampaigns()
})
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-neutral-tertiary pb-20">
      <!-- Catalog Hero Section -->
      <section class="bg-primary-base text-white pt-12 pb-16 px-4 sm:px-8 lg:px-16 relative overflow-hidden">
        <div class="max-w-6xl mx-auto space-y-4">
          <h1 class="text-semibold-48 font-newsreader font-bold tracking-tight max-w-2xl leading-tight">
            Modalin Yuk!
          </h1>

          <p class="text-regular-18 text-white/80 max-w-2xl font-inter leading-relaxed">
            Dukung pertumbuhan bisnis lokal dan UMKM potensial di seluruh Indonesia melalui pendanaan yang transparan dan berdampak sosial tinggi.
          </p>
        </div>
      </section>

      <!-- Main Content Container -->
      <main class="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 -mt-8 relative z-10">
        <!-- Filter & Search Card -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-primary-base/10 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <!-- Search Input -->
            <div class="md:col-span-6">
              <BaseInput
                v-model="searchQuery"
                label="Cari Campaign"
                placeholder="Cari berdasarkan nama campaign atau usaha..."
                @input="onSearchInput"
              />
            </div>

            <!-- Min Amount Filter -->
            <div class="md:col-span-3">
              <BaseInput
                v-model="minAmount"
                label="Target Min (Rp)"
                type="number"
                placeholder="Contoh: 1000000"
                @change="fetchCampaigns"
              />
            </div>

            <!-- Max Amount Filter -->
            <div class="md:col-span-3">
              <BaseInput
                v-model="maxAmount"
                label="Target Max (Rp)"
                type="number"
                placeholder="Contoh: 50000000"
                @change="fetchCampaigns"
              />
            </div>
          </div>

          <!-- Category Pills Filter -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              @click="selectedCategory = cat.id"
              :class="[
                'px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer',
                selectedCategory === cat.id
                  ? 'bg-primary-base text-white shadow-xs'
                  : 'bg-neutral-tertiary text-neutral-primary hover:bg-primary-10 hover:text-primary-base'
              ]"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Error State Alert -->
        <div v-if="errorMessage" class="mt-8 p-4 bg-status-error-surface/30 border border-status-error-main/30 rounded-xl text-status-error-main text-sm flex justify-between items-center">
          <span>{{ errorMessage }}</span>
          <BaseButton variant="outline" size="sm" @click="fetchCampaigns">Coba Lagi</BaseButton>
        </div>

        <!-- Skeleton Loading State (Shadcn UI) -->
        <div v-if="isLoading" class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="n in 6" :key="n" class="bg-white rounded-xl p-5 border border-primary-base/10 space-y-4">
            <Skeleton class="h-44 w-full rounded-lg bg-neutral-200" />
            <Skeleton class="h-6 w-3/4 bg-neutral-200" />
            <Skeleton class="h-4 w-full bg-neutral-200" />
            <Skeleton class="h-3 w-1/2 bg-neutral-200" />
            <Skeleton class="h-10 w-full rounded-lg bg-neutral-200" />
          </div>
        </div>

        <!-- Campaign Grid -->
        <div v-else-if="campaigns.length > 0" class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CampaignCard
            v-for="item in campaigns"
            :key="item.id"
            :campaign="item"
          />
        </div>

        <!-- Actionable Empty State -->
        <div v-else class="mt-12 bg-white rounded-2xl p-12 text-center border border-primary-base/10 max-w-lg mx-auto space-y-4">
          <div class="w-16 h-16 bg-primary-10 rounded-full flex items-center justify-center mx-auto text-primary-base">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <h3 class="text-semibold-20 text-neutral-primary font-semibold">
            Tidak Ada Campaign Ditemukan
          </h3>

          <p class="text-regular-14 text-neutral-secondary">
            Tidak ada campaign yang cocok dengan kriteria pencarian Anda. Coba sesuaikan kata kunci atau bersihkan filter.
          </p>

          <div class="pt-2">
            <BaseButton variant="primary" size="md" @click="resetFilters">
              Bersihkan Filter & Reset
            </BaseButton>
          </div>
        </div>
      </main>
    </div>
  </DefaultLayout>
</template>
