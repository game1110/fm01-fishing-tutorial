<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  bullet: { type: Object, required: true },
  targetY: { type: Number, default: 50 },
})

const phase = ref('flying') // flying | splash

onMounted(() => {
  // After bullet flies, show splash
  setTimeout(() => {
    phase.value = 'splash'
  }, 400)
})
</script>

<template>
  <div class="absolute inset-0 pointer-events-none">
    <!-- Bullet flying -->
    <div
      v-if="phase === 'flying'"
      class="absolute left-1/2 transition-all duration-[400ms] ease-out"
      :style="{
        bottom: phase === 'flying' ? (100 - targetY) + '%' : '10%',
        transform: 'translateX(-50%)',
      }"
    >
      <span class="text-yellow-400 text-lg">💫</span>
    </div>

    <!-- Splash effect -->
    <div
      v-if="phase === 'splash'"
      class="absolute left-1/2"
      :style="{ top: targetY + '%', transform: 'translateX(-50%)' }"
    >
      <span
        class="animate-splash inline-block"
        :class="bullet.hit ? 'text-2xl' : 'text-xl'"
      >
        {{ bullet.hit ? '💥' : '💨' }}
      </span>
    </div>
  </div>
</template>
