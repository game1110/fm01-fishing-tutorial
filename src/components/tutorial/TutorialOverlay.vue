<script setup>
import { computed, ref } from 'vue'
import { useTutorialStore } from '../../stores/tutorialStore'

const props = defineProps({
  step: { type: Object, required: true },
  stepIndex: { type: Number, required: true },
  canAdvance: { type: Boolean, default: false },
  // Step 4
  shotsFired: { type: Number, default: 0 },
  requiredShots: { type: Number, default: 10 },
  // Step 5: scope
  scopeSubStep: { type: Number, default: 0 },
  scopeActive: { type: Boolean, default: false },
  scopeHits: { type: Number, default: 0 },
  // Step 6: lock-on
  lockonSubStep: { type: Number, default: 0 },
  lockonActive: { type: Boolean, default: false },
  lockonBulletsFired: { type: Number, default: 0 },
  lockonBulletLimit: { type: Number, default: 10 },
  lockonComplete: { type: Boolean, default: false },
  // Step 7: auto-fish
  autofishSubStep: { type: Number, default: 0 },
  autofishActive: { type: Boolean, default: false },
  autofishSelectedTypes: { type: Array, default: () => [] },
  autofishBulletCount: { type: Number, default: 10 },
  autofishRunning: { type: Boolean, default: false },
  autofishResults: { type: Object, default: null },
  // Completion
  tutorialCompleted: { type: Boolean, default: false },
  rewardClaimed: { type: Boolean, default: false },
})

const emit = defineEmits([
  'next', 'skip', 'select-turret', 'claim-reward', 'go-home',
  'activate-scope', 'deactivate-scope',
  'activate-lockon', 'set-lockon-bullets', 'deactivate-lockon',
  'activate-autofish', 'toggle-autofish-type', 'confirm-autofish-types',
  'set-autofish-bullets', 'start-autofish',
])

const store = useTutorialStore()

// Confetti for step 8 (index 7)
const confettiPieces = ref(
  Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][i % 6],
    left: Math.random() * 100,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 1,
  }))
)

// Lock-on bullet options
const bulletLimitOptions = [5, 10, 15, 20]
const selectedBulletLimit = ref(10)

const positionClass = computed(() => {
  switch (props.step.position) {
    case 'top': return 'top-4 left-1/2 -translate-x-1/2'
    case 'bottom': return 'bottom-20 left-1/2 -translate-x-1/2'
    case 'center':
    default: return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  }
})

// Current popup message for feature steps
const currentPopupMsg = computed(() => {
  const step = props.step
  if (!step.subSteps) return step.popupMsg

  // Step 5: scope
  if (props.stepIndex === 4) {
    return step.subSteps[Math.min(props.scopeSubStep, step.subSteps.length - 1)]?.msg
  }
  // Step 6: lock-on
  if (props.stepIndex === 5) {
    return step.subSteps[Math.min(props.lockonSubStep, step.subSteps.length - 1)]?.msg
  }
  // Step 7: auto-fish
  if (props.stepIndex === 6) {
    return step.subSteps[Math.min(props.autofishSubStep, step.subSteps.length - 1)]?.msg
  }
  return step.popupMsg
})

// Step 4: shot progress text
const step4Progress = computed(() => {
  if (props.stepIndex !== 3) return ''
  return `已射擊 ${props.shotsFired} / ${props.requiredShots} 發`
})
</script>

