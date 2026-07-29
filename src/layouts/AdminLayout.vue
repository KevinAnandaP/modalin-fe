<script setup>
import { RouterLink, useRouter } from 'vue-router'
import logoUrl from '@/assets/Logo.svg'
import { removeAuthToken } from '@/services/api'
import { 
  CheckSquare, 
  Store, 
  UserCheck, 
  Wallet, 
  BarChart2, 
  LogOut
} from '@lucide/vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'campaigns'
  }
})

const emit = defineEmits(['update:activeTab', 'selectTab'])

const router = useRouter()

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
    id: 'analytics',
    name: 'Laporan & Audit Log',
    icon: BarChart2
  }
]

const handleTabClick = (tabId) => {
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
            @click="handleTabClick(item.id)"
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
            AD
          </div>
          <div class="overflow-hidden">
            <span class="text-xs font-bold text-neutral-primary block truncate">Administrator</span>
            <span class="text-[11px] text-neutral-secondary block truncate">admin@modalin.id</span>
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
      <slot />
    </div>
  </div>
</template>
