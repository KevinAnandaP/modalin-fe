import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import RequestRoleView from '@/views/RequestRoleView.vue'
import RoleStatusView from '@/views/RoleStatusView.vue'
import BusinessWizardView from '@/views/BusinessWizardView.vue'
import BusinessDetailView from '@/views/BusinessDetailView.vue'

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
    component: RequestRoleView
  },
  {
    path: '/role-status',
    name: 'role-status',
    component: RoleStatusView
  },
  {
    path: '/business/wizard',
    name: 'business-wizard',
    component: BusinessWizardView
  },
  {
    path: '/business/detail',
    name: 'business-detail',
    component: BusinessDetailView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router