<template>
  <!-- Overlay backdrop for center cards -->
  <div
    v-if="step.position === 'center'"
    class="absolute inset-0 bg-black/40 z-30"
  ></div>

  <!-- Pop-up message bubble (for feature steps) -->
  <div
    v-if="currentPopupMsg && step.position !== 'center'"
    class="absolute top-2 left-1/2 -translate-x-1/2 z-40 max-w-[85%]"
  >
    <div class="bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl text-sm font-medium shadow-lg animate-bounce-gentle">
      {{ currentPopupMsg }}
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-yellow-400 rotate-45"></div>
    </div>
  </div>

  <!-- Instruction card -->
  <div
    class="absolute z-40 w-80 max-w-[90%]"
    :class="positionClass"
  >
    <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-5 border border-white/50">
      <h3 class="text-lg font-bold text-gray-800 mb-2">
        {{ step.title }}
      </h3>
      <p class="text-sm text-gray-600 leading-relaxed mb-3">
        {{ step.description }}
      </p>

      <!-- Step 3 (index 2): Turret selection -->
      <div v-if="stepIndex === 2" class="flex flex-col gap-2 mb-3">
        <button
          v-for="turret in store.turrets"
          :key="turret.id"
          class="flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all text-sm"
          :class="
            store.selectedTurret?.id === turret.id
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-blue-300 text-gray-700'
          "
          @click="emit('select-turret', turret.id)"
        >
          <span>{{ turret.emoji }} {{ turret.label }}</span>
          <span class="text-xs">
            花費 ${{ turret.cost }} ｜ 威力 x{{ turret.power }}
          </span>
        </button>
      </div>

      <!-- Step 4 (index 3): Shot progress -->
      <div v-if="stepIndex === 3" class="mb-3">
        <div class="text-sm text-gray-600 mb-1">{{ step4Progress }}</div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: Math.min(shotsFired / requiredShots * 100, 100) + '%' }"
          ></div>
        </div>
        <div v-if="shotsFired < requiredShots" class="text-xs text-blue-600 font-medium mt-2 animate-pulse">
          點擊海洋中的魚來射擊！
        </div>
        <div v-else class="text-xs text-green-600 font-medium mt-2">
          射擊完成！點擊下一步繼續。
        </div>
      </div>

      <!-- Step 5 (index 4): Scope sub-steps -->
      <div v-if="stepIndex === 4" class="mb-3">
        <!-- Sub-step 0: click scope button -->
        <div v-if="scopeSubStep === 0" class="text-sm text-blue-600 font-medium animate-pulse">
          請點擊右側 🎯 瞄準鏡按鈕
        </div>
        <!-- Sub-step 1: select fish and fire -->
        <div v-else-if="scopeSubStep === 1" class="space-y-2">
          <div class="text-sm text-blue-600 font-medium">
            {{ scopeActive ? '已啟動瞄準鏡！點擊魚種進行鎖定' : '請點擊瞄準鏡按鈕' }}
          </div>
          <div v-if="store.scopeLockedFish" class="text-xs text-green-600">
            已鎖定 {{ store.scopeLockedFish.emoji }} ！點擊右下紅色按鈕射擊
          </div>
          <div v-if="scopeHits > 0" class="text-xs text-green-600 font-bold">
            命中 {{ scopeHits }} 次！
          </div>
        </div>
        <!-- Sub-step 2: return -->
        <div v-else-if="scopeSubStep === 2">
          <div class="text-sm text-green-600 font-medium">瞄準鏡使用完成！</div>
        </div>
        <!-- Sub-step 3: done -->
        <div v-else>
          <div class="text-sm text-green-600 font-medium">瞄準鏡教學完成！</div>
        </div>
      </div>

      <!-- Step 6 (index 5): Lock-on sub-steps -->
      <div v-if="stepIndex === 5" class="mb-3">
        <!-- Sub-step 0: click lockon button -->
        <div v-if="lockonSubStep === 0" class="text-sm text-blue-600 font-medium animate-pulse">
          請點擊右側 🔒 鎖定發射按鈕
        </div>
        <!-- Sub-step 1: set bullets, select target -->
        <div v-else-if="lockonSubStep === 1" class="space-y-2">
          <div class="text-sm text-gray-700 font-medium">選擇子彈上限：</div>
          <div class="flex gap-2">
            <button
              v-for="n in bulletLimitOptions"
              :key="n"
              class="px-3 py-1 rounded-lg text-sm border-2 transition-all"
              :class="selectedBulletLimit === n
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                : 'border-gray-200 hover:border-blue-300 text-gray-600'"
              @click="selectedBulletLimit = n; emit('set-lockon-bullets', n)"
            >
              {{ n }} 發
            </button>
          </div>
          <div class="text-sm text-blue-600 font-medium animate-pulse mt-1">
            點選一隻魚開始鎖定發射
          </div>
          <div v-if="lockonBulletsFired > 0" class="text-xs text-gray-500">
            發射進度: {{ lockonBulletsFired }} / {{ lockonBulletLimit }}
          </div>
        </div>
        <!-- Sub-step 2: return -->
        <div v-else-if="lockonSubStep === 2">
          <div class="text-sm text-green-600 font-medium">鎖定發射完成！</div>
        </div>
        <!-- Sub-step 3: done -->
        <div v-else>
          <div class="text-sm text-green-600 font-medium">鎖定發射教學完成！</div>
        </div>
      </div>

      <!-- Step 7 (index 6): Auto-fish sub-steps -->
      <div v-if="stepIndex === 6" class="mb-3">
        <!-- Sub-step 0: click autofish button -->
        <div v-if="autofishSubStep === 0" class="text-sm text-blue-600 font-medium animate-pulse">
          請點擊右側 🤖 自動捕魚按鈕
        </div>
        <!-- Sub-step 1: select fish types -->
        <div v-else-if="autofishSubStep === 1" class="space-y-2">
          <div class="text-sm text-gray-700 font-medium">選擇目標魚種：</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="ft in store.autofishTargetTypes"
              :key="ft.kind"
              class="px-3 py-1 rounded-lg text-sm border-2 transition-all"
              :class="autofishSelectedTypes.includes(ft.kind)
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                : 'border-gray-200 hover:border-blue-300 text-gray-600'"
              @click="emit('toggle-autofish-type', ft.kind)"
            >
              {{ ft.emoji }} {{ ft.label }}
            </button>
          </div>
          <button
            v-if="autofishSelectedTypes.length > 0"
            class="w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors mt-1"
            @click="emit('confirm-autofish-types')"
          >
            確認選擇
          </button>
        </div>
        <!-- Sub-step 2: set bullet count -->
        <div v-else-if="autofishSubStep === 2" class="space-y-2">
          <div class="text-sm text-gray-700 font-medium">輸入子彈數量：</div>
          <div class="flex items-center gap-2">
            <input
              type="number"
              :value="autofishBulletCount"
              min="5"
              max="50"
              class="w-20 px-2 py-1 border-2 border-gray-300 rounded-lg text-center text-sm focus:border-blue-500 outline-none"
              @input="emit('set-autofish-bullets', Number($event.target.value))"
            />
            <span class="text-sm text-gray-500">發</span>
          </div>
          <div class="text-xs text-blue-600 animate-pulse">推薦輸入 10 發</div>
        </div>
        <!-- Sub-step 3: start -->
        <div v-else-if="autofishSubStep === 3 && !autofishResults" class="space-y-2">
          <div class="text-sm text-gray-700">
            目標: {{ autofishSelectedTypes.map(t => store.autofishTargetTypes.find(ft => ft.kind === t)?.emoji).join(' ') }}
            ｜ 子彈: {{ autofishBulletCount }} 發
          </div>
          <button
            v-if="!autofishRunning"
            class="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-lg transition-colors"
            @click="emit('start-autofish')"
          >
            立刻挑戰
          </button>
          <div v-else class="text-sm text-green-600 font-medium animate-pulse text-center">
            自動捕魚進行中...
          </div>
        </div>
        <!-- Auto-fish results -->
        <div v-else-if="autofishResults" class="space-y-2">
          <div class="text-sm text-green-600 font-bold">自動捕魚完成！</div>
          <div class="grid grid-cols-2 gap-2 text-center">
            <div class="bg-gray-50 rounded-lg p-2">
              <div class="text-lg font-bold text-yellow-600">{{ autofishResults.score?.toLocaleString() }}</div>
              <div class="text-xs text-gray-500">獲得分數</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-2">
              <div class="text-lg font-bold text-blue-600">{{ autofishResults.fishCaught }}</div>
              <div class="text-xs text-gray-500">捕獲數</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 8 (index 7): Stats + reward -->
      <div v-if="stepIndex === 7" class="space-y-3 mb-3">
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-lg font-bold text-yellow-600">{{ store.score.toLocaleString() }}</div>
            <div class="text-xs text-gray-500">總分數</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-lg font-bold text-blue-600">{{ store.fishCaught }}</div>
            <div class="text-xs text-gray-500">捕獲數</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-lg font-bold text-green-600">{{ store.totalShots }}</div>
            <div class="text-xs text-gray-500">射擊次數</div>
          </div>
        </div>

        <button
          v-if="!rewardClaimed"
          class="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors text-sm"
          @click="emit('claim-reward')"
        >
          領取教程獎勵 $100 Bonus
        </button>
        <div
          v-else
          class="w-full py-2 px-4 bg-green-100 text-green-700 font-bold rounded-lg text-center text-sm"
        >
          獎勵已領取！
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex items-center justify-between">
        <button
          v-if="stepIndex < 7"
          class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          @click="emit('skip')"
        >
          離開教程
        </button>
        <span v-else></span>

        <!-- Step 1: Start -->
        <button
          v-if="stepIndex === 0"
          class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          @click="emit('next')"
        >
          開始教程
        </button>
        <!-- Step 2: Next -->
        <button
          v-else-if="stepIndex === 1"
          class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          @click="emit('next')"
        >
          下一步
        </button>
        <!-- Step 3: Confirm turret -->
        <button
          v-else-if="stepIndex === 2 && store.selectedTurret"
          class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          @click="emit('next')"
        >
          確認選擇
        </button>
        <!-- Step 4: Next when 10 shots fired -->
        <button
          v-else-if="stepIndex === 3 && canAdvance"
          class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          @click="emit('next')"
        >
          下一步
        </button>
        <!-- Step 5: Scope - return button when sub-step done -->
        <button
          v-else-if="stepIndex === 4 && scopeSubStep >= 1 && scopeHits > 0"
          class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          @click="emit('deactivate-scope')"
        >
          返回
        </button>
        <!-- Step 5: Next when scope complete -->
        <button
          v-else-if="stepIndex === 4 && canAdvance"
          class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          @click="emit('next')"
        >
          下一步
        </button>
        <!-- Step 6: Lock-on - return button -->
        <button
          v-else-if="stepIndex === 5 && lockonSubStep >= 1 && lockonComplete"
          class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          @click="emit('deactivate-lockon')"
        >
          返回
        </button>
        <!-- Step 6: Next when lock-on complete -->
        <button
          v-else-if="stepIndex === 5 && canAdvance"
          class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          @click="emit('next')"
        >
          下一步
        </button>
        <!-- Step 7: Next when auto-fish results -->
        <button
          v-else-if="stepIndex === 6 && canAdvance"
          class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          @click="emit('next')"
        >
          完成教學
        </button>
        <!-- Step 8: Go home / enter game -->
        <button
          v-else-if="stepIndex === 7"
          class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          @click="emit('go-home')"
        >
          進入遊戲
        </button>
      </div>
    </div>
  </div>

  <!-- Confetti on final step -->
  <div v-if="stepIndex === 7" class="absolute inset-0 pointer-events-none z-50 overflow-hidden">
    <div
      v-for="piece in confettiPieces"
      :key="piece.id"
      class="absolute w-2 h-3 rounded-sm animate-confetti-fall"
      :style="{
        left: piece.left + '%',
        backgroundColor: piece.color,
        '--confetti-duration': piece.duration + 's',
        animationDelay: piece.delay + 's',
      }"
    ></div>
  </div>
</template>
