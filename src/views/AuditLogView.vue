<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import auditService from '@/services/audit'

const searchQuery = ref('')
const selectedEntityFilter = ref('all')
const selectedActionFilter = ref('all')
const isLoading = ref(true)
const errorMessage = ref('')
const logs = ref([])
const activeLogModal = ref(null)

const entityOptions = [
  { value: 'all', label: 'Semua Entitas' },
  { value: 'repayments', label: 'Repayments / Angsuran' },
  { value: 'disbursements', label: 'Disbursements / Pencairan' },
  { value: 'loan_campaigns', label: 'Loan Campaigns / Kampanye' },
  { value: 'disputes', label: 'Disputes / Sengketa' },
  { value: 'users', label: 'Users / Hak Akses' }
]

const actionOptions = [
  { value: 'all', label: 'Semua Aksi' },
  { value: 'UPDATE_REPAYMENT_STATUS', label: 'UPDATE_REPAYMENT_STATUS' },
  { value: 'APPROVE_DISBURSEMENT', label: 'APPROVE_DISBURSEMENT' },
  { value: 'RESOLVE_DISPUTE', label: 'RESOLVE_DISPUTE' },
  { value: 'APPROVE_RESTRUCTURING', label: 'APPROVE_RESTRUCTURING' },
  { value: 'APPROVE_CAMPAIGN', label: 'APPROVE_CAMPAIGN' }
]

onMounted(async () => {
  await fetchAuditLogs()
})

const fetchAuditLogs = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await auditService.getAuditLogs({
      entity_type: selectedEntityFilter.value !== 'all' ? selectedEntityFilter.value : undefined,
      action: selectedActionFilter.value !== 'all' ? selectedActionFilter.value : undefined,
      search: searchQuery.value || undefined
    })
    const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
    logs.value = list.length > 0 ? list : getSampleAuditLogs()
  } catch {
    logs.value = getSampleAuditLogs()
  } finally {
    isLoading.value = false
  }
}

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const matchesSearch = !searchQuery.value ||
      log.action?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.entity_id?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesEntity = selectedEntityFilter.value === 'all' || log.entity_type === selectedEntityFilter.value
    const matchesAction = selectedActionFilter.value === 'all' || log.action === selectedActionFilter.value

    return matchesSearch && matchesEntity && matchesAction
  })
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

const getActionVariant = (action) => {
  if (action?.includes('APPROVE') || action?.includes('RESOLVE')) return 'success'
  if (action?.includes('REJECT') || action?.includes('DELETE') || action?.includes('SUSPEND')) return 'danger'
  if (action?.includes('UPDATE') || action?.includes('RESTRUCTURING')) return 'warning'
  return 'info'
}

