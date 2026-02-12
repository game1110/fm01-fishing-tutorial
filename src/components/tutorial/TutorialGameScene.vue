<script setup>
import { computed } from 'vue'
import { useTutorialStore } from '../../stores/tutorialStore'
import FishSprite from './FishSprite.vue'
import TurretCannon from './TurretCannon.vue'
import BulletEffect from './BulletEffect.vue'
import ScorePopup from './ScorePopup.vue'

const props = defineProps({
  fishClickable: { type: Boolean, default: false },
  showTurret: { type: Boolean, default: true },
  showStats: { type: Boolean, default: false },
  showFeatureButtons: { type: Boolean, default: false },
  highlightFeature: { type: String, default: null }, // 'scope' | 'lockon' | 'autofish'
  disableNonHighlighted: { type: Boolean, default: false },
  scopeActive: { type: Boolean, default: false },
  lockonActive: { type: Boolean, default: false },
})

const emit = defineEmits(['fish-click', 'scope-click', 'lockon-click', 'autofish-click', 'scope-fire'])

const store = useTutorialStore()

function onFishClick(fish) {
  emit('fish-click', fish)
}

const statsVisible = computed(() => props.showStats && store.selectedTurret)

function isBtnHighlighted(feature) {
  return props.highlightFeature === feature
}

function isBtnDisabled(feature) {
  return props.disableNonHighlighted && props.highlightFeature && props.highlightFeature !== feature
}
</script>

