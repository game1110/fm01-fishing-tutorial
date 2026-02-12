<script setup>
import { ref } from 'vue'

const emit = defineEmits(['place-bet'])

const rooms = [
  { id: 'beginner', label: '新手房', multiplierRange: '1x-10x', minBet: 1, maxBet: 100 },
  { id: 'normal', label: '普通房', multiplierRange: '1x-50x', minBet: 10, maxBet: 500 },
  { id: 'deep-sea', label: '深海房', multiplierRange: '1x-100x', minBet: 50, maxBet: 2000 },
  { id: 'boss', label: 'BOSS房', multiplierRange: '1x-500x', minBet: 100, maxBet: 5000 },
]

const selectedRoom = ref(rooms[0])
const betAmount = ref(10)
const turretMultiplier = ref(1)

const turrets = [
  { value: 1, label: '1x 砲台' },
  { value: 2, label: '2x 砲台' },
  { value: 5, label: '5x 砲台' },
  { value: 10, label: '10x 砲台' },
]

function fire() {
  const totalBet = betAmount.value * turretMultiplier.value
  emit('place-bet', {
    roomId: selectedRoom.value.id,
    roomLabel: selectedRoom.value.label,
    betAmount: totalBet,
    turretMultiplier: turretMultiplier.value,
  })
}

function quickBet(amount) {
  betAmount.value = amount
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
    <h3 class="font-bold text-gray-800 mb-4">下注面板</h3>

    <!-- Room Selection -->
    <div class="mb-4">
      <label class="text-sm text-gray-500 mb-2 block">選擇房間</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="room in rooms"
          :key="room.id"
          class="border rounded-lg px-3 py-2 text-sm transition-colors text-left"
          :class="selectedRoom.id === room.id
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 hover:border-gray-300 text-gray-600'"
          @click="selectedRoom = room"
        >
          <div class="font-medium">{{ room.label }}</div>
          <div class="text-xs opacity-70">倍率 {{ room.multiplierRange }}</div>
        </button>
      </div>
    </div>

    <!-- Turret -->
    <div class="mb-4">
      <label class="text-sm text-gray-500 mb-2 block">砲台倍率</label>
      <div class="flex gap-2">
        <button
          v-for="t in turrets"
          :key="t.value"
          class="flex-1 border rounded-lg py-1.5 text-sm transition-colors"
          :class="turretMultiplier === t.value
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 hover:border-gray-300 text-gray-600'"
          @click="turretMultiplier = t.value"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- Bet Amount -->
    <div class="mb-4">
      <label class="text-sm text-gray-500 mb-2 block">下注金額</label>
      <input
        v-model.number="betAmount"
        type="number"
        :min="selectedRoom.minBet"
        :max="selectedRoom.maxBet"
        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <div class="flex gap-2 mt-2">
        <button
          v-for="q in [10, 50, 100, 500]"
          :key="q"
          class="flex-1 text-xs py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
          @click="quickBet(q)"
        >
          ${{ q }}
        </button>
      </div>
    </div>

    <!-- Total -->
    <div class="flex items-center justify-between text-sm text-gray-500 mb-4 px-1">
      <span>實際下注</span>
      <span class="text-lg font-bold text-gray-800">
        ${{ (betAmount * turretMultiplier).toLocaleString() }}
      </span>
    </div>

    <!-- Fire Button -->
    <button
      class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors text-lg active:scale-95 transform"
      @click="fire"
    >
      開火！
    </button>
  </div>
</template>
