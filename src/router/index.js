import { createRouter, createWebHistory } from 'vue-router'
import PlayerWallet from '../views/PlayerWallet.vue'
import BettingSimulator from '../views/BettingSimulator.vue'
import TransactionHistory from '../views/TransactionHistory.vue'
import AdminEvents from '../views/AdminEvents.vue'
import AdminBonusMgmt from '../views/AdminBonusMgmt.vue'
import FishingTutorial from '../views/FishingTutorial.vue'

const routes = [
  { path: '/', name: 'wallet', component: PlayerWallet },
  { path: '/betting', name: 'betting', component: BettingSimulator },
  { path: '/history', name: 'history', component: TransactionHistory },
  { path: '/tutorial', name: 'tutorial', component: FishingTutorial },
  { path: '/admin/events', name: 'admin-events', component: AdminEvents },
  { path: '/admin/bonus', name: 'admin-bonus', component: AdminBonusMgmt },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
