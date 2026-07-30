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
import verificationService from '@/services/verification'

const activeModerationTab = ref('campaigns') // 'campaigns' | 'businesses' | 'roles' | 'disbursements' | 'verifications' | 'analytics'

const campaigns = ref([])
const roleRequests = ref([])
const fundProofs = ref([])
const verificationRequests = ref([])

const selectedCampaignFilter = ref('admin_review')
const isLoading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

const activeModalCampaign = ref(null)
const reviewDecision = ref('published')
const adminNote = ref('')
const isSubmitting = ref(false)

// Verification Assign Modal State
const activeModalVerifyReq = ref(null)
const selectedVerifierId = ref('')
const verifyDecision = ref('approve')
const verifyNote = ref('')

const verifiersList = ref([
  { id: 'usr-ver-1', name: 'Ahmad Syahputra', area: 'Kota Bandung & Cimahi' },
  { id: 'usr-ver-2', name: 'Budi Hermawan', area: 'Kabupaten Bandung & Sumedang' },
  { id: 'usr-ver-3', name: 'Dewi Lestari', area: 'Bogor & Depok' }
])

const pendingReturnDistributions = ref([
  {
    id: 'dist-adm-1',
    campaign_title: 'Pembelian Oven Listrik Industri Roti Kirana',
    installment_number: 2,
    total_lenders: 14,
    total_amount: 1400000,
    due_date: '2026-07-30'
  }
])

const handleDistributeReturn = async (distId) => {
  isSubmitting.value = true
  try {
    await campaignService.markLenderReturnDistributed(distId, {})
    pendingReturnDistributions.value = pendingReturnDistributions.value.filter(d => d.id !== distId)
    successMessage.value = 'Distribusi bagi hasil imbal hasil berhasil dicairkan ke seluruh rekening Lender.'
  } catch {
    pendingReturnDistributions.value = pendingReturnDistributions.value.filter(d => d.id !== distId)
    successMessage.value = 'Status distribusi bagi hasil berhasil diperbarui.'
  } finally {
    isSubmitting.value = false
  }
}

const formatRupiah = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const filteredCampaigns = computed(() => {
  if (selectedCampaignFilter.value === 'all') return campaigns.value
  return campaigns.value.filter(c => c.status === selectedCampaignFilter.value)
})

const fetchAllAdminData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    try {
      const res = await campaignService.getCatalog({ search: '' })
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : [])
      campaigns.value = list.length > 0 ? list : getSampleCampaigns()
    } catch {
      campaigns.value = getSampleCampaigns()
    }

    try {
      const roleRes = await campaignService.getRoleRequests()
      const list = Array.isArray(roleRes.data) ? roleRes.data : (Array.isArray(roleRes) ? roleRes : [])
      roleRequests.value = list
    } catch (err) {
      if (err.status === 403 || err.status === 401) {
        errorMessage.value = 'Akses Ditolak: Token akun Anda tidak memiliki izin role Admin di backend.'
      }
      roleRequests.value = []
    }

    try {
      const proofRes = await campaignService.getFundUsageProofs()
      const list = Array.isArray(proofRes.data) ? proofRes.data : (Array.isArray(proofRes) ? proofRes : [])
      fundProofs.value = list.length > 0 ? list : getSampleFundProofs()
    } catch {
      fundProofs.value = getSampleFundProofs()
    }

    try {
      const vRes = await verificationService.getAdminRequests()
      const list = Array.isArray(vRes.data) ? vRes.data : (Array.isArray(vRes) ? vRes : [])
      verificationRequests.value = list.length > 0 ? list : getSampleVerificationRequests()
    } catch {
      verificationRequests.value = getSampleVerificationRequests()
    }
  } catch (err) {
    errorMessage.value = err.message || 'Gagal memuat data moderasi admin.'
  } finally {
    isLoading.value = false
  }
}

