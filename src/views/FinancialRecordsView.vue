<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseFileUpload from '@/components/BaseFileUpload.vue'
import { businessService } from '@/services/business'
import { 
  TrendingUp, TrendingDown, DollarSign, PlusCircle, Filter, 
  Trash2, FileText, CheckCircle2, Clock, AlertCircle, RefreshCw, Upload, ShieldAlert
} from '@lucide/vue'

const router = useRouter()

const isLoading = ref(true)
const records = ref([])
const summary = ref({
  total_income: 0,
  total_expense: 0,
  net_amount: 0,
  record_count: 0
})

const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

const showAddModal = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isForbidden = ref(false)

const months = [
  { value: 1, name: 'Januari' },
  { value: 2, name: 'Februari' },
  { value: 3, name: 'Maret' },
  { value: 4, name: 'April' },
  { value: 5, name: 'Mei' },
  { value: 6, name: 'Juni' },
  { value: 7, name: 'Juli' },
  { value: 8, name: 'Agustus' },
  { value: 9, name: 'September' },
  { value: 10, name: 'Oktober' },
  { value: 11, name: 'November' },
  { value: 12, name: 'Desember' }
]

const years = [2026, 2025, 2024]

const form = ref({
  recordDate: new Date().toISOString().split('T')[0],
  incomeAmount: null,
  expenseAmount: null,
  note: '',
  proofType: 'receipt', // 'receipt' | 'invoice' | 'photo' | 'transfer' | 'other'
  proofUrl: 'https://via.placeholder.com/600x800.png?text=Bukti+Nota+Usaha'
})

const fetchFinancialData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  isForbidden.value = false

  try {
    const [recordsRes, summaryRes] = await Promise.all([
      businessService.getFinancialRecords({ month: selectedMonth.value, year: selectedYear.value }),
      businessService.getFinancialSummary({ month: selectedMonth.value, year: selectedYear.value })
    ])
    records.value = recordsRes?.data || []
    summary.value = summaryRes?.data || { total_income: 0, total_expense: 0, net_amount: 0, record_count: 0 }
  } catch (err) {
    if (err?.status === 403 || err?.response?.status === 403) {
      isForbidden.value = true
    } else if (err?.status === 404 || err?.response?.status === 404) {
      router.push('/business/wizard')
    } else {
      errorMessage.value = err.message || 'Gagal memuat catatan keuangan.'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchFinancialData()
})

