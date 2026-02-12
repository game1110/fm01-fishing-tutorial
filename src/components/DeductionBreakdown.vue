<script setup>
defineProps({
  breakdown: Array,
  title: { type: String, default: '扣款來源拆解' },
  mode: { type: String, default: 'deduct' }, // 'deduct' | 'win'
})
</script>

<template>
  <div v-if="breakdown && breakdown.length" class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
    <h4 class="text-sm font-medium text-gray-500 mb-3">{{ title }}</h4>
    <div class="space-y-2">
      <div
        v-for="item in breakdown"
        :key="item.source"
        class="flex items-center justify-between py-1.5 px-3 rounded-lg"
        :class="mode === 'deduct' ? 'bg-red-50' : 'bg-green-50'"
      >
        <div class="flex items-center gap-2">
          <span
            class="w-2 h-2 rounded-full"
            :class="item.source === 'MAIN' ? 'bg-blue-400' : 'bg-purple-400'"
          ></span>
          <span class="text-sm text-gray-700">{{ item.label }}</span>
          <span class="text-xs text-gray-400">{{ item.source }}</span>
        </div>
        <span
          class="font-bold text-sm"
          :class="mode === 'deduct' ? 'text-red-600' : 'text-green-600'"
        >
          {{ mode === 'deduct' ? '-' : '+' }}${{ item.amount.toFixed(0) }}
        </span>
      </div>
    </div>
    <div class="mt-3 pt-2 border-t border-gray-100 flex justify-between text-sm">
      <span class="text-gray-500">合計</span>
      <span
        class="font-bold"
        :class="mode === 'deduct' ? 'text-red-600' : 'text-green-600'"
      >
        {{ mode === 'deduct' ? '-' : '+' }}${{ breakdown.reduce((s, b) => s + b.amount, 0).toFixed(0) }}
      </span>
    </div>
  </div>
</template>
