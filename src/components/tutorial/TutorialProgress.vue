<script setup>
defineProps({
  currentStep: { type: Number, required: true },
  totalSteps: { type: Number, required: true },
  steps: { type: Array, required: true },
})
</script>

<template>
  <div class="flex items-center justify-center gap-1 py-3 px-4 bg-black/30 backdrop-blur-sm rounded-t-xl">
    <div
      v-for="(step, i) in steps"
      :key="step.id"
      class="flex items-center gap-1"
    >
      <!-- Step dot -->
      <div
        class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
        :class="
          i < currentStep
            ? 'bg-green-500 text-white'
            : i === currentStep
              ? 'bg-blue-500 text-white animate-pulse-ring ring-2 ring-blue-300'
              : 'bg-white/20 text-white/50'
        "
        :title="step.title"
      >
        <span v-if="i < currentStep">&#10003;</span>
        <span v-else>{{ i + 1 }}</span>
      </div>
      <!-- Connector line -->
      <div
        v-if="i < steps.length - 1"
        class="w-4 h-0.5 transition-colors duration-300"
        :class="i < currentStep ? 'bg-green-500' : 'bg-white/20'"
      ></div>
    </div>
  </div>
</template>
