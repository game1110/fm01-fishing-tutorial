<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '../stores/playerStore'
import BettingPanel from '../components/BettingPanel.vue'
import DeductionBreakdown from '../components/DeductionBreakdown.vue'
import WalletCard from '../components/WalletCard.vue'

const store = usePlayerStore()

const lastBetBreakdown = ref(null)
const lastWinBreakdown = ref(null)
const lastMultiplier = ref(0)
const roundResult = ref(null) // 'win' | 'lose' | null
const isAnimating = ref(false)

// Expiry checker
let expiryTimer
onMounted(() => {
  expiryTimer = setInterval(() => store.expireBonuses(), 1000)
})
onUnmounted(() => clearInterval(expiryTimer))

function handleBet({ roomId, roomLabel, betAmount, turretMultiplier }) {
  // Reset previous round
  lastWinBreakdown.value = null
  roundResult.value = null

  const breakdown = store.placeBet(betAmount, roomLabel)
  if (!breakdown) return

  lastBetBreakdown.value = breakdown
  isAnimating.value = true

  // Simulate shot animation + random result
  setTimeout(() => {
    // Random multiplier: weighted toward lower values
    const rand = Math.random()
    let mult = 0
    if (rand < 0.35) mult = 0         // 35% miss
    else if (rand < 0.55) mult = 0.5   // 20% partial
    else if (rand < 0.75) mult = 1     // 20% break even
    else if (rand < 0.88) mult = 2     // 13% 2x
    else if (rand < 0.95) mult = 3     // 7% 3x
    else mult = 5                      // 5% jackpot

    lastMultiplier.value = mult

    if (mult > 0) {
      const winResult = store.settleRound(breakdown, mult, roomLabel)
      lastWinBreakdown.value = winResult
      roundResult.value = 'win'
    } else {
      roundResult.value = 'lose'
    }

    isAnimating.value = false
  }, 800)
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-4">
    <h1 class="text-2xl font-bold text-gray-800 mb-4">模擬下注</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Betting Panel -->
      <div class="space-y-4">
        <BettingPanel @place-bet="handleBet" />

        <!-- Mini Wallet -->
        <div class="grid grid-cols-2 gap-3">
          <WalletCard label="主錢包" :amount="store.mainWallet" color="green" />
          <WalletCard label="Bonus" :amount="store.totalBonusBalance" color="purple" />
        </div>
      </div>

      <!-- Right: Results -->
      <div class="space-y-4">
        <!-- Animation / Result -->
        <div
          class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center min-h-[140px] flex items-center justify-center"
        >
          <div v-if="isAnimating" class="text-4xl animate-bounce">🐟</div>
          <div v-else-if="roundResult === 'win'" class="space-y-2">
            <div class="text-5xl">🎉</div>
            <div class="text-2xl font-bold text-green-600">
              x{{ lastMultiplier }} 中獎！
            </div>
            <div class="text-gray-500">
              贏得 ${{ lastWinBreakdown?.reduce((s, b) => s + b.amount, 0).toFixed(0) }}
            </div>
          </div>
          <div v-else-if="roundResult === 'lose'" class="space-y-2">
            <div class="text-5xl">💨</div>
            <div class="text-2xl font-bold text-gray-400">Miss!</div>
            <div class="text-gray-400 text-sm">沒有打中，繼續加油</div>
          </div>
          <div v-else class="text-gray-300">
            <div class="text-4xl mb-2">🎯</div>
            <div class="text-sm">選擇房間和金額，按下開火</div>
          </div>
        </div>

        <!-- Bet Breakdown -->
        <DeductionBreakdown
          v-if="lastBetBreakdown"
          :breakdown="lastBetBreakdown"
          title="扣款來源拆解"
          mode="deduct"
        />

        <!-- Win Breakdown -->
        <DeductionBreakdown
          v-if="lastWinBreakdown"
          :breakdown="lastWinBreakdown"
          title="贏分歸還拆解"
          mode="win"
        />

        <!-- Active Bonus Wager Progress -->
        <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h4 class="text-sm font-medium text-gray-500 mb-3">流水進度</h4>
          <div v-if="store.activeBonuses.length === 0" class="text-sm text-gray-400 text-center py-2">
            無進行中 Bonus
          </div>
          <div v-else class="space-y-3">
            <div v-for="b in store.activeBonuses" :key="b.id">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>{{ b.label }}</span>
                <span>
                  {{ b.wagerAccumulated.toLocaleString() }} /
                  {{ b.wagerRequired.toLocaleString() }}
                  ({{ Math.min(100, Math.round((b.wagerAccumulated / b.wagerRequired) * 100)) }}%)
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div
                  class="h-full rounded-full bg-blue-500 transition-all duration-500"
                  :style="{
                    width: Math.min(100, (b.wagerAccumulated / b.wagerRequired) * 100) + '%',
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
