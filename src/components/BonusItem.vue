<script setup>
import { computed } from 'vue'
import { useCountdown } from '../composables/useCountdown'

const props = defineProps({
  bonus: Object,
})

const { days, hours, minutes, seconds, isExpired, isUrgent } = useCountdown(
  () => props.bonus.expiresAt
)

const wagerPercent = computed(() => {
  if (props.bonus.wagerRequired === 0) return 100
  return Math.min(
    100,
    Math.round((props.bonus.wagerAccumulated / props.bonus.wagerRequired) * 100)
  )
})

const typeColors = {
  REGISTER: 'bg-blue-100 text-blue-700',
  DEPOSIT: 'bg-purple-100 text-purple-700',
  DAILY_CHECK: 'bg-green-100 text-green-700',
  VIP_REBATE: 'bg-yellow-100 text-yellow-700',
  PROMO: 'bg-pink-100 text-pink-700',
}

const statusConfig = {
  ACTIVE: { class: 'bg-green-100 text-green-700', label: 'ACTIVE' },
  COMPLETED: { class: 'bg-blue-100 text-blue-700', label: 'COMPLETED' },
  EXPIRED: { class: 'bg-red-100 text-red-700', label: 'EXPIRED' },
}

const pad = (n) => String(n).padStart(2, '0')
</script>

<template>
  <div
    class="border rounded-lg p-4 bg-white transition-all"
    :class="{
      'border-gray-200': bonus.status === 'ACTIVE' && !isUrgent,
      'border-yellow-400 bg-yellow-50/30': bonus.status === 'ACTIVE' && isUrgent,
      'border-gray-100 opacity-60': bonus.status !== 'ACTIVE',
    }"
  >
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span
          class="text-xs px-2 py-0.5 rounded-full font-medium"
          :class="typeColors[bonus.type] || 'bg-gray-100 text-gray-700'"
        >
          {{ bonus.label }}
        </span>
        <span
          v-for="s in bonus.scope"
          :key="s"
          class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500"
        >
          {{ s }}
        </span>
      </div>
      <span
        class="text-xs px-2 py-0.5 rounded-full font-medium"
        :class="statusConfig[bonus.status]?.class"
      >
        {{ statusConfig[bonus.status]?.label }}
      </span>
    </div>

    <div class="flex items-baseline justify-between mb-3">
      <div>
        <span class="text-2xl font-bold text-gray-800">${{ bonus.amount.toLocaleString() }}</span>
        <span class="text-sm text-gray-400 ml-1">/ ${{ bonus.originalAmount.toLocaleString() }}</span>
      </div>
      <div v-if="bonus.status === 'ACTIVE'" class="text-right">
        <div
          class="text-sm font-mono"
          :class="isUrgent ? 'text-red-500 font-bold' : 'text-gray-500'"
        >
          {{ days > 0 ? `${days}天 ` : '' }}{{ pad(hours) }}:{{ pad(minutes) }}:{{ pad(seconds) }}
        </div>
        <div class="text-xs text-gray-400">剩餘時間</div>
      </div>
    </div>

    <!-- Wager progress bar -->
    <div class="mb-1">
      <div class="flex justify-between text-xs text-gray-500 mb-1">
        <span>流水進度</span>
        <span>
          {{ bonus.wagerAccumulated.toLocaleString() }} /
          {{ bonus.wagerRequired.toLocaleString() }}
          ({{ wagerPercent }}%)
        </span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          :class="wagerPercent >= 100 ? 'bg-green-500' : 'bg-blue-500'"
          :style="{ width: wagerPercent + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>
