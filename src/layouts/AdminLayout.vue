<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import logoUrl from '@/assets/Logo.svg'
import { removeAuthToken } from '@/services/api'
import { authService } from '@/services/auth'
import { 
  CheckSquare, 
  Store, 
  UserCheck, 
  Wallet, 
  BarChart2, 
  LogOut,
  ShieldAlert,
  CalendarClock,
  FileCode
} from '@lucide/vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'campaigns'
  }
})

const emit = defineEmits(['update:activeTab', 'selectTab'])

const router = useRouter()
const currentUser = ref(null)
const userRoles = ref([])
const isAdmin = computed(() => userRoles.value.includes('admin'))

const userFullName = computed(() => {
  return currentUser.value?.FullName || currentUser.value?.full_name || currentUser.value?.name || 'Administrator'
})

const userEmail = computed(() => {
  return currentUser.value?.Email || currentUser.value?.email || 'admin@modalin.id'
})

const userInitials = computed(() => {
  const name = userFullName.value
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const fetchProfile = async () => {
  try {
    const res = await authService.getProfile()
    const payload = res?.data || res || {}
    currentUser.value = payload.user || payload || null
    userRoles.value = payload.roles || []
  } catch (err) {
    console.warn('AdminLayout fetchProfile error:', err)
  }
}

onMounted(() => {
  fetchProfile()
})

const adminNavItems = [
  {
    id: 'campaigns',
    name: 'Review Campaign',
    icon: CheckSquare
  },
  {
    id: 'businesses',
    name: 'Verifikasi Usaha',
    icon: Store
  },
  {
    id: 'roles',
    name: 'Verifikasi Role User',
    icon: UserCheck
  },
  {
    id: 'disbursements',
    name: 'Pencairan Dana (Disbursement)',
    icon: Wallet
  },
  {
    id: 'verifications',
    name: 'Penugasan Verifikator',
    icon: UserCheck
  },
  {
    id: 'disputes',
    name: 'Resolusi Sengketa',
    icon: ShieldAlert
  },
  {
    id: 'restructuring',
    name: 'Restrukturisasi Tenor',
    icon: CalendarClock
  },
  {
    id: 'audit',
    name: 'Audit Log Forensik',
    icon: FileCode,
    isRoute: true,
    to: '/admin/audit-logs'
  }
]

const handleTabClick = (item) => {
  if (typeof item === 'object' && item.isRoute) {
    router.push(item.to)
    return
  }
  const tabId = typeof item === 'object' ? item.id : item
  emit('update:activeTab', tabId)
  emit('selectTab', tabId)
}

const handleLogout = () => {
  removeAuthToken()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-neutral-tertiary font-inter text-neutral-primary">
    <!-- Sidebar Left Navigation -->
    <aside class="w-64 sm:w-72 bg-white border-r border-primary-base/10 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen z-30">
      <div class="p-6 space-y-8">
        <!-- Brand Header -->
        <RouterLink to="/" class="flex items-center gap-3 no-underline">
          <img :src="logoUrl" alt="Modalin Logo" class="h-9 w-9" />
          <span class="text-semibold-24 font-newsreader text-primary-base font-bold tracking-tight">Modalin</span>
        </RouterLink>

        <!-- Navigation Links Menu -->
        <nav class="space-y-1.5">
          <span class="px-3 text-[11px] font-bold text-neutral-secondary uppercase tracking-wider block mb-2">
            Menu Moderasi
          </span>

          <button
            v-for="item in adminNavItems"
            :key="item.id"
            type="button"
            @click="handleTabClick(item)"
            :class="[
              'w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left',
              activeTab === item.id
                ? 'bg-primary-base text-white shadow-xs'
                : 'text-neutral-secondary hover:text-neutral-primary hover:bg-neutral-tertiary'
            ]"
          >
            <div class="flex items-center gap-3">
              <component :is="item.icon" class="w-4 h-4 shrink-0" />
              <span>{{ item.name }}</span>
            </div>
          </button>
        </nav>
      </div>

      <!-- Footer User Profile & Logout -->
      <div class="p-4 border-t border-primary-base/10 space-y-3 bg-neutral-tertiary/30">
        <div class="flex items-center gap-3 px-2">
          <div class="w-9 h-9 rounded-full bg-primary-base text-white flex items-center justify-center font-bold text-xs shrink-0">
            {{ userInitials }}
          </div>
          <div class="overflow-hidden">
            <span class="text-xs font-bold text-neutral-primary block truncate">
              {{ userFullName }}
            </span>
            <span class="text-[11px] text-neutral-secondary block truncate">
              {{ userEmail }}
            </span>
          </div>
        </div>

        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-status-error-main/30 text-status-error-main hover:bg-status-error-surface/40 text-xs font-semibold transition-colors cursor-pointer"
        >
          <LogOut class="w-4 h-4" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
      <div v-if="currentUser && !isAdmin" class="bg-status-error-surface border-b border-status-error-main/30 p-4 px-8 flex items-center justify-between text-xs text-status-error-main font-semibold">
        <span>⚠️ Perhatian: Akun Anda ({{ userFullName }} - {{ userEmail }}) terdaftar sebagai {{ userRoles.join(', ') || 'User' }}, bukan Administrator. Akses data moderasi terbatas.</span>
        <button @click="router.push('/role-status')" class="underline hover:text-red-900 cursor-pointer">
          Cek Status Role Anda →
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>
