<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseTextarea from '@/components/BaseTextarea.vue'
import campaignService from '@/services/campaign'

const router = useRouter()

const currentStep = ref(1)

const campaignForm = ref({
  title: '',
  description: '',
  category: 'Kuliner',
  target_amount: null,
  tenor_months: 12,
  interest_rate: null,
  benefit_type: 'fixed_margin'
})

const budgetItems = ref([])
const milestones = ref([])

const newBudgetItem = ref({
  item_name: '',
  category: 'equipment',
  quantity: 1,
  unit_price: null,
  priority_level: 'high'
})

const categories = [
  'Kuliner', 'Fashion', 'Pertanian', 'Jasa', 'Teknologi', 'Perdagangan', 'Lainnya'
]

const isLoading = ref(false)
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

const totalRabAmount = computed(() => {
  return budgetItems.value.reduce((sum, item) => sum + (item.quantity * (item.unit_price || 0)), 0)
})

const isStep1Valid = computed(() => {
  return (
    campaignForm.value.title.trim().length >= 5 &&
    campaignForm.value.description.trim().length >= 10 &&
    campaignForm.value.target_amount &&
    campaignForm.value.target_amount > 0 &&
    campaignForm.value.interest_rate !== null
  )
})

const isStep2Valid = computed(() => {
  return budgetItems.value.length > 0 && totalRabAmount.value > 0
})

const addBudgetItem = () => {
  if (!newBudgetItem.value.item_name.trim() || !newBudgetItem.value.unit_price || newBudgetItem.value.unit_price <= 0) {
    alert('Isi nama item dan harga satuan RAB dengan benar.')
    return
  }
  const addedItem = {
    id: Date.now().toString(),
    item_name: newBudgetItem.value.item_name,
    category: newBudgetItem.value.category,
    quantity: Number(newBudgetItem.value.quantity) || 1,
    unit_price: Number(newBudgetItem.value.unit_price) || 0,
    priority_level: newBudgetItem.value.priority_level,
    purchase_method: 'direct_purchase'
  }
  budgetItems.value.push(addedItem)

  milestones.value.push({
    order_number: budgetItems.value.length,
    title: `Pengadaan ${addedItem.item_name}`,
    description: `Pembelian & penyediaan ${addedItem.item_name}`,
    target_amount: addedItem.quantity * addedItem.unit_price
  })

  newBudgetItem.value = {
    item_name: '',
    category: 'equipment',
    quantity: 1,
    unit_price: null,
    priority_level: 'high'
  }
}

const removeBudgetItem = (id) => {
  const index = budgetItems.value.findIndex(item => item.id === id)
  if (index !== -1) {
    budgetItems.value.splice(index, 1)
    milestones.value.splice(index, 1)
    milestones.value.forEach((ms, idx) => {
      ms.order_number = idx + 1
    })
  }
}

