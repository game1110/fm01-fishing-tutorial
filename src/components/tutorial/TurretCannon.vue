<script setup>
import { computed } from 'vue'

const props = defineProps({
  turret: { type: Object, default: null },
  angle: { type: Number, default: 0 },
})

const rotateStyle = computed(() => ({
  transform: `rotate(${props.angle}deg)`,
  transition: 'transform 0.3s ease-out',
}))
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Turret base -->
    <div class="relative">
      <!-- Cannon barrel -->
      <div
        v-if="turret"
        class="text-4xl origin-bottom"
        :style="rotateStyle"
      >
        {{ turret.emoji }}
      </div>
      <div v-else class="text-4xl opacity-30">🔫</div>
    </div>
    <!-- Platform -->
    <div class="w-20 h-3 bg-gray-600 rounded-t-lg"></div>
    <div class="w-24 h-2 bg-gray-700 rounded-b-lg"></div>
    <!-- Label -->
    <div v-if="turret" class="text-xs text-white mt-1 font-medium">
      {{ turret.label }}
    </div>
  </div>
</template>
