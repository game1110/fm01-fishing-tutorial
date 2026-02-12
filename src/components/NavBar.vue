<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))

const playerLinks = [
  { to: '/', label: '錢包總覽' },
  { to: '/betting', label: '模擬下注' },
  { to: '/history', label: '交易紀錄' },
  { to: '/tutorial', label: '新手教程' },
]

const adminLinks = [
  { to: '/admin/events', label: '活動配置' },
  { to: '/admin/bonus', label: 'Bonus 管理' },
]
</script>

<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex items-center justify-between h-14">
        <div class="flex items-center gap-2">
          <span class="text-xl font-bold text-blue-600">🐟</span>
          <span class="font-bold text-gray-800">捕魚 Bonus 錢包</span>
        </div>

        <div class="flex items-center gap-1">
          <template v-if="!isAdmin">
            <router-link
              v-for="link in playerLinks"
              :key="link.to"
              :to="link.to"
              class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              :class="route.path === link.to
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'"
            >
              {{ link.label }}
            </router-link>
          </template>
          <template v-else>
            <router-link
              v-for="link in adminLinks"
              :key="link.to"
              :to="link.to"
              class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              :class="route.path === link.to
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'"
            >
              {{ link.label }}
            </router-link>
          </template>

          <div class="w-px h-6 bg-gray-200 mx-2"></div>

          <router-link
            :to="isAdmin ? '/' : '/admin/events'"
            class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            :class="isAdmin
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-gray-500 hover:bg-gray-100'"
          >
            {{ isAdmin ? '← 玩家端' : '管理後台 →' }}
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>
