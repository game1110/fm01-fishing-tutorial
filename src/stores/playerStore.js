import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // ── Player Info ──
  const playerId = ref('P10001')
  const playerName = ref('玩家小明')
  const mainWallet = ref(5000)

  // ── Bonus List ──
  let nextBonusId = 4
  const bonuses = ref([
    {
      id: 'B001',
      type: 'REGISTER',
      label: '註冊禮金',
      amount: 200,
      originalAmount: 200,
      wagerRequired: 3000, // 流水要求
      wagerAccumulated: 1200, // 已累計流水
      expiresAt: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days
      scope: ['ALL'],
      status: 'ACTIVE', // ACTIVE | COMPLETED | EXPIRED
      grantedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'B002',
      type: 'DEPOSIT',
      label: '儲值加碼 50%',
      amount: 500,
      originalAmount: 500,
      wagerRequired: 10000,
      wagerAccumulated: 2500,
      expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
      scope: ['FISHING', 'SLOT'],
      status: 'ACTIVE',
      grantedAt: Date.now() - 6 * 60 * 60 * 1000,
    },
    {
      id: 'B003',
      type: 'DAILY_CHECK',
      label: '每日簽到',
      amount: 50,
      originalAmount: 50,
      wagerRequired: 500,
      wagerAccumulated: 450,
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 min — nearly expired
      scope: ['ALL'],
      status: 'ACTIVE',
      grantedAt: Date.now() - 23.5 * 60 * 60 * 1000,
    },
  ])

  // ── Transaction History ──
  const transactions = ref([
    {
      id: 'T001',
      type: 'GRANT',
      description: '發放註冊禮金',
      amount: 200,
      walletSource: 'B001',
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'T002',
      type: 'GRANT',
      description: '發放儲值加碼',
      amount: 500,
      walletSource: 'B002',
      timestamp: Date.now() - 6 * 60 * 60 * 1000,
    },
    {
      id: 'T003',
      type: 'GRANT',
      description: '發放每日簽到',
      amount: 50,
      walletSource: 'B003',
      timestamp: Date.now() - 23.5 * 60 * 60 * 1000,
    },
    {
      id: 'T004',
      type: 'BET',
      description: '捕魚下注 - 深海房',
      amount: -100,
      walletSource: 'B001(-60) B002(-30) MAIN(-10)',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
    },
    {
      id: 'T005',
      type: 'WIN',
      description: '捕魚贏分 x2.5',
      amount: 250,
      walletSource: 'B001(+150) B002(+75) MAIN(+25)',
      timestamp: Date.now() - 2 * 60 * 60 * 1000 + 5000,
    },
  ])

  // ── Notifications queue ──
  const notifications = ref([])

  // ── Computed ──
  const activeBonuses = computed(() =>
    bonuses.value.filter((b) => b.status === 'ACTIVE')
  )

  const totalBonusBalance = computed(() =>
    activeBonuses.value.reduce((sum, b) => sum + b.amount, 0)
  )

  const totalBalance = computed(() => mainWallet.value + totalBonusBalance.value)

  // ── Actions ──
  let txCounter = transactions.value.length + 1

  function addNotification(message, type = 'info') {
    const id = Date.now() + Math.random()
    notifications.value.push({ id, message, type })
    setTimeout(() => {
      notifications.value = notifications.value.filter((n) => n.id !== id)
    }, 4000)
  }

  /**
   * Place a bet: FIFO from active bonuses first, then main wallet.
   * Returns breakdown array: [{ source, amount }]
   */
  function placeBet(amount, roomLabel) {
    if (amount <= 0) return null
    if (amount > totalBalance.value) {
      addNotification('餘額不足，無法下注', 'error')
      return null
    }

    let remaining = amount
    const breakdown = []

    // FIFO: oldest bonus first (sorted by grantedAt)
    const sorted = [...activeBonuses.value].sort(
      (a, b) => a.grantedAt - b.grantedAt
    )

    for (const bonus of sorted) {
      if (remaining <= 0) break
      const deduct = Math.min(bonus.amount, remaining)
      if (deduct > 0) {
        bonus.amount -= deduct
        remaining -= deduct
        breakdown.push({ source: bonus.id, label: bonus.label, amount: deduct })
      }
    }

    // Remaining from main wallet
    if (remaining > 0) {
      mainWallet.value -= remaining
      breakdown.push({ source: 'MAIN', label: '主錢包', amount: remaining })
    }

    // Record wager on each bonus that participated
    for (const item of breakdown) {
      if (item.source !== 'MAIN') {
        const b = bonuses.value.find((x) => x.id === item.source)
        if (b) b.wagerAccumulated += item.amount
      }
    }
    // Main wallet bets also count toward all active bonuses wager
    const mainBetAmount = breakdown.find((x) => x.source === 'MAIN')?.amount || 0
    if (mainBetAmount > 0) {
      for (const b of activeBonuses.value) {
        b.wagerAccumulated += mainBetAmount
      }
    }

    const breakdownStr = breakdown
      .map((b) => `${b.label}(-${b.amount})`)
      .join(' ')

    transactions.value.unshift({
      id: `T${String(++txCounter).padStart(3, '0')}`,
      type: 'BET',
      description: `捕魚下注 - ${roomLabel}`,
      amount: -amount,
      walletSource: breakdownStr,
      timestamp: Date.now(),
    })

    return breakdown
  }

  /**
   * Settle a round: winnings go back proportionally based on bet breakdown.
   */
  function settleRound(breakdown, multiplier, roomLabel) {
    if (!breakdown || multiplier <= 0) return

    const totalBet = breakdown.reduce((s, b) => s + b.amount, 0)
    const winnings = totalBet * multiplier
    const winBreakdown = []

    for (const item of breakdown) {
      const ratio = item.amount / totalBet
      const win = Math.round(winnings * ratio * 100) / 100

      if (item.source === 'MAIN') {
        mainWallet.value += win
      } else {
        const b = bonuses.value.find((x) => x.id === item.source)
        if (b && b.status === 'ACTIVE') {
          b.amount += win
        } else {
          // If bonus expired during round, winnings go to main
          mainWallet.value += win
        }
      }
      winBreakdown.push({ source: item.source, label: item.label, amount: win })
    }

    const breakdownStr = winBreakdown
      .map((b) => `${b.label}(+${b.amount.toFixed(0)})`)
      .join(' ')

    transactions.value.unshift({
      id: `T${String(++txCounter).padStart(3, '0')}`,
      type: 'WIN',
      description: `捕魚贏分 x${multiplier} - ${roomLabel}`,
      amount: winnings,
      walletSource: breakdownStr,
      timestamp: Date.now(),
    })

    if (winnings > 0) {
      addNotification(`贏得 $${winnings.toFixed(0)}！`, 'success')
    }

    // Check wagering completion after settlement
    checkWageringComplete()

    return winBreakdown
  }

  function checkWageringComplete() {
    for (const b of bonuses.value) {
      if (b.status !== 'ACTIVE') continue
      if (b.wagerAccumulated >= b.wagerRequired) {
        // Transfer bonus balance to main wallet
        const transferAmount = b.amount
        mainWallet.value += transferAmount
        b.status = 'COMPLETED'
        b.amount = 0

        transactions.value.unshift({
          id: `T${String(++txCounter).padStart(3, '0')}`,
          type: 'TRANSFER',
          description: `${b.label} 流水達標，轉入主錢包`,
          amount: transferAmount,
          walletSource: `${b.id} → MAIN`,
          timestamp: Date.now(),
        })

        addNotification(
          `🎉 ${b.label} 流水達標！$${transferAmount.toFixed(0)} 已轉入主錢包`,
          'success'
        )
      }
    }
  }

  function expireBonuses() {
    const now = Date.now()
    for (const b of bonuses.value) {
      if (b.status !== 'ACTIVE') continue
      if (now >= b.expiresAt) {
        const expired = b.amount
        b.status = 'EXPIRED'
        b.amount = 0

        transactions.value.unshift({
          id: `T${String(++txCounter).padStart(3, '0')}`,
          type: 'EXPIRE',
          description: `${b.label} 已過期作廢`,
          amount: -expired,
          walletSource: b.id,
          timestamp: Date.now(),
        })

        addNotification(`${b.label} 已過期，$${expired.toFixed(0)} 已作廢`, 'warning')
      }
    }
  }

  function grantBonus(config) {
    const id = `B${String(nextBonusId++).padStart(3, '0')}`
    const amount =
      config.amountType === 'FIXED'
        ? config.amountValue
        : Math.min(
            Math.round(mainWallet.value * (config.amountValue / 100)),
            config.maxGrant || Infinity
          )

    const bonus = {
      id,
      type: config.type,
      label: config.label || config.type,
      amount,
      originalAmount: amount,
      wagerRequired: amount * (config.wagerMultiplier || 1),
      wagerAccumulated: 0,
      expiresAt: Date.now() + (config.expiryHours || 72) * 60 * 60 * 1000,
      scope: config.scope || ['ALL'],
      status: 'ACTIVE',
      grantedAt: Date.now(),
    }

    bonuses.value.push(bonus)

    transactions.value.unshift({
      id: `T${String(++txCounter).padStart(3, '0')}`,
      type: 'GRANT',
      description: `發放 ${bonus.label}`,
      amount,
      walletSource: id,
      timestamp: Date.now(),
    })

    addNotification(`收到 ${bonus.label} $${amount}！`, 'success')
    return bonus
  }

  function voidBonus(bonusId) {
    const b = bonuses.value.find((x) => x.id === bonusId)
    if (!b || b.status !== 'ACTIVE') return
    const voided = b.amount
    b.status = 'EXPIRED'
    b.amount = 0

    transactions.value.unshift({
      id: `T${String(++txCounter).padStart(3, '0')}`,
      type: 'EXPIRE',
      description: `${b.label} 手動作廢`,
      amount: -voided,
      walletSource: b.id,
      timestamp: Date.now(),
    })

    addNotification(`${b.label} 已作廢`, 'warning')
  }

  return {
    playerId,
    playerName,
    mainWallet,
    bonuses,
    transactions,
    notifications,
    activeBonuses,
    totalBonusBalance,
    totalBalance,
    placeBet,
    settleRound,
    checkWageringComplete,
    expireBonuses,
    grantBonus,
    voidBonus,
    addNotification,
  }
})