const nextStep = () => {
  errorMessage.value = ''
  if (currentStep.value === 1 && !isStep1Valid.value) {
    errorMessage.value = 'Lengkapi judul, deskripsi, target nominal, dan imbal hasil.'
    return
  }
  if (currentStep.value === 2 && !isStep2Valid.value) {
    errorMessage.value = 'Tambahkan minimal 1 item Rencana Anggaran Biaya (RAB).'
    return
  }
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const prevStep = () => {
  errorMessage.value = ''
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleFinalSubmit = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = {
      title: campaignForm.value.title,
      description: campaignForm.value.description,
      category: campaignForm.value.category,
      target_amount: Number(campaignForm.value.target_amount),
      tenor_months: Number(campaignForm.value.tenor_months),
      interest_rate: Number(campaignForm.value.interest_rate)
    }

    const createdRes = await campaignService.createCampaign(payload)
    const newCampaign = createdRes.data || createdRes

    if (newCampaign && newCampaign.id) {
      for (const item of budgetItems.value) {
        await campaignService.createBudgetItem(newCampaign.id, {
          item_name: item.item_name,
          category: item.category,
          amount: Number(item.quantity * item.unit_price),
          priority_level: item.priority_level,
          purchase_method: item.purchase_method || 'direct_purchase'
        })
      }
      await campaignService.submitCampaign(newCampaign.id)
    }

    successMessage.value = 'Campaign berhasil diajukan untuk review Admin!'
    setTimeout(() => {
      router.push('/campaigns')
    }, 1500)
  } catch (err) {
    errorMessage.value = err.message || 'Gagal mengajukan campaign.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <DefaultLayout>
    <div class="min-h-screen bg-neutral-tertiary pb-20">
      <!-- Main Container -->
      <main class="max-w-3xl mx-auto px-4 sm:px-8 lg:px-16 pt-8 space-y-8">
        <!-- Title & 4-Step Progress Bar Card -->
        <div class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 shadow-xs space-y-6">
          <h1 class="text-semibold-32 font-newsreader font-bold text-neutral-primary border-b border-primary-base/10 pb-4">
            Pengajuan Pendanaan Usaha
          </h1>

          <div class="flex items-center justify-between relative px-4">
            <div class="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0"></div>
            <div
              class="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-primary-base transition-all duration-300 z-0"
              :style="{ width: `${((currentStep - 1) / 3) * 80}%` }"
            ></div>

            <!-- Step 1 Indicator -->
            <div class="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer" @click="currentStep = 1">
              <div :class="['w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs transition-colors', currentStep >= 1 ? 'bg-primary-base text-white' : 'bg-gray-200 text-[#52605D]']">
                1
              </div>
              <span class="text-xs font-medium text-neutral-primary">Info Utama</span>
            </div>

            <!-- Step 2 Indicator -->
            <div class="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer" @click="currentStep >= 2 ? currentStep = 2 : null">
              <div :class="['w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs transition-colors', currentStep >= 2 ? 'bg-primary-base text-white' : 'bg-gray-200 text-[#52605D]']">
                2
              </div>
              <span class="text-xs font-medium text-neutral-primary">RAB (Budget)</span>
            </div>

            <!-- Step 3 Indicator -->
            <div class="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer" @click="currentStep >= 3 ? currentStep = 3 : null">
              <div :class="['w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs transition-colors', currentStep >= 3 ? 'bg-primary-base text-white' : 'bg-gray-200 text-[#52605D]']">
                3
              </div>
              <span class="text-xs font-medium text-neutral-primary">Milestone</span>
            </div>

            <!-- Step 4 Indicator -->
            <div class="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer" @click="currentStep >= 4 ? currentStep = 4 : null">
              <div :class="['w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs transition-colors', currentStep >= 4 ? 'bg-primary-base text-white' : 'bg-gray-200 text-[#52605D]']">
                4
              </div>
              <span class="text-xs font-medium text-neutral-primary">Review</span>
            </div>
          </div>
        </div>

        <!-- Alert Error / Success -->
        <div v-if="errorMessage" class="p-4 bg-status-error-surface/30 border border-status-error-main/30 rounded-xl text-status-error-main text-xs font-medium">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="p-4 bg-status-success-surface/40 border border-status-success-main/30 rounded-xl text-status-success-main text-xs font-medium">
          {{ successMessage }}
        </div>

        <!-- STEP 1: Info & Skema Pendanaan -->
        <div v-if="currentStep === 1" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 space-y-6 shadow-xs">
          <h2 class="text-semibold-20 font-bold text-neutral-primary">Step 1: Informasi Utama Campaign</h2>

          <div class="space-y-5">
            <BaseInput
              v-model="campaignForm.title"
              label="Judul Campaign"
              placeholder="Contoh: Pengadaan Alat & Ekspansi Usaha"
              required
            />

            <div class="flex flex-col gap-1.5 w-full font-inter">
              <label class="text-medium-14 text-neutral-primary font-medium">
                Kategori Bisnis <span class="text-status-error-main">*</span>
              </label>
              <select
                v-model="campaignForm.category"
                class="w-full text-regular-16 text-neutral-primary outline-none transition-all duration-200 font-inter px-4 py-2.5 bg-white border border-primary-base/20 rounded-lg focus:border-primary-base focus:ring-2 focus:ring-primary-base/15"
              >
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <BaseTextarea
              v-model="campaignForm.description"
              label="Deskripsi Penggunaan Modal"
              placeholder="Jelaskan secara mendetail tujuan penggunaan dana, latar belakang usaha, dan proyeksi manfaatnya..."
              rows="4"
              required
            />

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <BaseInput
                  v-model.number="campaignForm.target_amount"
                  type="number"
                  label="Target Modal (Rp)"
                  placeholder="Contoh: 10000000"
                  required
                />
              </div>

              <div class="flex flex-col gap-1.5 w-full font-inter">
                <label class="text-medium-14 text-neutral-primary font-medium whitespace-nowrap">
                  Tenor (Bulan) <span class="text-status-error-main">*</span>
                </label>
                <select
                  v-model.number="campaignForm.tenor_months"
                  class="w-full text-regular-16 text-neutral-primary outline-none transition-all duration-200 font-inter px-4 py-2.5 bg-white border border-primary-base/20 rounded-lg focus:border-primary-base focus:ring-2 focus:ring-primary-base/15"
                >
                  <option :value="3">3 Bulan</option>
                  <option :value="6">6 Bulan</option>
                  <option :value="9">9 Bulan</option>
                  <option :value="12">12 Bulan</option>
                </select>
              </div>

              <div>
                <BaseInput
                  v-model.number="campaignForm.interest_rate"
                  type="number"
                  label="Imbal Hasil (%/Thn)"
                  placeholder="Contoh: 12"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 2: Rencana Anggaran Biaya (RAB) -->
        <div v-else-if="currentStep === 2" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 space-y-6 shadow-xs">
          <div class="flex justify-between items-center">
            <h2 class="text-semibold-20 font-bold text-neutral-primary">Step 2: Rencana Anggaran Biaya (RAB)</h2>
            <span class="text-xs font-semibold text-primary-base">Total RAB: {{ formatRupiah(totalRabAmount) }}</span>
          </div>

          <!-- Add Item Form -->
          <div class="p-5 bg-primary-10/40 rounded-xl border border-primary-base/15 space-y-3">
            <span class="text-medium-14 font-bold text-primary-base block">Tambah Item Anggaran</span>
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div class="sm:col-span-5">
                <BaseInput
                  v-model="newBudgetItem.item_name"
                  label="Nama Barang / Kegiatan"
                  placeholder="Contoh: Oven Deck Listrik"
                />
              </div>
              <div class="sm:col-span-2">
                <BaseInput
                  v-model.number="newBudgetItem.quantity"
                  type="number"
                  label="Qty"
                  placeholder="1"
                />
              </div>
              <div class="sm:col-span-3">
                <BaseInput
                  v-model.number="newBudgetItem.unit_price"
                  type="number"
                  label="Harga Satuan (Rp)"
                  placeholder="5000000"
                />
              </div>
              <div class="sm:col-span-2">
                <BaseButton variant="primary" size="md" @click="addBudgetItem" class="w-full justify-center h-[46px]">
                  + Tambah
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Table Items -->
          <div v-if="budgetItems.length > 0" class="overflow-x-auto border border-primary-base/10 rounded-xl">
            <table class="w-full text-left text-xs">
              <thead class="bg-neutral-tertiary text-neutral-secondary border-b border-primary-base/10">
                <tr>
                  <th class="p-3">Nama Item</th>
                  <th class="p-3 text-center">Qty</th>
                  <th class="p-3 text-right">Harga Satuan</th>
                  <th class="p-3 text-right">Subtotal</th>
                  <th class="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-primary-base/10 text-neutral-primary">
                <tr v-for="item in budgetItems" :key="item.id" class="hover:bg-neutral-tertiary/50">
                  <td class="p-3 font-medium">{{ item.item_name }}</td>
                  <td class="p-3 text-center font-mono">{{ item.quantity }}</td>
                  <td class="p-3 text-right font-mono">{{ formatRupiah(item.unit_price) }}</td>
                  <td class="p-3 text-right font-bold text-primary-base font-mono">
                    {{ formatRupiah(item.quantity * item.unit_price) }}
                  </td>
                  <td class="p-3 text-center">
                    <button @click="removeBudgetItem(item.id)" class="text-status-error-main text-xs hover:underline cursor-pointer">
                      Hapus
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-6 text-xs text-neutral-secondary bg-neutral-tertiary/40 rounded-xl border border-dashed border-primary-base/20">
            Belum ada item RAB ditambahkan. Isi form di atas untuk menambahkan item.
          </div>
        </div>

        <!-- STEP 3: Tahapan Milestone -->
        <div v-else-if="currentStep === 3" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 space-y-6 shadow-xs">
          <h2 class="text-semibold-20 font-bold text-neutral-primary">Step 3: Tahapan Milestone Pencairan</h2>
          <p class="text-xs text-neutral-secondary">
            Susun urutan milestone pencairan dana sesuai alokasi RAB yang sudah Anda buat.
          </p>

          <div v-if="milestones.length > 0" class="space-y-4">
            <div v-for="ms in milestones" :key="ms.order_number" class="p-4 rounded-xl border border-primary-base/15 bg-neutral-tertiary/40 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-primary-base">Milestone {{ ms.order_number }}</span>
                <span class="text-xs font-mono font-bold text-neutral-primary">{{ formatRupiah(ms.target_amount) }}</span>
              </div>
              <input
                v-model="ms.title"
                type="text"
                placeholder="Judul Milestone"
                class="w-full p-2.5 border border-neutral-300 rounded-lg text-xs bg-white font-semibold"
              />
              <textarea
                v-model="ms.description"
                rows="2"
                placeholder="Deskripsi Milestone"
                class="w-full p-2.5 border border-neutral-300 rounded-lg text-xs bg-white text-neutral-secondary"
              ></textarea>
            </div>
          </div>
          <div v-else class="text-center py-6 text-xs text-neutral-secondary bg-neutral-tertiary/40 rounded-xl border border-dashed border-primary-base/20">
            Milestone akan otomatis terbentuk setelah Anda menambahkan item RAB di Step 2.
          </div>
        </div>

        <!-- STEP 4: Review & Submit -->
        <div v-else-if="currentStep === 4" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 space-y-6 shadow-xs">
          <h2 class="text-semibold-20 font-bold text-neutral-primary">Step 4: Konfirmasi & Kirim Campaign</h2>

          <div class="p-5 bg-neutral-tertiary rounded-xl space-y-4 text-xs">
            <div class="flex justify-between border-b border-primary-base/10 pb-2">
              <span class="text-neutral-secondary">Judul Campaign:</span>
              <span class="font-bold text-neutral-primary">{{ campaignForm.title || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-primary-base/10 pb-2">
              <span class="text-neutral-secondary">Kategori:</span>
              <span class="font-bold text-primary-base">{{ campaignForm.category }}</span>
            </div>
            <div class="flex justify-between border-b border-primary-base/10 pb-2">
              <span class="text-neutral-secondary">Target Nominal:</span>
              <span class="font-bold text-neutral-primary font-mono">{{ formatRupiah(campaignForm.target_amount) }}</span>
            </div>
            <div class="flex justify-between border-b border-primary-base/10 pb-2">
              <span class="text-neutral-secondary">Tenor & Bunga:</span>
              <span class="font-bold text-neutral-primary">{{ campaignForm.tenor_months }} Bulan ({{ campaignForm.interest_rate || 0 }}% / thn)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-secondary">Jumlah Item RAB:</span>
              <span class="font-bold text-neutral-primary">{{ budgetItems.length }} Item</span>
            </div>
          </div>

          <p class="text-xs text-neutral-secondary">
            Dengan menekan tombol kirim, campaign Anda akan tersimpan dan langsung diajukan ke Admin untuk verifikasi kelayakan.
          </p>
        </div>

        <!-- Wizard Navigation Footer Buttons -->
        <div class="flex justify-between items-center pt-4">
          <RouterLink v-if="currentStep === 1" to="/campaigns" class="no-underline">
            <BaseButton variant="outline" size="md">
              Batal
            </BaseButton>
          </RouterLink>
          <BaseButton
            v-else
            variant="outline"
            size="md"
            @click="prevStep"
          >
            ← Kembali
          </BaseButton>

          <BaseButton
            v-if="currentStep < 4"
            variant="primary"
            size="md"
            @click="nextStep"
          >
            Lanjut →
          </BaseButton>

          <BaseButton
            v-else
            variant="primary"
            size="md"
            :disabled="isLoading"
            @click="handleFinalSubmit"
          >
            {{ isLoading ? 'Mengirim...' : 'Kirim untuk Review Admin' }}
          </BaseButton>
        </div>
      </main>
    </div>
  </DefaultLayout>
</template>
