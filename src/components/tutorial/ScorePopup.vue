<script setup>
defineProps({
  popup: { type: Object, required: true },
})
</script>

<template>
  <div
    class="absolute pointer-events-none animate-float-up z-20"
    :style="{ top: popup.y + '%', left: popup.x + '%', transform: 'translateX(-50%)' }"
  >
    <span class="text-yellow-300 font-bold text-xl drop-shadow-lg">
      +{{ popup.score.toLocaleString() }}
    </span>
  </div>
</template>
