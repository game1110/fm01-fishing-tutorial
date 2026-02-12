<script setup>
defineProps({
  label: String,
  amount: Number,
  subtitle: { type: String, default: '' },
  color: { type: String, default: 'blue' },
})

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
}
</script>

<template>
  <div
    class="rounded-xl p-5 text-white shadow-md bg-gradient-to-br"
    :class="colorMap[color] || colorMap.blue"
  >
    <div class="text-sm opacity-90">{{ label }}</div>
    <div class="text-3xl font-bold mt-1">
      ${{ amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
    </div>
    <div v-if="subtitle" class="text-xs opacity-75 mt-1">{{ subtitle }}</div>
  </div>
</template>
