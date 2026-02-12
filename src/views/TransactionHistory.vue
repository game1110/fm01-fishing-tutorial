<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '../stores/playerStore'

const store = usePlayerStore()

const filter = ref('ALL')
const filters = [
  { value: 'ALL', label: '全部' },
  { value: 'BET', label: '下注' },
  { value: 'WIN', label: '贏分' },
  { value: 'GRANT', label: '發放' },
  { value: 'EXPIRE', label: '過期' },
  { value: 'TRANSFER', label: '轉帳' },
]

const filteredTransactions = computed(() => {
  if (filter.value === 'ALL') return store.transactions
  return store.transactions.filter((t) => t.type === filter.value)
})

const typeConfig = {
  BET: { color: 'text-red-600', bg: 'bg-red-50', icon: '🎯' },
  WIN: { color: 'text-green-600', bg: 'bg-green-50', icon: '🏆' },
  GRANT: { color: 'text-blue-600', bg: 'bg-blue-50', icon: '🎁' },
  EXPIRE: { color: 'text-gray-500', bg: 'bg-gray-50', icon: '⏰' },
  TRANSFER: { color: 'text-purple-600', bg: 'bg-purple-50', icon: '💰' },
}

function formatTime(ts) {
  const d = new Date(ts)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  const secs = String(d.getSeconds()).padStart(2, '0')
  return `${month}/${day} ${hours}:${mins}:${secs}`
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-4 space-y-4">
    <h1 class="text-2xl font-bold text-gray-800">交易紀錄</h1>

    <!-- Filters -->
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="f in filters"
        :key="f.value"
        class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="filter === f.value
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        @click="filter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Transaction List -->
    <div class="space-y-2">
      <div
        v-for="tx in filteredTransactions"
        :key="tx.id"
        class="border border-gray-200 rounded-lg p-4 bg-white flex items-center gap-4"
      >
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          :class="typeConfig[tx.type]?.bg || 'bg-gray-50'"
        >
          {{ typeConfig[tx.type]?.icon || '📄' }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-800 text-sm">{{ tx.description }}</div>
          <div class="text-xs text-gray-400 mt-0.5">
            {{ tx.walletSource }}
          </div>
        </div>

        <div class="text-right">
          <div
            class="font-bold"
            :class="tx.amount >= 0
              ? typeConfig[tx.type]?.color || 'text-gray-700'
              : 'text-red-600'"
          >
            {{ tx.amount >= 0 ? '+' : '' }}${{ tx.amount.toFixed(0) }}
          </div>
          <div class="text-xs text-gray-400 mt-0.5">
            {{ formatTime(tx.timestamp) }}
          </div>
        </div>
      </div>

      <div
        v-if="filteredTransactions.length === 0"
        class="text-center py-12 text-gray-400"
      >
        暫無交易紀錄
      </div>
    </div>
  </div>
</template>