<template>
  <div class="relative w-full overflow-hidden rounded-xl" style="aspect-ratio: 16/9;">
    <!-- Ocean background -->
    <div
      class="absolute inset-0 animate-water-shimmer"
      style="
        background: linear-gradient(180deg, #0c4a6e 0%, #0369a1 30%, #0ea5e9 60%, #38bdf8 100%);
        background-size: 200% 200%;
      "
    >
      <div class="absolute inset-0 opacity-10">
        <div
          v-for="i in 5"
          :key="i"
          class="absolute w-full h-px bg-white"
          :style="{ top: (15 + i * 12) + '%' }"
        ></div>
      </div>
    </div>

    <!-- Scope crosshair overlay -->
    <div
      v-if="scopeActive"
      class="absolute inset-0 z-5 pointer-events-none"
    >
      <div class="absolute inset-0 border-2 border-red-400/30 rounded-xl"></div>
      <div class="absolute top-1/2 left-0 right-0 h-px bg-red-400/40"></div>
      <div class="absolute left-1/2 top-0 bottom-0 w-px bg-red-400/40"></div>
    </div>

    <!-- Lock-on indicator -->
    <div
      v-if="lockonActive && store.lockonTarget"
      class="absolute z-15 pointer-events-none animate-pulse"
      :style="{ top: store.lockonTarget.y + '%', left: '50%', transform: 'translate(-50%, -50%)' }"
    >
      <div class="w-16 h-16 border-2 border-red-500 rounded-full flex items-center justify-center">
        <div class="w-10 h-10 border border-red-400 rounded-full"></div>
      </div>
    </div>

    <!-- Fish layer -->
    <FishSprite
      v-for="fish in store.fishes"
      :key="fish.id"
      :fish="fish"
      :clickable="fishClickable"
      :locked="store.scopeLockedFish?.id === fish.id || store.lockonTarget?.id === fish.id"
      @click="onFishClick"
    />

    <!-- Bullet effects -->
    <BulletEffect
      v-for="bullet in store.bullets"
      :key="bullet.id"
      :bullet="bullet"
      :target-y="store.fishes.find(f => f.id === bullet.targetFishId)?.y || 50"
    />

    <!-- Score popups -->
    <ScorePopup
      v-for="popup in store.scorePopups"
      :key="popup.id"
      :popup="popup"
    />

    <!-- Feature buttons (right side) -->
    <div
      v-if="showFeatureButtons"
      class="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20"
    >
      <!-- Scope button -->
      <button
        class="relative w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all"
        :class="[
          isBtnHighlighted('scope')
            ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-highlight-pulse ring-2 ring-yellow-300'
            : store.scopeMode
              ? 'bg-red-500 text-white'
              : 'bg-white/20 hover:bg-white/30 text-white',
          isBtnDisabled('scope') ? 'opacity-30 pointer-events-none' : ''
        ]"
        @click="emit('scope-click')"
      >
        <span>🎯</span>
        <span
          v-if="isBtnHighlighted('scope')"
          class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"
        ></span>
      </button>

      <!-- Lock-on button -->
      <button
        class="relative w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all"
        :class="[
          isBtnHighlighted('lockon')
            ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-highlight-pulse ring-2 ring-yellow-300'
            : store.lockonMode
              ? 'bg-red-500 text-white'
              : 'bg-white/20 hover:bg-white/30 text-white',
          isBtnDisabled('lockon') ? 'opacity-30 pointer-events-none' : ''
        ]"
        @click="emit('lockon-click')"
      >
        <span>🔒</span>
        <span
          v-if="isBtnHighlighted('lockon')"
          class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"
        ></span>
      </button>

      <!-- Auto-fish button -->
      <button
        class="relative w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all"
        :class="[
          isBtnHighlighted('autofish')
            ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-highlight-pulse ring-2 ring-yellow-300'
            : store.autofishMode
              ? 'bg-green-500 text-white'
              : 'bg-white/20 hover:bg-white/30 text-white',
          isBtnDisabled('autofish') ? 'opacity-30 pointer-events-none' : ''
        ]"
        @click="emit('autofish-click')"
      >
        <span>🤖</span>
        <span
          v-if="isBtnHighlighted('autofish')"
          class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"
        ></span>
      </button>
    </div>

    <!-- Scope fire button (bottom right, red) -->
    <button
      v-if="scopeActive && store.scopeLockedFish"
      class="absolute bottom-4 right-4 z-20 w-14 h-14 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-full flex items-center justify-center text-white text-2xl shadow-lg transition-all animate-highlight-pulse"
      @click="emit('scope-fire')"
    >
      🔥
    </button>

    <!-- Lock-on progress -->
    <div
      v-if="lockonActive && store.lockonBulletsFired > 0"
      class="absolute bottom-4 left-4 z-20 bg-black/60 rounded-lg px-3 py-1 text-white text-xs"
    >
      子彈: {{ store.lockonBulletsFired }} / {{ store.lockonBulletLimit }}
    </div>

    <!-- Auto-fish progress -->
    <div
      v-if="store.autofishMode"
      class="absolute bottom-4 left-4 z-20 bg-black/60 rounded-lg px-3 py-1 text-white text-xs"
    >
      自動捕魚中... {{ store.autofishBulletsFired }} / {{ store.autofishBullets }}
    </div>

    <!-- Turret at bottom center -->
    <div
      v-if="showTurret"
      class="absolute bottom-2 left-1/2 -translate-x-1/2 z-10"
    >
      <TurretCannon
        :turret="store.selectedTurret"
        :angle="store.turretAngle"
      />
    </div>

    <!-- Sandy bottom -->
    <div
      class="absolute bottom-0 left-0 right-0 h-12"
      style="background: linear-gradient(180deg, transparent 0%, #92702480 40%, #a8845060 100%);"
    ></div>
  </div>

  <!-- Stats bar -->
  <div
    v-if="statsVisible"
    class="flex items-center justify-center gap-6 py-2 px-4 bg-gray-800 rounded-b-xl text-white text-sm"
  >
    <div>
      <span class="text-gray-400">分數:</span>
      <span class="font-bold text-yellow-400 ml-1">{{ store.score.toLocaleString() }}</span>
    </div>
    <div class="w-px h-4 bg-gray-600"></div>
    <div>
      <span class="text-gray-400">金幣:</span>
      <span class="font-bold text-green-400 ml-1">${{ store.coins.toLocaleString() }}</span>
    </div>
    <div class="w-px h-4 bg-gray-600"></div>
    <div>
      <span class="text-gray-400">捕獲:</span>
      <span class="font-bold text-blue-400 ml-1">{{ store.fishCaught }} 隻</span>
    </div>
    <div class="w-px h-4 bg-gray-600"></div>
    <div>
      <span class="text-gray-400">射擊:</span>
      <span class="font-bold text-purple-400 ml-1">{{ store.totalShots }} 發</span>
    </div>
  </div>
</template>
