<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTutorialStore } from '../stores/tutorialStore'
import { usePlayerStore } from '../stores/playerStore'
import { useTutorialState } from '../composables/useTutorialState'
import TutorialProgress from '../components/tutorial/TutorialProgress.vue'
import TutorialGameScene from '../components/tutorial/TutorialGameScene.vue'
import TutorialOverlay from '../components/tutorial/TutorialOverlay.vue'

const router = useRouter()
const store = useTutorialStore()
const playerStore = usePlayerStore()

const {
  currentStepIndex,
  currentStep,
  totalSteps,
  canAdvance,
  tutorialCompleted,
  rewardClaimed,
  steps,
  // Step 4
  shotsFiredInStep4,
  REQUIRED_SHOTS,
  recordShot,
  // Step 5: scope
  scopeActive,
  scopeSubStep,
  scopeTargetFish,
  scopeHits,
  activateScope,
  setScopeTarget,
  recordScopeHit,
  deactivateScope,
  // Step 6: lock-on
  lockonActive,
  lockonSubStep,
  lockonBulletLimit,
  lockonBulletsFired,
  lockonTargetFish,
  lockonComplete,
  activateLockon,
  setLockonBulletLimit,
  setLockonTarget,
  recordLockonShot,
  completeLockon,
  deactivateLockon,
  // Step 7: auto-fish
  autofishActive,
  autofishSubStep,
  autofishSelectedTypes,
  autofishBulletCount,
  autofishRunning,
  autofishResults,
  activateAutofish,
  toggleAutofishType,
  confirmAutofishTypes,
  setAutofishBullets,
  startAutofish,
  finishAutofish,
  // Actions
  nextStep,
  goToStep,
  completeTutorial,
  claimReward,
  isTutorialCompleted,
  reset: resetState,
} = useTutorialState()

// Exit confirmation dialog
const showExitConfirm = ref(false)

// Fish clickable in steps 4 (basic fire), 5 (scope select), 6 (lockon select)
function isFishClickable() {
  return currentStepIndex.value === 3 ||
    (currentStepIndex.value === 4 && scopeActive.value) ||
    (currentStepIndex.value === 5 && lockonActive.value)
}

// Show feature buttons from step 5 onwards
const showFeatureButtons = computed(() => currentStepIndex.value >= 4 && currentStepIndex.value <= 6)

// Current highlight
const highlightFeature = computed(() => {
  if (currentStepIndex.value === 4 && scopeSubStep.value === 0) return 'scope'
  if (currentStepIndex.value === 5 && lockonSubStep.value === 0) return 'lockon'
  if (currentStepIndex.value === 6 && autofishSubStep.value === 0) return 'autofish'
  return null
})

// Disable non-highlighted buttons
const disableNonHighlighted = computed(() => highlightFeature.value !== null)

// Start fish spawning when entering step 2
watch(currentStepIndex, (newIdx) => {
  if (newIdx >= 1) {
    store.startSpawning()
  }
  if (newIdx === 7) {
    store.stopSpawning()
    completeTutorial()
  }
})

// Watch lockon completion
watch(() => store.lockonBulletsFired, (fired) => {
  if (currentStepIndex.value === 5 && lockonActive.value) {
    recordLockonShot()
    if (fired >= store.lockonBulletLimit) {
      completeLockon()
    }
  }
})

// Watch lockon target killed
watch(() => store.lockonTarget, (target) => {
  if (currentStepIndex.value === 5 && lockonActive.value && !target && lockonBulletsFired.value > 0) {
    completeLockon()
  }
})

// Watch autofish completion
watch(() => store.autofishMode, (mode) => {
  if (currentStepIndex.value === 6 && autofishRunning.value && !mode) {
    // Auto-fish finished
    const results = store.getAutofishResults()
    finishAutofish(results)
  }
})

function handleFishClick(fish) {
  if (!store.selectedTurret) return

  // Step 4: basic firing (10 shots)
  if (currentStepIndex.value === 3) {
    recordShot()
    store.shoot(fish, null)
    return
  }

  // Step 5: scope - select target fish
  if (currentStepIndex.value === 4 && scopeActive.value) {
    store.scopeLockFish(fish)
    setScopeTarget(fish)
    return
  }

  // Step 6: lock-on - select target
  if (currentStepIndex.value === 5 && lockonActive.value && !store.lockonTarget) {
    store.lockonSelectTarget(fish)
    setLockonTarget(fish)
    return
  }
}

function handleScopeFire() {
  const result = store.scopeShoot()
  if (result?.hit) {
    recordScopeHit()
  }
}

function handleNext() {
  nextStep()
}

function handleSkip() {
  showExitConfirm.value = true
}

function confirmExit() {
  showExitConfirm.value = false
  store.stopSpawning()
  store.disableScope()
  store.disableLockon()
  store.stopAutofishing()
  goToStep(7)
  completeTutorial()
}

function cancelExit() {
  showExitConfirm.value = false
}

function handleSelectTurret(turretId) {
  store.selectTurret(turretId)
}

