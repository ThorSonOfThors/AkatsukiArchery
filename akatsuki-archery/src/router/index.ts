// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '../views/HomePage.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import TermsView from '@/views/TermsView.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return {
      top: 0,
      behavior: 'smooth'
    }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/privacy-policy',
      name: 'privacy',
      component: PrivacyPolicyView
    },
    {
      path: '/terms-and-conditions',
      name: 'terms',
      component: TermsView
    }
  ]
})

export default router