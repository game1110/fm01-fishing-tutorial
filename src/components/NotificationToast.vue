<script setup>
import { usePlayerStore } from '../stores/playerStore'

const store = usePlayerStore()

const typeStyles = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-16 right-4 z-50 flex flex-col gap-2 w-80">
      <TransitionGroup name="toast">
        <div
          v-for="n in store.notifications"
          :key="n.id"
          class="rounded-lg px-4 py-3 text-white text-sm shadow-lg flex items-center gap-2"
          :class="typeStyles[n.type] || typeStyles.info"
        >
          <span class="flex-1">{{ n.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.3s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