// Step 5: scope
function handleScopeClick() {
  if (currentStepIndex.value === 4 && scopeSubStep.value === 0) {
    store.enableScope()
    activateScope()
  }
}

function handleDeactivateScope() {
  store.disableScope()
  deactivateScope()
}

// Step 6: lock-on
function handleLockonClick() {
  if (currentStepIndex.value === 5 && lockonSubStep.value === 0) {
    activateLockon()
  }
}

function handleSetLockonBullets(n) {
  setLockonBulletLimit(n)
  store.enableLockon(n)
}

function handleDeactivateLockon() {
  store.disableLockon()
  deactivateLockon()
}

// Step 7: auto-fish
function handleAutofishClick() {
  if (currentStepIndex.value === 6 && autofishSubStep.value === 0) {
    activateAutofish()
  }
}

function handleToggleAutofishType(kind) {
  toggleAutofishType(kind)
}

function handleConfirmAutofishTypes() {
  confirmAutofishTypes()
}

function handleSetAutofishBullets(n) {
  setAutofishBullets(n)
}

function handleStartAutofish() {
  startAutofish()
  store.enableAutofish(autofishSelectedTypes.value, autofishBulletCount.value)
  store.startAutofishing()
}

function handleClaimReward() {
  if (rewardClaimed.value) return
  playerStore.grantBonus({
    type: 'PROMO',
    label: '新手教程獎勵',
    amountType: 'FIXED',
    amountValue: 100,
    wagerMultiplier: 5,
    expiryHours: 48,
    scope: ['ALL'],
  })
  claimReward()
}

function handleGoHome() {
  router.push('/')
}

onMounted(() => {
  store.reset()
  resetState()
})

onUnmounted(() => {
  store.stopSpawning()
  store.disableScope()
  store.disableLockon()
  store.stopAutofishing()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <div class="relative">
      <!-- Progress bar -->
      <TutorialProgress
        :current-step="currentStepIndex"
        :total-steps="totalSteps"
        :steps="steps"
      />

      <!-- Game scene wrapper -->
      <div class="relative mt-2">
        <TutorialGameScene
          :fish-clickable="isFishClickable()"
          :show-turret="currentStepIndex >= 2"
          :show-stats="currentStepIndex >= 3"
          :show-feature-buttons="showFeatureButtons"
          :highlight-feature="highlightFeature"
          :disable-non-highlighted="disableNonHighlighted"
          :scope-active="scopeActive"
          :lockon-active="lockonActive"
          @fish-click="handleFishClick"
          @scope-click="handleScopeClick"
          @lockon-click="handleLockonClick"
          @autofish-click="handleAutofishClick"
          @scope-fire="handleScopeFire"
        />

        <!-- Overlay -->
        <TutorialOverlay
          :step="currentStep"
          :step-index="currentStepIndex"
          :can-advance="canAdvance"
          :shots-fired="shotsFiredInStep4"
          :required-shots="REQUIRED_SHOTS"
          :scope-sub-step="scopeSubStep"
          :scope-active="scopeActive"
          :scope-hits="scopeHits"
          :lockon-sub-step="lockonSubStep"
          :lockon-active="lockonActive"
          :lockon-bullets-fired="lockonBulletsFired"
          :lockon-bullet-limit="lockonBulletLimit"
          :lockon-complete="lockonComplete"
          :autofish-sub-step="autofishSubStep"
          :autofish-active="autofishActive"
          :autofish-selected-types="autofishSelectedTypes"
          :autofish-bullet-count="autofishBulletCount"
          :autofish-running="autofishRunning"
          :autofish-results="autofishResults"
          :tutorial-completed="tutorialCompleted"
          :reward-claimed="rewardClaimed"
          @next="handleNext"
          @skip="handleSkip"
          @select-turret="handleSelectTurret"
          @claim-reward="handleClaimReward"
          @go-home="handleGoHome"
          @activate-scope="handleScopeClick"
          @deactivate-scope="handleDeactivateScope"
          @activate-lockon="handleLockonClick"
          @set-lockon-bullets="handleSetLockonBullets"
          @deactivate-lockon="handleDeactivateLockon"
          @activate-autofish="handleAutofishClick"
          @toggle-autofish-type="handleToggleAutofishType"
          @confirm-autofish-types="handleConfirmAutofishTypes"
          @set-autofish-bullets="handleSetAutofishBullets"
          @start-autofish="handleStartAutofish"
        />
      </div>
    </div>

    <!-- Exit confirmation dialog -->
    <div
      v-if="showExitConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full">
        <h3 class="text-lg font-bold text-gray-800 mb-2">是否確定離開？</h3>
        <p class="text-sm text-gray-600 mb-4">
          離開後教程將不會再次觸發，你確定要離開新手教程嗎？
        </p>
        <div class="flex gap-3">
          <button
            class="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium"
            @click="cancelExit"
          >
            繼續教程
          </button>
          <button
            class="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
            @click="confirmExit"
          >
            確定離開
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