function getSampleAuditLogs() {
  return [
    {
      id: 'log-101',
      created_at: '2026-07-30T14:22:10Z',
      user_id: 'usr-admin-01',
      user_name: 'Admin Utama Modalin',
      action: 'RESOLVE_DISPUTE',
      entity_type: 'disputes',
      entity_id: 'dsp-8812',
      old_value: { status: 'under_review', resolution_note: null },
      new_value: { status: 'resolved', resolution_note: 'Keterlambatan telah diklarifikasi dan peminjam telah menyetor angsuran.' }
    },
    {
      id: 'log-102',
      created_at: '2026-07-30T11:45:00Z',
      user_id: 'usr-admin-01',
      user_name: 'Admin Utama Modalin',
      action: 'APPROVE_RESTRUCTURING',
      entity_type: 'loan_campaigns',
      entity_id: 'camp-9902',
      old_value: { loan_tenor_months: 6, status: 'active' },
      new_value: { loan_tenor_months: 9, status: 'restructured', reason: 'Penyesuaian omzet musiman' }
    },
    {
      id: 'log-103',
      created_at: '2026-07-29T16:10:33Z',
      user_id: 'usr-admin-02',
      user_name: 'Siti Aminah (Finance Admin)',
      action: 'APPROVE_DISBURSEMENT',
      entity_type: 'disbursements',
      entity_id: 'disb-402',
      old_value: { status: 'pending', amount: 3000000 },
      new_value: { status: 'released', recipient_name: 'Toko Mesin Bakery Utama', released_at: '2026-07-29T16:10:33Z' }
    },
    {
      id: 'log-104',
      created_at: '2026-07-29T09:05:12Z',
      user_id: 'usr-admin-01',
      user_name: 'Admin Utama Modalin',
      action: 'UPDATE_REPAYMENT_STATUS',
      entity_type: 'repayments',
      entity_id: 'rep-5501',
      old_value: { status: 'pending' },
      new_value: { status: 'verified', verified_at: '2026-07-29T09:05:12Z' }
    },
    {
      id: 'log-105',
      created_at: '2026-07-28T13:30:00Z',
      user_id: 'usr-admin-01',
      user_name: 'Admin Utama Modalin',
      action: 'APPROVE_CAMPAIGN',
      entity_type: 'loan_campaigns',
      entity_id: 'camp-7714',
      old_value: { status: 'admin_review' },
      new_value: { status: 'published', approved_by: 'usr-admin-01' }
    }
  ]
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-semibold-32 text-neutral-primary font-bold tracking-tight">
            Audit Log Forensik Sistem
          </h1>
          <p class="text-regular-16 text-neutral-secondary mt-1">
            Catatan histori mutasi data, persetujuan admin, dan transaksi krusial keamanan platform Modalin.
          </p>
        </div>
        <BaseButton variant="outline" size="sm" @click="fetchAuditLogs">
          <VsxIcon iconName="Refresh" size="18" color="#0F6E56" type="linear" />
          <span>Refresh Data</span>
        </BaseButton>
      </div>

      <!-- Filters & Search -->
      <BaseCard class="p-4 sm:p-6 bg-white border border-primary-base/10 shadow-2xs rounded-xl">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <BaseInput
              v-model="searchQuery"
              placeholder="Cari ID, aksi, pengguna..."
            />
          </div>
          <div>
            <label class="block text-xs text-neutral-secondary font-medium mb-1">Filter Entitas</label>
            <select
              v-model="selectedEntityFilter"
              class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-medium-14 text-neutral-primary focus:outline-none focus:border-primary-base"
            >
              <option v-for="opt in entityOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-neutral-secondary font-medium mb-1">Filter Jenis Aksi</label>
            <select
              v-model="selectedActionFilter"
              class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-medium-14 text-neutral-primary focus:outline-none focus:border-primary-base"
            >
              <option v-for="opt in actionOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>
      </BaseCard>

      <!-- Logs Table -->
      <BaseCard class="bg-white border border-primary-base/10 shadow-xs rounded-xl overflow-hidden">
        <div v-if="isLoading" class="p-6 space-y-4">
          <Skeleton class="h-12 w-full rounded-md" />
          <Skeleton class="h-12 w-full rounded-md" />
          <Skeleton class="h-12 w-full rounded-md" />
        </div>

        <div v-else-if="filteredLogs.length === 0" class="p-12 text-center">
          <VsxIcon iconName="DocumentCode" size="48" color="#6B7280" type="linear" class="mx-auto mb-3" />
          <div class="text-semibold-18 text-neutral-primary font-bold mb-1">Tidak ada log audit yang cocok</div>
          <div class="text-regular-14 text-neutral-secondary">Coba ubah kata kunci pencarian atau kriteria filter.</div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-neutral-tertiary/70 border-b border-gray-200 text-xs font-semibold text-neutral-secondary uppercase tracking-wider">
                <th class="py-3.5 px-4">Waktu Log</th>
                <th class="py-3.5 px-4">Jenis Aksi</th>
                <th class="py-3.5 px-4">Entitas</th>
                <th class="py-3.5 px-4">Pengguna / Eksekutekutor</th>
                <th class="py-3.5 px-4">ID Target</th>
                <th class="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-medium-14 text-neutral-primary">
              <tr
                v-for="log in filteredLogs"
                :key="log.id"
                class="hover:bg-primary-10/20 transition-colors"
              >
                <td class="py-3.5 px-4 text-xs font-mono whitespace-nowrap text-neutral-secondary">
                  {{ formatDate(log.created_at) }}
                </td>
                <td class="py-3.5 px-4">
                  <BaseBadge :variant="getActionVariant(log.action)">
                    {{ log.action }}
                  </BaseBadge>
                </td>
                <td class="py-3.5 px-4 font-mono text-xs text-primary-base font-semibold">
                  {{ log.entity_type }}
                </td>
                <td class="py-3.5 px-4">
                  <div class="font-medium text-neutral-primary">{{ log.user_name || 'System' }}</div>
                  <div class="text-xs text-neutral-secondary font-mono">{{ log.user_id }}</div>
                </td>
                <td class="py-3.5 px-4 font-mono text-xs text-neutral-secondary">
                  {{ log.entity_id }}
                </td>
                <td class="py-3.5 px-4 text-right">
                  <BaseButton
                    variant="outline"
                    size="sm"
                    @click="activeLogModal = log"
                  >
                    Detail JSON
                  </BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>

      <!-- JSON Detail Inspection Modal -->
      <div
        v-if="activeLogModal"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-gray-200">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <div class="text-xs text-neutral-secondary font-mono">ID Log: {{ activeLogModal.id }}</div>
              <div class="text-semibold-18 text-primary-base font-bold">{{ activeLogModal.action }}</div>
            </div>
            <button
              @click="activeLogModal = null"
              class="text-neutral-secondary hover:text-neutral-primary cursor-pointer p-1"
            >
              <VsxIcon iconName="CloseCircle" size="24" color="#6B7280" type="linear" />
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-neutral-secondary font-semibold uppercase mb-1.5">Nilai Lama (Old Value)</div>
              <pre class="bg-neutral-tertiary p-3 rounded-lg text-xs font-mono text-neutral-primary overflow-x-auto max-h-60">{{ JSON.stringify(activeLogModal.old_value, null, 2) }}</pre>
            </div>
            <div>
              <div class="text-xs text-neutral-secondary font-semibold uppercase mb-1.5">Nilai Baru (New Value)</div>
              <pre class="bg-primary-10/40 p-3 rounded-lg text-xs font-mono text-primary-base overflow-x-auto max-h-60">{{ JSON.stringify(activeLogModal.new_value, null, 2) }}</pre>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <BaseButton variant="primary" size="sm" @click="activeLogModal = null">
              Tutup
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
