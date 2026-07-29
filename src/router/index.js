import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import RequestRoleView from '@/views/RequestRoleView.vue'
import RoleStatusView from '@/views/RoleStatusView.vue'
import BusinessWizardView from '@/views/BusinessWizardView.vue'
import BusinessDetailView from '@/views/BusinessDetailView.vue'
import FinancialRecordsView from '@/views/FinancialRecordsView.vue'
import CampaignCatalogView from '@/views/CampaignCatalogView.vue'
import CampaignDetailView from '@/views/CampaignDetailView.vue'
import CampaignWizardView from '@/views/CampaignWizardView.vue'
import AdminDashboardView from '@/views/AdminDashboardView.vue'
import VerifierDashboardView from '@/views/VerifierDashboardView.vue'
import VerifierReportView from '@/views/VerifierReportView.vue'
import LenderPortfolioView from '@/views/LenderPortfolioView.vue'

import { getAuthToken } from '@/services/api'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/request-role',
    name: 'request-role',
    component: RequestRoleView,
    meta: { requiresAuth: true }
  },
  {
    path: '/role-status',
    name: 'role-status',
    component: RoleStatusView,
    meta: { requiresAuth: true }
  },
  {
    path: '/business/wizard',
    name: 'business-wizard',
    component: BusinessWizardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/business/detail',
    name: 'business-detail',
    component: BusinessDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/financial-records',
    name: 'financial-records',
    component: FinancialRecordsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/campaigns',
    name: 'campaign-catalog',
    component: CampaignCatalogView
  },
  {
    path: '/campaigns/:id',
    name: 'campaign-detail',
    component: CampaignDetailView
  },
  {
    path: '/campaign/wizard',
    name: 'campaign-wizard',
    component: CampaignWizardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboardView,
    alias: ['/admin/campaigns/review', '/admin/roles/review', '/admin/business/verification', '/admin/disbursements', '/admin/analytics'],
    meta: { requiresAuth: true }
  },
  {
    path: '/verifier/dashboard',
    name: 'verifier-dashboard',
    component: VerifierDashboardView,
    alias: ['/verifier/tasks'],
    meta: { requiresAuth: true }
  },
  {
    path: '/verifier/report/:id',
    name: 'verifier-report',
    component: VerifierReportView,
    meta: { requiresAuth: true }
  },
  {
    path: '/lender/portfolio',
    name: 'lender-portfolio',
    component: LenderPortfolioView,
    alias: ['/lender/dashboard'],
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
  if (to.meta.requiresAuth && !getAuthToken()) {
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



