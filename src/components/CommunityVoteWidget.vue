<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTextarea from '@/components/BaseTextarea.vue'
import businessService from '@/services/business'

const props = defineProps({
  businessId: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    default: 'UMKM'
  },
  initialUpvotes: {
    type: Number,
    default: 124
  },
  initialVouches: {
    type: Number,
    default: 42
  },
  initialScore: {
    type: Number,
    default: 85
  }
})

const upvotes = ref(props.initialUpvotes)
const vouches = ref(props.initialVouches)
const hasVoted = ref(false)
const userVoteType = ref(null) // 'upvote' | 'vouch'
const newComment = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const testimonials = ref([
  {
    id: 1,
    name: 'Budi Rahardjo',
    role: 'Warga Bandung / Pelanggan Setia',
    comment: 'Kedai ini memang ramai tiap sore dan produk rotinya berkualitas tinggi. Sangat layak didukung!',
    date: '2 hari lalu',
    type: 'vouch'
  },
  {
    id: 2,
    name: 'Siti Maryam',
    role: 'Pengusaha UMKM Sekitar',
    comment: 'Pemiliknya amanah dan usaha berkembang pesat. Transaksi selalu lancar.',
    date: '5 hari lalu',
    type: 'upvote'
  }
])

const handleVote = async (type) => {
  if (hasVoted.value && userVoteType.value === type) return

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await businessService.voteCommunity(props.businessId, {
      vote_type: type,
      comment: newComment.value || undefined
    })
    
    if (type === 'upvote') upvotes.value += 1
    if (type === 'vouch') vouches.value += 1

    hasVoted.value = true
    userVoteType.value = type

    if (newComment.value.trim() !== '') {
      testimonials.value.unshift({
        id: Date.now(),
        name: 'Saya (Pendukung)',
        role: 'Lender / Komunitas Modalin',
        comment: newComment.value,
        date: 'Baru saja',
        type
      })
      newComment.value = ''
    }

    successMessage.value = 'Dukungan komunitas berhasil diberikan! Terima kasih.'
  } catch (err) {
    // Fallback client update for mock/preview mode
    if (type === 'upvote') upvotes.value += 1
    if (type === 'vouch') vouches.value += 1
    hasVoted.value = true
    userVoteType.value = type

    if (newComment.value.trim() !== '') {
      testimonials.value.unshift({
        id: Date.now(),
        name: 'Saya (Pendukung)',
        role: 'Komunitas Modalin',
        comment: newComment.value,
        date: 'Baru saja',
        type
      })
      newComment.value = ''
    }

    successMessage.value = 'Terima kasih telah memberikan dukungan komunitas!'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 border border-primary-base/10 shadow-xs space-y-6 font-inter">
    <!-- Widget Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-primary-base/10 pb-4">
      <div>
        <h3 class="text-semibold-18 font-bold text-neutral-primary">
          Dukungan & Vote Komunitas
        </h3>
        <p class="text-regular-12 text-neutral-secondary mt-0.5">
          Suara dan garansi reputasi dari warga & jaringan komunitas sekitar {{ businessName }}.
        </p>
      </div>

      <!-- Live Counters -->
      <div class="flex items-center gap-3">
        <div class="px-3.5 py-1.5 bg-primary-10 rounded-xl border border-primary-base/15 text-center">
          <span class="text-regular-12 text-neutral-secondary block">Dukungan</span>
          <span class="text-semibold-16 font-bold text-primary-base font-mono">{{ upvotes }}</span>
        </div>
        <div class="px-3.5 py-1.5 bg-status-warning-surface/50 rounded-xl border border-status-warning-active/20 text-center">
          <span class="text-regular-12 text-neutral-secondary block">Vouch Warga</span>
          <span class="text-semibold-16 font-bold text-secondary-base font-mono">{{ vouches }}</span>
        </div>
      </div>
    </div>

    <!-- Alert Feedback Message -->
    <div v-if="successMessage" class="p-3.5 bg-status-success-surface text-status-success-main rounded-xl text-regular-12 font-medium">
      {{ successMessage }}
    </div>

    <!-- Vote Action Buttons -->
    <div class="p-4 bg-neutral-tertiary/60 rounded-xl border border-primary-base/10 space-y-4">
      <h4 class="text-semibold-14 font-semibold text-neutral-primary">
        Beri Dukungan untuk {{ businessName }}
      </h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          @click="handleVote('upvote')"
          :disabled="isSubmitting || (hasVoted && userVoteType === 'upvote')"
          :class="[
            'p-3.5 rounded-xl border flex items-center justify-center gap-2 text-semibold-14 transition-all cursor-pointer select-none',
            userVoteType === 'upvote' 
              ? 'bg-primary-base text-white border-primary-base shadow-xs' 
              : 'bg-white text-primary-base border-primary-base/30 hover:bg-primary-10'
          ]"
        >
          <span>👍 Dukung Usaha Ini</span>
        </button>

        <button
          type="button"
          @click="handleVote('vouch')"
          :disabled="isSubmitting || (hasVoted && userVoteType === 'vouch')"
          :class="[
            'p-3.5 rounded-xl border flex items-center justify-center gap-2 text-semibold-14 transition-all cursor-pointer select-none',
            userVoteType === 'vouch' 
              ? 'bg-secondary-base text-white border-secondary-base shadow-xs' 
              : 'bg-white text-secondary-base border-secondary-base/30 hover:bg-secondary-10'
          ]"
        >
          <span>🤝 Garansi Vouch Komunitas</span>
        </button>
      </div>

      <!-- Testimonial Input Form -->
      <div class="space-y-2 pt-2">
        <BaseTextarea
          v-model="newComment"
          label="Ulasan / Testimoni Komunitas (Opsional)"
          placeholder="Bagikan pengalaman atau garansi kehandalan usaha ini..."
          :rows="2"
        />
        <div class="flex justify-end">
          <BaseButton 
            variant="primary" 
            size="sm" 
            @click="handleVote('upvote')"
            :disabled="isSubmitting || newComment.trim() === ''"
          >
            Kirim Ulasan Komunitas
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Testimonials List -->
    <div class="space-y-3">
      <h4 class="text-semibold-14 font-semibold text-neutral-primary">
        Testimoni & Vouch Terkini ({{ testimonials.length }})
      </h4>

      <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
        <div 
          v-for="item in testimonials" 
          :key="item.id" 
          class="p-4 bg-white rounded-xl border border-primary-base/10 space-y-1.5"
        >
          <div class="flex items-center justify-between">
            <div>
              <span class="text-semibold-14 font-bold text-neutral-primary">{{ item.name }}</span>
              <span class="text-regular-12 text-neutral-secondary block">{{ item.role }}</span>
            </div>
            <span 
              :class="[
                'px-2.5 py-0.5 rounded-full text-semibold-12 capitalize',
                item.type === 'vouch' ? 'bg-status-warning-surface text-secondary-base' : 'bg-primary-10 text-primary-base'
              ]"
            >
              {{ item.type }}
            </span>
          </div>

          <p class="text-regular-14 text-neutral-primary leading-relaxed">
            "{{ item.comment }}"
          </p>
          <span class="text-regular-12 text-neutral-secondary block text-right font-mono">{{ item.date }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
