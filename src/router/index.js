import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { getAuthToken } from '@/services/api'

// Route-level code-splitting (Lazy loading components)
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue')
  },
  {
    path: '/request-role',
    name: 'request-role',
    component: () => import('@/views/RequestRoleView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/role-status',
    name: 'role-status',
    component: () => import('@/views/RoleStatusView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/business/wizard',
    name: 'business-wizard',
    component: () => import('@/views/BusinessWizardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/business/detail',
    name: 'business-detail',
    component: () => import('@/views/BusinessDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/financial-records',
    name: 'financial-records',
    component: () => import('@/views/FinancialRecordsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/campaigns',
    name: 'campaign-catalog',
    component: () => import('@/views/CampaignCatalogView.vue')
  },
  {
    path: '/campaigns/:id',
    name: 'campaign-detail',
    component: () => import('@/views/CampaignDetailView.vue')
  },
  {
    path: '/campaign/wizard',
    name: 'campaign-wizard',
    component: () => import('@/views/CampaignWizardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/views/AdminDashboardView.vue'),
    alias: ['/admin/campaigns/review', '/admin/roles/review', '/admin/business/verification', '/admin/disbursements', '/admin/analytics', '/admin/disputes', '/admin/restructuring'],
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/audit-logs',
    name: 'admin-audit-logs',
    component: () => import('@/views/AuditLogView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/verifier/dashboard',
    name: 'verifier-dashboard',
    component: () => import('@/views/VerifierDashboardView.vue'),
    alias: ['/verifier/tasks'],
    meta: { requiresAuth: true }
  },
  {
    path: '/verifier/report/:id',
    name: 'verifier-report',
    component: () => import('@/views/VerifierReportView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lender/portfolio',
    name: 'lender-portfolio',
    component: () => import('@/views/LenderPortfolioView.vue'),
    alias: ['/lender/dashboard'],
    meta: { requiresAuth: true }
  },
  {
    path: '/borrower/repayments',
    name: 'borrower-repayments',
    component: () => import('@/views/RepaymentScheduleView.vue'),
    alias: ['/campaigns/:id/repayments'],
    meta: { requiresAuth: true }
  },
  {
    path: '/disputes/create',
    name: 'dispute-create',
    component: () => import('@/views/DisputeCreateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/borrower/restructuring/create',
    name: 'restructuring-create',
    component: () => import('@/views/RestructuringRequestView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (typeof window !== 'undefined' && window.lenis) {
      window.lenis.scrollTo(0, { immediate: true })
    }
    return { top: 0, left: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const token = getAuthToken()
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

router.afterEach(() => {
  if (typeof window !== 'undefined') {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true })
    }
    window.scrollTo(0, 0)
  }
})

export default router
