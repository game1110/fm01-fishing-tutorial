<script setup>
import { onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '../stores/playerStore'
import WalletCard from '../components/WalletCard.vue'
import BonusItem from '../components/BonusItem.vue'

const store = usePlayerStore()

// Auto-check expiration every second
let expiryTimer
onMounted(() => {
  expiryTimer = setInterval(() => {
    store.expireBonuses()
  }, 1000)
})
onUnmounted(() => clearInterval(expiryTimer))
</script>

<template>
  <div class="max-w-3xl mx-auto p-4 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">我的錢包</h1>
      <p class="text-sm text-gray-500">{{ store.playerName }} ({{ store.playerId }})</p>
    </div>

    <!-- Wallet Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <WalletCard
        label="總餘額"
        :amount="store.totalBalance"
        subtitle="主錢包 + Bonus"
        color="blue"
      />
      <WalletCard
        label="主錢包"
        :amount="store.mainWallet"
        subtitle="可自由提領"
        color="green"
      />
      <WalletCard
        label="Bonus 合計"
        :amount="store.totalBonusBalance"
        :subtitle="`${store.activeBonuses.length} 筆進行中`"
        color="purple"
      />
    </div>

    <!-- Bonus List -->
    <div>
      <h2 class="text-lg font-bold text-gray-800 mb-3">
        Bonus 列表
        <span class="text-sm font-normal text-gray-400 ml-2">
          共 {{ store.bonuses.length }} 筆
        </span>
      </h2>

      <div class="space-y-3">
        <BonusItem
          v-for="bonus in store.bonuses"
          :key="bonus.id"
          :bonus="bonus"
        />
      </div>

      <div
        v-if="store.bonuses.length === 0"
        class="text-center py-12 text-gray-400"
      >
        尚無 Bonus
      </div>
    </div>
  </div>
</template>
