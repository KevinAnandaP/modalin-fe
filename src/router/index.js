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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !getAuthToken()) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router



