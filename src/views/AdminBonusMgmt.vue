<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '../stores/playerStore'
import { useAdminStore } from '../stores/adminStore'

const playerStore = usePlayerStore()
const adminStore = useAdminStore()

const searchQuery = ref('')
const selectedEventId = ref('')

const filteredBonuses = computed(() => {
  if (!searchQuery.value) return playerStore.bonuses
  const q = searchQuery.value.toLowerCase()
  return playerStore.bonuses.filter(
    (b) =>
      b.id.toLowerCase().includes(q) ||
      b.label.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q)
  )
})

const enabledEvents = computed(() =>
  adminStore.events.filter((e) => e.enabled)
)

function grantToPlayer() {
  if (!selectedEventId.value) return
  adminStore.grantBonusToPlayer(selectedEventId.value)
  selectedEventId.value = ''
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  EXPIRED: 'bg-red-100 text-red-700',
}

function formatDate(ts) {
  return new Date(ts).toLocaleString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">Bonus 管理</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div class="text-xs text-gray-400">發放總額</div>
        <div class="text-2xl font-bold text-gray-800">
          ${{ adminStore.bonusStats.totalGranted.toLocaleString() }}
        </div>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div class="text-xs text-gray-400">進行中</div>
        <div class="text-2xl font-bold text-green-600">
          ${{ adminStore.bonusStats.activeAmount.toLocaleString() }}
        </div>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div class="text-xs text-gray-400">已達標</div>
        <div class="text-2xl font-bold text-blue-600">
          ${{ adminStore.bonusStats.completedAmount.toLocaleString() }}
        </div>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div class="text-xs text-gray-400">已過期</div>
        <div class="text-2xl font-bold text-red-500">
          ${{ adminStore.bonusStats.expiredAmount.toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- Grant Bonus -->
    <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 class="font-bold text-gray-800 mb-3">手動發放 Bonus</h3>
      <div class="flex gap-3 items-end">
        <div class="flex-1">
          <label class="text-sm text-gray-500 block mb-1">
            玩家：{{ playerStore.playerName }} ({{ playerStore.playerId }})
          </label>
        </div>
        <div class="flex-1">
          <label class="text-sm text-gray-500 block mb-1">選擇活動</label>
          <select
            v-model="selectedEventId"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- 請選擇 --</option>
            <option v-for="e in enabledEvents" :key="e.id" :value="e.id">
              {{ e.name }}
              ({{ e.amountType === 'FIXED' ? `$${e.amountValue}` : `${e.amountValue}%` }})
            </option>
          </select>
        </div>
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50"
          :disabled="!selectedEventId"
          @click="grantToPlayer"
        >
          發放
        </button>
      </div>
    </div>

    <!-- Bonus List -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-bold text-gray-800">玩家 Bonus 列表</h3>
        <input
          v-model="searchQuery"
          placeholder="搜尋 Bonus ID / 類型..."
          class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-500">ID</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500">類型</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500">餘額</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500">流水進度</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500">發放時間</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500">狀態</th>
            <th class="text-right px-4 py-3 font-medium text-gray-500">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="b in filteredBonuses"
            :key="b.id"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="px-4 py-3 font-mono text-gray-600">{{ b.id }}</td>
            <td class="px-4 py-3 text-gray-700">{{ b.label }}</td>
            <td class="px-4 py-3 font-medium text-gray-800">
              ${{ b.amount.toLocaleString() }}
              <span class="text-xs text-gray-400">/ ${{ b.originalAmount }}</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-20 bg-gray-100 rounded-full h-1.5">
                  <div
                    class="h-full rounded-full bg-blue-500"
                    :style="{
                      width: Math.min(100, (b.wagerAccumulated / b.wagerRequired) * 100) + '%',
                    }"
                  ></div>
                </div>
                <span class="text-xs text-gray-500">
                  {{ Math.min(100, Math.round((b.wagerAccumulated / b.wagerRequired) * 100)) }}%
                </span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">
              {{ formatDate(b.grantedAt) }}
            </td>
            <td class="px-4 py-3">
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="statusColors[b.status]"
              >
                {{ b.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <button
                v-if="b.status === 'ACTIVE'"
                class="text-red-500 hover:text-red-700 text-xs font-medium"
                @click="playerStore.voidBonus(b.id)"
              >
                作廢
              </button>
              <span v-else class="text-xs text-gray-300">--</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="filteredBonuses.length === 0"
        class="text-center py-8 text-gray-400 text-sm"
      >
        沒有找到 Bonus
      </div>
    </div>
  </div>
</template>
