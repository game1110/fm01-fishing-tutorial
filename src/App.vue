<script setup>
import NavBar from './components/NavBar.vue'
import NotificationToast from './components/NotificationToast.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />
    <main class="pb-8">
      <router-view />
    </main>
    <NotificationToast />
  </div>
</template>
