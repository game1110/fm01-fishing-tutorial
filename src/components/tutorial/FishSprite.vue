<script setup>
const props = defineProps({
  fish: { type: Object, required: true },
  clickable: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

function handleClick() {
  if (props.clickable && props.fish.alive) {
    emit('click', props.fish)
  }
}
</script>

<template>
  <div
    class="absolute select-none"
    :class="[
      fish.size,
      fish.direction === 'ltr' ? 'animate-swim-ltr' : 'animate-swim-rtl',
      clickable ? 'cursor-crosshair hover:scale-125 transition-transform' : 'pointer-events-none',
    ]"
    :style="{
      top: fish.y + '%',
      '--swim-duration': fish.duration + 's',
      animationDelay: '0s',
    }"
    @click="handleClick"
  >
    <span class="animate-bob inline-block relative">
      {{ fish.emoji }}
      <!-- Lock indicator ring -->
      <span
        v-if="locked"
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span class="w-full h-full border-2 border-red-500 rounded-full animate-ping opacity-60 absolute"></span>
        <span class="w-full h-full border-2 border-red-400 rounded-full absolute"></span>
      </span>
    </span>
  </div>
</template>