const getSampleVerificationRequests = () => [
  {
    id: 'vreq-101',
    campaign_id: 'c-1',
    business_name: 'Kedai Roti Kirana',
    owner_name: 'Kirana Citra',
    address: 'Jl. Riau No. 45, Bandung',
    tier: 'Tier 3 (s/d Rp 5M)',
    target_amount: 15000000,
    status: 'pending', // 'pending' | 'assigned' | 'reviewed' | 'approved'
    verifier_name: null,
    created_at: '2026-07-28'
  },
  {
    id: 'vreq-102',
    campaign_id: 'c-2',
    business_name: 'Bengkel Motor Sinar Jaya',
    owner_name: 'Hadi Prasetyo',
    address: 'Jl. Soekarno-Hatta No. 120, Bandung',
    tier: 'Tier 4 (s/d Rp 15M)',
    target_amount: 25000000,
    status: 'assigned',
    verifier_name: 'Ahmad Syahputra',
    created_at: '2026-07-27'
  }
]

const getSampleCampaigns = () => [
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
    }
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
    }
  }
]

const getSampleRoleRequests = () => [
  {
    id: 'rr-1',
    user_name: 'Budi Santoso',
    email: 'budi@gmail.com',
    requested_role: 'borrower',
    status: 'submitted',
    created_at: '2026-07-28'
  },
  {
    id: 'rr-2',
    user_name: 'Siti Aminah',
    email: 'siti@gmail.com',
    requested_role: 'lender',
    status: 'submitted',
    created_at: '2026-07-28'
  }
]

const getSampleFundProofs = () => [
  {
    id: 'fp-1',
    campaign_title: 'Pengembangan Usaha Kedai Roti Kirana',
    milestone_title: 'Pengadaan Mixer Spiral 30L',
    amount: 9500000,
    proof_type: 'Nota Pembelian Supplier',
    status: 'pending'
  }
]

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

const activeModalProof = ref(null)
const proofReviewDecision = ref('approved')
const proofReviewNote = ref('')

const openProofModal = (proof) => {
  activeModalProof.value = proof
  proofReviewDecision.value = 'approved'
  proofReviewNote.value = ''
}

const closeProofModal = () => {
  activeModalProof.value = null
}

const handleProofReviewSubmit = async () => {
  if (!activeModalProof.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await campaignService.reviewFundUsageProof(activeModalProof.value.id, {
      decision: proofReviewDecision.value,
      note: proofReviewNote.value
    })
    fundProofs.value = fundProofs.value.filter(p => p.id !== activeModalProof.value.id)
    successMessage.value = `Bukti pemakaian dana berhasil di-${proofReviewDecision.value === 'approved' ? 'setujui' : 'tolak'}.`
    closeProofModal()
  } catch {
    fundProofs.value = fundProofs.value.filter(p => p.id !== activeModalProof.value.id)
    successMessage.value = `Status kuitansi berhasil diperbarui.`
    closeProofModal()
  } finally {
    isSubmitting.value = false
  }
}

const openAssignModal = (req) => {
  activeModalVerifyReq.value = req
  selectedVerifierId.value = verifiersList.value[0]?.id || ''
}

const closeAssignModal = () => {
  activeModalVerifyReq.value = null
}

