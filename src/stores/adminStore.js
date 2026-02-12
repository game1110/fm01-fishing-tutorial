import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePlayerStore } from './playerStore'

export const useAdminStore = defineStore('admin', () => {
  const events = ref([
    {
      id: 'EVT001',
      name: '新手註冊禮金',
      type: 'REGISTER',
      amountType: 'FIXED',
      amountValue: 200,
      wagerMultiplier: 15,
      expiryHours: 72,
      scope: ['ALL'],
      maxGrant: 200,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      enabled: true,
    },
    {
      id: 'EVT002',
      name: '儲值加碼 50%',
      type: 'DEPOSIT',
      amountType: 'PERCENT',
      amountValue: 50,
      wagerMultiplier: 20,
      expiryHours: 120,
      scope: ['FISHING', 'SLOT'],
      maxGrant: 1000,
      startDate: '2025-01-01',
      endDate: '2025-06-30',
      enabled: true,
    },
    {
      id: 'EVT003',
      name: '每日簽到獎勵',
      type: 'DAILY_CHECK',
      amountType: 'FIXED',
      amountValue: 50,
      wagerMultiplier: 10,
      expiryHours: 24,
      scope: ['ALL'],
      maxGrant: 50,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      enabled: true,
    },
    {
      id: 'EVT004',
      name: 'VIP 回饋金',
      type: 'VIP_REBATE',
      amountType: 'PERCENT',
      amountValue: 10,
      wagerMultiplier: 5,
      expiryHours: 168,
      scope: ['ALL'],
      maxGrant: 5000,
      startDate: '2025-03-01',
      endDate: '2025-12-31',
      enabled: false,
    },
  ])

  let nextEventId = 5

  // Stats computed from player store
  const bonusStats = computed(() => {
    const playerStore = usePlayerStore()
    const all = playerStore.bonuses
    const totalGranted = all.reduce((s, b) => s + b.originalAmount, 0)
    const completedAmount = all
      .filter((b) => b.status === 'COMPLETED')
      .reduce((s, b) => s + b.originalAmount, 0)
    const expiredAmount = all
      .filter((b) => b.status === 'EXPIRED')
      .reduce((s, b) => s + b.originalAmount, 0)
    const activeAmount = all
      .filter((b) => b.status === 'ACTIVE')
      .reduce((s, b) => s + b.amount, 0)
    return { totalGranted, completedAmount, expiredAmount, activeAmount }
  })

  function addEvent(eventData) {
    const id = `EVT${String(nextEventId++).padStart(3, '0')}`
    events.value.push({ ...eventData, id, enabled: true })
  }

  function updateEvent(id, data) {
    const idx = events.value.findIndex((e) => e.id === id)
    if (idx !== -1) {
      events.value[idx] = { ...events.value[idx], ...data }
    }
  }

  function toggleEvent(id) {
    const evt = events.value.find((e) => e.id === id)
    if (evt) evt.enabled = !evt.enabled
  }

  function deleteEvent(id) {
    events.value = events.value.filter((e) => e.id !== id)
  }

  function grantBonusToPlayer(eventId) {
    const evt = events.value.find((e) => e.id === eventId)
    if (!evt) return

    const playerStore = usePlayerStore()
    playerStore.grantBonus({
      type: evt.type,
      label: evt.name,
      amountType: evt.amountType,
      amountValue: evt.amountValue,
      wagerMultiplier: evt.wagerMultiplier,
      expiryHours: evt.expiryHours,
      scope: evt.scope,
      maxGrant: evt.maxGrant,
    })
  }

  return {
    events,
    bonusStats,
    addEvent,
    updateEvent,
    toggleEvent,
    deleteEvent,
    grantBonusToPlayer,
  }
})