const handleCreateRecord = async () => {
  const inc = Number(form.value.incomeAmount) || 0
  const exp = Number(form.value.expenseAmount) || 0

  if (inc <= 0 && exp <= 0) {
    errorMessage.value = 'Salah satu antara Pemasukan atau Pengeluaran harus diisi lebih dari 0.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const payload = {
    record_date: new Date(form.value.recordDate).toISOString(),
    income_amount: inc,
    expense_amount: exp,
    note: form.value.note || null,
    proofs: []
  }

  if (form.value.proofUrl.trim() !== '') {
    payload.proofs.push({
      file_url: form.value.proofUrl.trim(),
      proof_type: form.value.proofType,
      amount: inc > 0 ? inc : exp
    })
  }

  try {
    await businessService.createFinancialRecord(payload)
    successMessage.value = 'Catatan keuangan berhasil ditambahkan!'
    showAddModal.value = false
    // Reset form to null for placeholder appearance
    form.value.incomeAmount = null
    form.value.expenseAmount = null
    form.value.note = ''
    fetchFinancialData()
  } catch (err) {
    errorMessage.value = err.message || 'Gagal menyimpan catatan keuangan.'
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteRecord = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus catatan keuangan ini?')) return
  try {
    await businessService.deleteFinancialRecord(id)
    fetchFinancialData()
  } catch (err) {
    alert(err.message || 'Gagal menghapus catatan keuangan.')
  }
}

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white p-8 sm:p-10 rounded-xl border border-[#0F6E56]/40 shadow-xs w-full max-w-5xl mx-auto font-inter my-8 text-left">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
        <div>
          <h2 class="text-3xl font-semibold text-[#1F2937] font-newsreader">
            Catatan Keuangan Usaha
          </h2>
          <p class="text-sm text-[#52605D] mt-1">
            Pencatatan omzet & pengeluaran bulanan terverifikasi untuk meningkatkan limit pinjaman modal.
          </p>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            @click="showAddModal = true"
            class="px-4 py-2.5 bg-[#0F6E56] hover:bg-[#0A5744] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <PlusCircle class="w-4 h-4" />
            <span>Tambah Catatan Baru</span>
          </button>
        </div>
      </div>

      <!-- FORBIDDEN (403) BANNER -->
      <div v-if="isForbidden" class="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2">
        <div class="flex items-center gap-2 text-amber-900 font-semibold text-sm">
          <ShieldAlert class="w-5 h-5 text-amber-700 shrink-0" />
          <span>Akses Peran Peminjam Membutuhkan Persetujuan Admin</span>
        </div>
        <p class="text-xs text-amber-800">
          Status pengajuan peran Peminjam Modal Anda masih dalam proses peninjauan oleh Tim Admin. Anda dapat melihat status pengajuan peran Anda di bawah ini.
        </p>
        <button @click="router.push('/role-status')" class="px-4 py-2 bg-[#0F6E56] text-white text-xs font-semibold rounded-lg cursor-pointer">
          Cek Status Pengajuan Peran
        </button>
      </div>

      <!-- Notification Banners -->
      <div v-else-if="errorMessage" class="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
        <AlertCircle class="w-5 h-5 shrink-0 text-red-600" />
        <span class="font-medium">{{ errorMessage }}</span>
      </div>

      <div v-if="successMessage" class="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-[#0F6E56] text-sm rounded-lg flex items-center gap-2">
        <CheckCircle2 class="w-5 h-5 shrink-0" />
        <span class="font-medium">{{ successMessage }}</span>
      </div>

      <!-- Financial Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <!-- Income Summary -->
        <div class="p-5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
          <div class="flex items-center justify-between text-xs font-semibold text-emerald-800">
            <span>Total Omzet / Pemasukan</span>
            <TrendingUp class="w-4 h-4 text-emerald-600" />
          </div>
          <div class="text-2xl font-bold text-emerald-900 font-mono">
            {{ formatRupiah(summary.total_income) }}
          </div>
          <p class="text-[11px] text-emerald-700">Periode {{ months.find(m => m.value === selectedMonth)?.name }} {{ selectedYear }}</p>
        </div>

        <!-- Expense Summary -->
        <div class="p-5 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1.5">
          <div class="flex items-center justify-between text-xs font-semibold text-rose-800">
            <span>Total Pengeluaran</span>
            <TrendingDown class="w-4 h-4 text-rose-600" />
          </div>
          <div class="text-2xl font-bold text-rose-900 font-mono">
            {{ formatRupiah(summary.total_expense) }}
          </div>
          <p class="text-[11px] text-rose-700">Periode {{ months.find(m => m.value === selectedMonth)?.name }} {{ selectedYear }}</p>
        </div>

        <!-- Net Amount Summary -->
        <div class="p-5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5">
          <div class="flex items-center justify-between text-xs font-semibold text-blue-800">
            <span>Laba / Rugi Bersih (Net)</span>
            <DollarSign class="w-4 h-4 text-blue-600" />
          </div>
          <div :class="['text-2xl font-bold font-mono', summary.net_amount >= 0 ? 'text-blue-900' : 'text-red-700']">
            {{ formatRupiah(summary.net_amount) }}
          </div>
          <p class="text-[11px] text-blue-700">{{ summary.record_count }} Transaksi Tercatat</p>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#F9FAFB] rounded-xl border border-gray-200 mb-6">
        <div class="flex items-center gap-2 text-sm font-semibold text-[#1F2937]">
          <Filter class="w-4 h-4 text-[#0F6E56]" />
          <span>Filter Periode:</span>
        </div>

        <div class="flex items-center gap-3">
          <select
            v-model="selectedMonth"
            @change="fetchFinancialData"
            class="px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-[#1F2937] outline-none focus:border-[#0F6E56]"
          >
            <option v-for="m in months" :key="m.value" :value="m.value">
              {{ m.name }}
            </option>
          </select>

          <select
            v-model="selectedYear"
            @change="fetchFinancialData"
            class="px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-[#1F2937] outline-none focus:border-[#0F6E56]"
          >
            <option v-for="y in years" :key="y" :value="y">
              {{ y }}
            </option>
          </select>
        </div>
      </div>

      <!-- Records Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-xl">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-[#52605D] font-semibold">
              <th class="p-3.5">Tanggal</th>
              <th class="p-3.5">Catatan / Keterangan</th>
              <th class="p-3.5 text-right">Pemasukan</th>
              <th class="p-3.5 text-right">Pengeluaran</th>
              <th class="p-3.5 text-right">Net</th>
              <th class="p-3.5 text-center">Bukti / Proof</th>
              <th class="p-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading" class="text-center">
              <td colspan="7" class="p-8 text-[#52605D]">
                <RefreshCw class="w-5 h-5 animate-spin mx-auto text-[#0F6E56] mb-2" />
                <span>Memuat data transaksi...</span>
              </td>
            </tr>

            <tr v-else-if="records.length === 0" class="text-center">
              <td colspan="7" class="p-8 text-[#52605D]">
                Belum ada catatan keuangan untuk periode ini. Klik tombol <strong>"Tambah Catatan Baru"</strong> di atas.
              </td>
            </tr>

            <tr
              v-else
              v-for="rec in records"
              :key="rec.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="p-3.5 font-medium text-[#1F2937] whitespace-nowrap">
                {{ formatDate(rec.record_date) }}
              </td>
              <td class="p-3.5 text-[#52605D]">
                {{ rec.note || '-' }}
              </td>
              <td class="p-3.5 text-right font-mono text-emerald-700 font-semibold">
                {{ rec.income_amount > 0 ? formatRupiah(rec.income_amount) : '-' }}
              </td>
              <td class="p-3.5 text-right font-mono text-rose-700 font-semibold">
                {{ rec.expense_amount > 0 ? formatRupiah(rec.expense_amount) : '-' }}
              </td>
              <td :class="['p-3.5 text-right font-mono font-bold', rec.net_amount >= 0 ? 'text-[#0F6E56]' : 'text-rose-700']">
                {{ formatRupiah(rec.net_amount) }}
              </td>
              <td class="p-3.5 text-center">
                <span v-if="rec.proofs && rec.proofs.length > 0" class="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-full">
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>Ada Bukti</span>
                </span>
                <span v-else class="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-[#52605D] text-[11px] rounded-full">
                  <span>Tanpa Bukti</span>
                </span>
              </td>
              <td class="p-3.5 text-center whitespace-nowrap">
                <button
                  @click="handleDeleteRecord(rec.id)"
                  class="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer rounded-md hover:bg-red-50"
                  title="Hapus Catatan"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Record Modal Dialog -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl border border-[#0F6E56]/40 p-6 sm:p-8 max-w-lg w-full font-inter space-y-5 text-left shadow-lg">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 class="text-xl font-bold text-[#1F2937] font-newsreader">Tambah Catatan Keuangan</h3>
            <button @click="showAddModal = false" class="text-gray-400 hover:text-[#1F2937] text-lg font-bold">✕</button>
          </div>

          <form @submit.prevent="handleCreateRecord" class="space-y-4">
            <BaseInput
              v-model="form.recordDate"
              type="date"
              label="Tanggal Transaksi"
              variant="mint"
              :disabled="isSubmitting"
              required
            />

            <!-- Parallel 2-Column Income and Expense Inputs with items-start alignment -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <BaseInput
                v-model="form.incomeAmount"
                type="number"
                min="0"
                label="Pemasukan / Omzet (Rp)"
                placeholder="0"
                variant="mint"
                :disabled="isSubmitting"
              />
              <BaseInput
                v-model="form.expenseAmount"
                type="number"
                min="0"
                label="Pengeluaran (Rp)"
                placeholder="0"
                variant="mint"
                :disabled="isSubmitting"
              />
            </div>

            <BaseInput
              v-model="form.note"
              type="text"
              label="Keterangan / Catatan Transaksi"
              placeholder="Contoh: Penjualan 50 porsi katering / Pembelian bahan baku"
              variant="mint"
              :disabled="isSubmitting"
            />

            <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
              <span class="text-xs font-semibold text-[#1F2937] block">Lampiran Bukti Transaksi (Nota / Invoice)</span>
              
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium text-[#52605D]">Tipe Bukti</label>
                <select v-model="form.proofType" class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs">
                  <option value="receipt">Nota / Struk Belanja</option>
                  <option value="invoice">Invoice / Faktur Penjualan</option>
                  <option value="transfer">Bukti Transfer Rekening/E-Wallet</option>
                  <option value="photo">Foto Barang / Transaksi</option>
                </select>
              </div>

              <BaseFileUpload
                v-model="form.proofUrl"
                label="Unggah Foto Bukti Transaksi (Struk/Nota/Invoice)"
                accept="image/*,.pdf"
                :disabled="isSubmitting"
              />
            </div>

            <div class="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                @click="showAddModal = false"
                class="px-4 py-2.5 border border-gray-300 text-[#52605D] text-xs font-semibold rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-5 py-2.5 bg-[#0F6E56] hover:bg-[#0A5744] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <svg v-if="isSubmitting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Catatan' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </AuthLayout>
</template>