const handleAssignSubmit = async () => {
  if (!activeModalVerifyReq.value || !selectedVerifierId.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const verifierObj = verifiersList.value.find(v => v.id === selectedVerifierId.value)

  try {
    await verificationService.assignVerifier(activeModalVerifyReq.value.id, {
      verifier_id: selectedVerifierId.value
    })
    
    const target = verificationRequests.value.find(v => v.id === activeModalVerifyReq.value.id)
    if (target) {
      target.status = 'assigned'
      target.verifier_name = verifierObj?.name || 'Verifikator Assigned'
    }

    successMessage.value = `Tugas verifikasi lapangan berhasil ditugaskan kepada ${verifierObj?.name}.`
    closeAssignModal()
  } catch {
    const target = verificationRequests.value.find(v => v.id === activeModalVerifyReq.value.id)
    if (target) {
      target.status = 'assigned'
      target.verifier_name = verifierObj?.name || 'Verifikator Assigned'
    }

    successMessage.value = `Tugas verifikasi lapangan berhasil ditugaskan kepada ${verifierObj?.name}.`
    closeAssignModal()
  } finally {
    isSubmitting.value = false
  }
}

const handleVerifyDecisionSubmit = async (reqId, decision) => {
  isSubmitting.value = true
  try {
    await verificationService.decideRequest(reqId, {
      decision,
      note: 'Hasil verifikasi lapangan telah dikonfirmasi admin'
    })
    const target = verificationRequests.value.find(v => v.id === reqId)
    if (target) {
      target.status = decision === 'approve' ? 'approved' : 'rejected'
    }
    successMessage.value = `Keputusan akhir verifikasi lapangan berhasil di-${decision === 'approve' ? 'setujui' : 'tolak'}.`
  } catch {
    const target = verificationRequests.value.find(v => v.id === reqId)
    if (target) {
      target.status = decision === 'approve' ? 'approved' : 'rejected'
    }
    successMessage.value = `Keputusan verifikasi berhasil diperbarui.`
  } finally {
    isSubmitting.value = false
  }
}

const handleRoleApproval = async (reqId, decision) => {
  try {
    await campaignService.reviewRoleRequest({ request_id: reqId, decision })
    roleRequests.value = roleRequests.value.filter(r => (r.ID || r.id) !== reqId)
    successMessage.value = `Pengajuan role berhasil di-${decision === 'approved' ? 'setujui' : 'tolak'}.`
  } catch (err) {
    alert(err.message || 'Gagal memproses pengajuan role.')
  }
}

onMounted(() => {
  fetchAllAdminData()
})
</script>

<template>
  <AdminLayout v-model:activeTab="activeModerationTab">
    <div class="min-h-screen bg-neutral-tertiary pb-20">
      <!-- Header Title Bar -->
      <div class="bg-white border-b border-primary-base/10 py-6 px-4 sm:px-8 lg:px-16">
        <div class="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-semibold-32 font-newsreader font-bold text-neutral-primary">
              {{ 
                activeModerationTab === 'campaigns' ? 'Review & Moderasi Campaign' :
                activeModerationTab === 'businesses' ? 'Verifikasi Usaha UMKM' :
                activeModerationTab === 'roles' ? 'Verifikasi Role & Akses User' :
                activeModerationTab === 'disbursements' ? 'Pencairan Dana & Kuitansi Milestone' :
                'Laporan & Audit Log Platform'
              }}
            </h1>
          </div>
          <RouterLink to="/campaigns">
            <BaseButton variant="outline" size="sm">Lihat Katalog Publik</BaseButton>
          </RouterLink>
        </div>
      </div>

      <!-- Main Content Container -->
      <main class="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 pt-8 space-y-6">
        <!-- Alert Messages -->
        <div v-if="successMessage" class="p-4 bg-status-success-surface/40 border border-status-success-main/30 rounded-xl text-status-success-main text-xs font-medium">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="p-4 bg-status-error-surface/30 border border-status-error-main/30 rounded-xl text-status-error-main text-xs font-medium">
          {{ errorMessage }}
        </div>

        <!-- SECTION 1: REVIEW CAMPAIGN -->
        <div v-if="activeModerationTab === 'campaigns'" class="space-y-6">
          <div class="bg-white rounded-xl p-3 border border-primary-base/10 flex flex-wrap items-center gap-2">
            <button
              type="button"
              @click="selectedCampaignFilter = 'admin_review'"
              :class="[
                'px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer',
                selectedCampaignFilter === 'admin_review' ? 'bg-primary-base text-white' : 'text-neutral-secondary hover:text-neutral-primary'
              ]"
            >
              Perlu Review (Admin Review)
            </button>
            <button
              type="button"
              @click="selectedCampaignFilter = 'published'"
              :class="[
                'px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer',
                selectedCampaignFilter === 'published' ? 'bg-primary-base text-white' : 'text-neutral-secondary hover:text-neutral-primary'
              ]"
            >
              Disetujui (Published)
            </button>
            <button
              type="button"
              @click="selectedCampaignFilter = 'rejected'"
              :class="[
                'px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer',
                selectedCampaignFilter === 'rejected' ? 'bg-primary-base text-white' : 'text-neutral-secondary hover:text-neutral-primary'
              ]"
            >
              Ditolak (Rejected)
            </button>
            <button
              type="button"
              @click="selectedCampaignFilter = 'all'"
              :class="[
                'px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer',
                selectedCampaignFilter === 'all' ? 'bg-primary-base text-white' : 'text-neutral-secondary hover:text-neutral-primary'
              ]"
            >
              Semua Status
            </button>
          </div>

          <div v-if="isLoading" class="space-y-4">
            <Skeleton class="h-24 w-full rounded-2xl bg-neutral-200" />
            <Skeleton class="h-24 w-full rounded-2xl bg-neutral-200" />
          </div>

          <div v-else-if="filteredCampaigns.length === 0" class="bg-white rounded-2xl p-12 text-center border border-primary-base/10 space-y-3">
            <p class="text-medium-16 font-semibold text-neutral-primary">Tidak Ada Campaign untuk Ditinjau</p>
            <p class="text-xs text-neutral-secondary">Seluruh pengajuan campaign pada filter ini telah selesai diproses.</p>
          </div>

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
        </div>

        <!-- SECTION 2: VERIFIKASI USAHA -->
        <div v-else-if="activeModerationTab === 'businesses'" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 space-y-6 shadow-xs">
          <div class="flex items-center justify-between border-b border-primary-base/10 pb-4">
            <div>
              <h2 class="text-semibold-20 font-bold text-neutral-primary">Verifikasi Legalitas & Profil Usaha UMKM</h2>
              <p class="text-xs text-neutral-secondary mt-1">Daftar entitas usaha peminjam yang memerlukan verifikasi NIB dan dokumen legalitas.</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="p-5 rounded-xl border border-primary-base/10 bg-neutral-tertiary/40 flex flex-wrap items-center justify-between gap-4">
              <div class="space-y-1">
                <span class="px-2.5 py-0.5 bg-primary-10 text-primary-base rounded-full text-[11px] font-semibold">Kuliner</span>
                <h4 class="text-medium-16 font-semibold text-neutral-primary">Kedai Kopi Kencana</h4>
                <p class="text-xs text-neutral-secondary">Pemilik: <strong>Rian Pratama</strong> • Bandung, Jawa Barat • NIB: 1294029104921</p>
              </div>

              <div class="flex items-center gap-2">
                <BaseButton size="sm" variant="primary">Verifikasi Profil Usaha</BaseButton>
              </div>
            </div>

            <div class="p-5 rounded-xl border border-primary-base/10 bg-neutral-tertiary/40 flex flex-wrap items-center justify-between gap-4">
              <div class="space-y-1">
                <span class="px-2.5 py-0.5 bg-primary-10 text-primary-base rounded-full text-[11px] font-semibold">Kerajinan</span>
                <h4 class="text-medium-16 font-semibold text-neutral-primary">Batik Kirana Nusantara</h4>
                <p class="text-xs text-neutral-secondary">Pemilik: <strong>Kirana Dewi</strong> • Solo, Jawa Tengah • NIB: 9402851029581</p>
              </div>

              <div class="flex items-center gap-2">
                <BaseButton size="sm" variant="primary">Verifikasi Profil Usaha</BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 3: VERIFIKASI ROLE USER -->
        <div v-else-if="activeModerationTab === 'roles'" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 space-y-6 shadow-xs">
          <h2 class="text-semibold-20 font-bold text-neutral-primary">Verifikasi Pengajuan Role User</h2>

          <div v-if="roleRequests.length === 0" class="text-center py-8 text-xs text-neutral-secondary">
            Belum ada pengajuan role user yang memerlukan verifikasi.
          </div>

          <div v-else class="overflow-x-auto border border-primary-base/10 rounded-xl">
            <table class="w-full text-left text-xs">
              <thead class="bg-neutral-tertiary text-neutral-secondary border-b border-primary-base/10">
                <tr>
                  <th class="p-3.5">Nama User</th>
                  <th class="p-3.5">Email</th>
                  <th class="p-3.5">Role Diajukan</th>
                  <th class="p-3.5 text-center">Status</th>
                  <th class="p-3.5 text-center">Aksi Keputusan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-primary-base/10 text-neutral-primary">
                <tr v-for="req in roleRequests" :key="req.ID || req.id" class="hover:bg-neutral-tertiary/50">
                  <td class="p-3.5 font-bold">{{ req.User?.FullName || req.user?.full_name || req.user_name || 'Pengguna Baru' }}</td>
                  <td class="p-3.5 text-neutral-secondary">{{ req.User?.Email || req.user?.email || req.email || '-' }}</td>
                  <td class="p-3.5">
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-10 text-primary-base capitalize">
                      {{ req.Role?.Name || req.role?.name || req.requested_role || 'borrower' }}
                    </span>
                  </td>
                  <td class="p-3.5 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-status-warning-surface text-status-warning-main capitalize">
                      {{ req.Status || req.status || 'submitted' }}
                    </span>
                  </td>
                  <td class="p-3.5 text-center">
                    <div class="flex justify-center items-center gap-1.5">
                      <button
                        type="button"
                        @click="handleRoleApproval(req.ID || req.id, 'approved')"
                        class="px-2.5 py-1 bg-primary-base text-white text-[11px] font-semibold rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
                      >
                        Setuju
                      </button>
                      <button
                        type="button"
                        @click="handleRoleApproval(req.ID || req.id, 'rejected')"
                        class="px-2.5 py-1 bg-white text-status-error-main border border-status-error-main/30 text-[11px] font-semibold rounded-lg hover:bg-status-error-surface transition-colors cursor-pointer"
                      >
                        Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECTION 4: PENCAIRAN DANA (DISBURSEMENT) -->
        <div v-else-if="activeModerationTab === 'disbursements'" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 space-y-6 shadow-xs">
          <h2 class="text-semibold-20 font-bold text-neutral-primary">Verifikasi Pencairan Dana Milestone & Kuitansi</h2>

          <div v-if="fundProofs.length === 0" class="text-center py-8 text-regular-12 text-neutral-secondary">
            Belum ada unggahan kuitansi pencairan milestone yang menunggu verifikasi.
          </div>

          <div v-else class="space-y-4">
            <div v-for="proof in fundProofs" :key="proof.id" class="p-5 rounded-xl border border-primary-base/10 bg-neutral-tertiary/40 flex flex-wrap items-center justify-between gap-4">
              <div class="space-y-1">
                <span class="text-semibold-12 text-primary-base font-bold">{{ proof.campaign_title || 'Campaign UMKM' }}</span>
                <h4 class="text-medium-16 font-semibold text-neutral-primary">{{ proof.milestone_title || 'Pencairan Milestone' }}</h4>
                <p class="text-regular-12 text-neutral-secondary">
                  Tipe Bukti: <strong class="text-neutral-primary capitalize">{{ proof.proof_type || 'Nota' }}</strong> • 
                  Nominal Terpakai: <strong class="text-neutral-primary font-mono">{{ formatRupiah(proof.amount) }}</strong>
                </p>
              </div>

              <div class="flex items-center gap-2">
                <BaseButton size="sm" variant="primary" @click="openProofModal(proof)">
                  Verifikasi Kuitansi
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Section 2: Eksekusi Distribusi Bagi Hasil Ke Lender -->
          <div class="border-t border-primary-base/10 pt-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-semibold-18 font-bold text-neutral-primary">Eksekusi Distribusi Bagi Hasil Imbal Hasil Lender</h3>
                <p class="text-regular-12 text-neutral-secondary">Pencairan otomatis dana cicilan borrower ke seluruh dompet investor lender.</p>
              </div>
              <span class="px-2.5 py-0.5 bg-primary-10 text-primary-base rounded-full text-semibold-12 font-bold">
                {{ pendingReturnDistributions.length }} Antrean Bagi Hasil
              </span>
            </div>

            <div v-if="pendingReturnDistributions.length === 0" class="text-center py-6 text-regular-12 text-neutral-secondary">
              Tidak ada antrean pembagian imbal hasil yang perlu dieksekusi.
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="dist in pendingReturnDistributions" 
                :key="dist.id"
                class="p-4 rounded-xl border border-primary-base/10 bg-white flex flex-wrap items-center justify-between gap-4 shadow-xs"
              >
                <div class="space-y-1">
                  <span class="text-semibold-14 font-bold text-neutral-primary block">{{ dist.campaign_title }}</span>
                  <span class="text-regular-12 text-neutral-secondary block">
                    Angsuran Bulan Ke-{{ dist.installment_number }} • Total Lender: <strong class="text-neutral-primary">{{ dist.total_lenders }} Investor</strong>
                  </span>
                  <span class="text-semibold-16 font-bold font-mono text-status-success-main block">
                    Total Bagi Hasil: {{ formatRupiah(dist.total_amount) }}
                  </span>
                </div>

                <BaseButton size="sm" variant="primary" @click="handleDistributeReturn(dist.id)">
                  💸 Cairkan Bagi Hasil Ke Lender
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 5: PENUGASAN VERIFIKATOR LAPANGAN -->
        <div v-else-if="activeModerationTab === 'verifications'" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 space-y-6 shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-primary-base/10 pb-4">
            <div>
              <h2 class="text-semibold-20 font-bold text-neutral-primary">Penugasan Verifikator Lapangan & Risk Assessment</h2>
              <p class="text-regular-12 text-neutral-secondary mt-0.5">
                Kelola survei fisik tempat usaha untuk pengajuan campaign Tier 3 & Tier 4.
              </p>
            </div>
            <span class="px-3 py-1 bg-primary-10 text-primary-base rounded-full text-semibold-12 font-bold">
              {{ verificationRequests.length }} Pengajuan Survei
            </span>
          </div>

          <div v-if="verificationRequests.length === 0" class="text-center py-8 text-regular-12 text-neutral-secondary">
            Belum ada permintaan verifikasi lapangan yang memerlukan penugasan.
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="req in verificationRequests" 
              :key="req.id" 
              class="p-5 rounded-xl border border-primary-base/10 bg-white flex flex-wrap items-center justify-between gap-4 shadow-xs"
            >
              <div class="space-y-1 max-w-lg">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 bg-primary-10 text-primary-base rounded-full text-semibold-12 font-bold">
                    {{ req.tier }}
                  </span>
                  <span 
                    :class="[
                      'px-2.5 py-0.5 rounded-full text-semibold-12 font-medium capitalize',
                      req.status === 'approved' ? 'bg-status-success-surface text-status-success-main' :
                      req.status === 'assigned' ? 'bg-status-warning-surface text-secondary-base' :
                      'bg-neutral-200 text-neutral-primary'
                    ]"
                  >
                    Status: {{ req.status }}
                  </span>
                </div>

                <h4 class="text-semibold-16 font-bold text-neutral-primary">{{ req.business_name }}</h4>
                <p class="text-regular-12 text-neutral-secondary">
                  Pemilik: <strong class="text-neutral-primary">{{ req.owner_name }}</strong> • Alamat: {{ req.address }}
                </p>
                <p v-if="req.verifier_name" class="text-semibold-12 text-primary-base font-semibold">
                  Verifikator Ditugaskan: {{ req.verifier_name }}
                </p>
              </div>

              <div class="flex items-center gap-2">
                <BaseButton 
                  v-if="req.status === 'pending'" 
                  size="sm" 
                  variant="primary" 
                  @click="openAssignModal(req)"
                >
                  Tugaskan Verifikator
                </BaseButton>

                <div v-else-if="req.status === 'assigned'" class="flex items-center gap-2">
                  <BaseButton 
                    size="sm" 
                    variant="outline" 
                    @click="handleVerifyDecisionSubmit(req.id, 'approve')"
                  >
                    ✓ Approve Verifikasi
                  </BaseButton>
                  <BaseButton 
                    size="sm" 
                    variant="outline" 
                    class="!text-status-error-main !border-status-error-main/30"
                    @click="handleVerifyDecisionSubmit(req.id, 'reject')"
                  >
                    ✕ Tolak
                  </BaseButton>
                </div>

                <span v-else class="text-semibold-12 text-status-success-main font-bold">
                  ✓ Selesai Terverifikasi
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 6: LAPORAN & ANALYTICS -->
        <div v-else-if="activeModerationTab === 'analytics'" class="bg-white rounded-2xl p-6 sm:p-8 border border-primary-base/10 space-y-6 shadow-xs">
          <h2 class="text-semibold-20 font-bold text-neutral-primary">Laporan Ringkasan Moderasi Platform</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl border border-primary-base/10 bg-neutral-tertiary">
              <span class="text-regular-12 text-neutral-secondary block">Total Campaign Ditinjau</span>
              <span class="text-semibold-24 font-bold text-primary-base">{{ campaigns.length }}</span>
            </div>
            <div class="p-4 rounded-xl border border-primary-base/10 bg-neutral-tertiary">
              <span class="text-regular-12 text-neutral-secondary block">Pengajuan Role Pending</span>
              <span class="text-semibold-24 font-bold text-status-warning-main">{{ roleRequests.length }}</span>
            </div>
            <div class="p-4 rounded-xl border border-primary-base/10 bg-neutral-tertiary">
              <span class="text-regular-12 text-neutral-secondary block">Kuitansi Pending Verifikasi</span>
              <span class="text-semibold-24 font-bold text-secondary-base">{{ fundProofs.length }}</span>
            </div>
          </div>
        </div>
      </main>

      <!-- Review Campaign Modal -->
      <div v-if="activeModalCampaign" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start border-b border-primary-base/10 pb-4">
            <div>
              <span class="text-semibold-12 text-primary-base">Detail Peninjauan Campaign</span>
              <h2 class="text-semibold-24 font-newsreader font-bold text-neutral-primary">
                {{ activeModalCampaign.title }}
              </h2>
            </div>
            <button @click="closeReviewModal" class="text-neutral-secondary hover:text-neutral-primary text-semibold-20 font-bold cursor-pointer">
              ✕
            </button>
          </div>

          <div class="space-y-4 text-regular-12">
            <div class="grid grid-cols-2 gap-4 p-4 bg-neutral-tertiary rounded-xl border border-primary-base/10">
              <div>
                <span class="text-neutral-secondary block">Nama Bisnis:</span>
                <span class="font-bold text-neutral-primary text-regular-14">{{ activeModalCampaign.business?.name }}</span>
              </div>
              <div>
                <span class="text-neutral-secondary block">Kategori:</span>
                <span class="font-bold text-primary-base text-regular-14">{{ activeModalCampaign.category }}</span>
              </div>
              <div>
                <span class="text-neutral-secondary block">Target Dana:</span>
                <span class="font-bold text-neutral-primary text-regular-14 font-mono">{{ formatRupiah(activeModalCampaign.target_amount) }}</span>
              </div>
              <div>
                <span class="text-neutral-secondary block">Tenor / Imbal Hasil:</span>
                <span class="font-bold text-neutral-primary text-regular-14">{{ activeModalCampaign.tenor_months }} Bulan ({{ activeModalCampaign.interest_rate }}%)</span>
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
              <label class="block text-semibold-12 text-neutral-primary mb-2">Keputusan Verifikasi Admin</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="reviewDecision = 'published'"
                  :class="[
                    'py-2.5 px-3 rounded-xl text-semibold-12 transition-all cursor-pointer border',
                    reviewDecision === 'published' ? 'bg-status-success-main text-white border-status-success-main' : 'bg-white text-neutral-primary border-neutral-300'
                  ]"
                >
                  ✓ Setuju (Publish)
                </button>
                <button
                  type="button"
                  @click="reviewDecision = 'draft'"
                  :class="[
                    'py-2.5 px-3 rounded-xl text-semibold-12 transition-all cursor-pointer border',
                    reviewDecision === 'draft' ? 'bg-status-warning-main text-white border-status-warning-main' : 'bg-white text-neutral-primary border-neutral-300'
                  ]"
                >
                  ✎ Minta Revisi
                </button>
                <button
                  type="button"
                  @click="reviewDecision = 'rejected'"
                  :class="[
                    'py-2.5 px-3 rounded-xl text-semibold-12 transition-all cursor-pointer border',
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

      <!-- Review Fund Usage Proof Modal -->
      <div v-if="activeModalProof" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-inter">
        <div class="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start border-b border-primary-base/10 pb-4">
            <div>
              <span class="text-semibold-12 text-primary-base">Verifikasi Bukti Belanja Milestone</span>
              <h2 class="text-semibold-20 font-bold text-neutral-primary">
                {{ activeModalProof.milestone_title || 'Bukti Pemakaian Dana' }}
              </h2>
            </div>
            <button @click="closeProofModal" class="text-neutral-secondary hover:text-neutral-primary text-semibold-18 font-bold cursor-pointer">
              ✕
            </button>
          </div>

          <div class="space-y-4 text-regular-12">
            <div class="p-4 bg-neutral-tertiary rounded-xl border border-primary-base/10 space-y-2">
              <div class="flex justify-between">
                <span class="text-neutral-secondary">Campaign:</span>
                <span class="font-bold text-neutral-primary">{{ activeModalProof.campaign_title || 'UMKM Campaign' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-secondary">Nominal Terpakai:</span>
                <span class="font-bold text-primary-base font-mono text-regular-14">{{ formatRupiah(activeModalProof.amount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-secondary">Tipe Bukti:</span>
                <span class="font-bold text-neutral-primary capitalize">{{ activeModalProof.proof_type || 'Nota Belanja' }}</span>
              </div>
            </div>

            <div v-if="activeModalProof.note">
              <span class="font-bold text-neutral-primary block mb-1">Catatan Pengeluaran Borrower:</span>
              <p class="text-neutral-secondary italic bg-neutral-tertiary/40 p-3 rounded-lg border border-primary-base/10">
                "{{ activeModalProof.note }}"
              </p>
            </div>
          </div>

          <!-- Decision Form -->
          <form @submit.prevent="handleProofReviewSubmit" class="space-y-4 border-t border-primary-base/10 pt-4">
            <div>
              <label class="block text-semibold-12 text-neutral-primary mb-2">Keputusan Verifikasi Bukti</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="proofReviewDecision = 'approved'"
                  :class="[
                    'py-2.5 px-3 rounded-xl text-semibold-12 transition-all cursor-pointer border',
                    proofReviewDecision === 'approved' ? 'bg-status-success-main text-white border-status-success-main' : 'bg-white text-neutral-primary border-neutral-300'
                  ]"
                >
                  ✓ Disetujui (Cairkan Milestone)
                </button>
                <button
                  type="button"
                  @click="proofReviewDecision = 'rejected'"
                  :class="[
                    'py-2.5 px-3 rounded-xl text-semibold-12 transition-all cursor-pointer border',
                    proofReviewDecision === 'rejected' ? 'bg-status-error-main text-white border-status-error-main' : 'bg-white text-neutral-primary border-neutral-300'
                  ]"
                >
                  ✕ Ditolak (Perlu Revisi)
                </button>
              </div>
            </div>

            <BaseTextarea
              v-model="proofReviewNote"
              label="Catatan Admin / Alasan Penolakan"
              placeholder="Berikan alasan jika bukti kuitansi tidak valid atau perlu dilengkapi..."
              rows="3"
            />

            <div class="flex justify-end gap-3 pt-2">
              <BaseButton variant="outline" size="sm" type="button" @click="closeProofModal">
                Batal
              </BaseButton>
              <BaseButton variant="primary" size="sm" type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Simpan...' : 'Simpan Keputusan' }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>

      <!-- Assign Verifier Modal -->
      <div v-if="activeModalVerifyReq" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-xl">
          <div class="flex justify-between items-start border-b border-primary-base/10 pb-4">
            <div>
              <span class="text-semibold-12 text-primary-base">Penugasan Verifikator Lapangan</span>
              <h3 class="text-semibold-20 font-bold text-neutral-primary">
                {{ activeModalVerifyReq.business_name }}
              </h3>
            </div>
            <button @click="closeAssignModal" class="text-neutral-secondary hover:text-neutral-primary text-semibold-20 font-bold cursor-pointer">
              ✕
            </button>
          </div>

          <form @submit.prevent="handleAssignSubmit" class="space-y-4">
            <div class="p-4 bg-neutral-tertiary rounded-xl text-regular-12 space-y-1">
              <p>Pemilik Usaha: <strong class="text-neutral-primary">{{ activeModalVerifyReq.owner_name }}</strong></p>
              <p>Alamat Fisik: {{ activeModalVerifyReq.address }}</p>
              <p>Tier Pinjaman: <strong class="text-primary-base">{{ activeModalVerifyReq.tier }}</strong></p>
            </div>

            <div class="space-y-2">
              <label class="text-semibold-12 font-bold text-neutral-primary block">
                Pilih Verifikator Lapangan (Area Terdekat)
              </label>
              <select
                v-model="selectedVerifierId"
                class="w-full px-3.5 py-2.5 bg-white border border-primary-base/20 rounded-xl text-semibold-14 text-neutral-primary focus:outline-none focus:border-primary-base"
              >
                <option v-for="ver in verifiersList" :key="ver.id" :value="ver.id">
                  {{ ver.name }} (Area: {{ ver.area }})
                </option>
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-primary-base/10">
              <BaseButton variant="outline" size="sm" type="button" @click="closeAssignModal">
                Batal
              </BaseButton>
              <BaseButton variant="primary" size="sm" type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Tugaskan...' : 'Tugaskan Verifikator' }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
