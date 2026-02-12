import { ref, computed } from 'vue'

const STEPS = [
  {
    id: 1,
    title: '歡迎來到捕魚大師！',
    description: '本教程將帶你體驗捕魚遊戲的各項操作功能。準備好了嗎？',
    popupMsg: null,
    interaction: 'click',
    position: 'center',
    highlight: null,
  },
  {
    id: 2,
    title: '認識遊戲場景',
    description: '看看海洋中游動的各種魚！不同魚種有不同的分數價值。稀有的魚分數更高喔！',
    popupMsg: null,
    interaction: 'click',
    position: 'top',
    highlight: null,
  },
  {
    id: 3,
    title: '選擇您的砲台',
    description: '選擇一個砲台來開始捕魚。威力越高的砲台花費越多，但更容易捕到大魚！',
    popupMsg: null,
    interaction: 'select-turret',
    position: 'bottom',
    highlight: null,
  },
  {
    id: 4,
    title: '開炮射擊！',
    description: '點擊魚群進行開炮，嘗試射擊 10 發砲彈！完成後將引導至瞄準鏡使用。',
    popupMsg: '點擊魚群進行開炮',
    interaction: 'fire-10-shots',
    position: 'top',
    highlight: null,
  },
  {
    id: 5,
    title: '使用瞄準鏡',
    description: '接下來使用瞄準鏡進行捕獲！點擊瞄準鏡按鈕開啟功能。',
    popupMsg: '接下來使用瞄準鏡進行捕獲',
    interaction: 'use-scope',
    position: 'top',
    highlight: 'scope',
    subSteps: [
      { msg: '點擊瞄準鏡按鈕開啟', action: 'activate-scope' },
      { msg: '點擊魚種後觸擊右下紅色按鈕進行子彈擊發，長按可連續擊發', action: 'scope-fire' },
      { msg: '點擊返回後使用下一個功能', action: 'scope-return' },
    ],
  },
  {
    id: 6,
    title: '鎖定發射',
    description: '使用鎖定發射功能，設定子彈上限後鎖定魚種進行自動射擊！',
    popupMsg: '接下來使用鎖定發射進行捕獲',
    interaction: 'use-lockon',
    position: 'top',
    highlight: 'lockon',
    subSteps: [
      { msg: '點擊鎖定發射按鈕開啟', action: 'activate-lockon' },
      { msg: '選擇子彈上限後，點選魚種進行鎖定發射至捕獲或達到子彈設定上限', action: 'lockon-fire' },
      { msg: '點擊返回後使用下一個功能', action: 'lockon-return' },
    ],
  },
  {
    id: 7,
    title: '自動捕魚',
    description: '使用自動捕魚功能，選擇目標魚種和子彈數量，自動進行捕撈！',
    popupMsg: '接下來使用自動捕魚進行捕獲',
    interaction: 'use-autofish',
    position: 'top',
    highlight: 'autofish',
    subSteps: [
      { msg: '點擊自動捕魚按鈕開啟', action: 'activate-autofish' },
      { msg: '選擇小丑魚與水母', action: 'select-fish-types' },
      { msg: '輸入子彈數量 10', action: 'set-bullet-count' },
      { msg: '按下立刻挑戰開始自動捕魚', action: 'start-autofish' },
    ],
  },
  {
    id: 8,
    title: '恭喜完成教學！',
    description: '你已經掌握了捕魚大師的所有基本技巧！領取你的教程獎勵吧！',
    popupMsg: '恭喜完成教學',
    interaction: 'click',
    position: 'center',
    highlight: null,
  },
]

export function useTutorialState() {
  const currentStepIndex = ref(0)
  const tutorialCompleted = ref(false)
  const rewardClaimed = ref(false)

  // Step 4: basic firing
  const shotsFiredInStep4 = ref(0)
  const REQUIRED_SHOTS = 10

  // Step 5: scope
  const scopeActive = ref(false)
  const scopeSubStep = ref(0) // 0=activate, 1=fire, 2=return
  const scopeTargetFish = ref(null)
  const scopeHits = ref(0)

  // Step 6: lock-on
  const lockonActive = ref(false)
  const lockonSubStep = ref(0) // 0=activate, 1=fire, 2=return
  const lockonBulletLimit = ref(10)
  const lockonBulletsFired = ref(0)
  const lockonTargetFish = ref(null)
  const lockonComplete = ref(false)

  // Step 7: auto-fishing
  const autofishActive = ref(false)
  const autofishSubStep = ref(0) // 0=activate, 1=select types, 2=set bullets, 3=start
  const autofishSelectedTypes = ref([])
  const autofishBulletCount = ref(10)
  const autofishRunning = ref(false)
  const autofishResults = ref(null)

  const currentStep = computed(() => STEPS[currentStepIndex.value])
  const totalSteps = STEPS.length
  const isLastStep = computed(() => currentStepIndex.value === STEPS.length - 1)

  const canAdvance = computed(() => {
    const step = currentStep.value
    if (!step) return false
    switch (step.interaction) {
      case 'click':
        return true
      case 'select-turret':
        return false
      case 'fire-10-shots':
        return shotsFiredInStep4.value >= REQUIRED_SHOTS
      case 'use-scope':
        return scopeSubStep.value >= 3
      case 'use-lockon':
        return lockonSubStep.value >= 3
      case 'use-autofish':
        return autofishResults.value !== null
      default:
        return true
    }
  })

  function nextStep() {
    if (currentStepIndex.value < STEPS.length - 1) {
      currentStepIndex.value++
    }
  }

  function goToStep(index) {
    if (index >= 0 && index < STEPS.length) {
      currentStepIndex.value = index
    }
  }

  // Step 4
  function recordShot() {
    shotsFiredInStep4.value++
  }

  // Step 5: scope
  function activateScope() {
    scopeActive.value = true
    scopeSubStep.value = 1
  }
  function setScopeTarget(fish) {
    scopeTargetFish.value = fish
  }
  function recordScopeHit() {
    scopeHits.value++
  }
  function deactivateScope() {
    scopeActive.value = false
    scopeTargetFish.value = null
    scopeSubStep.value = 3
  }

  // Step 6: lock-on
  function activateLockon() {
    lockonActive.value = true
    lockonSubStep.value = 1
  }
  function setLockonBulletLimit(n) {
    lockonBulletLimit.value = n
  }
  function setLockonTarget(fish) {
    lockonTargetFish.value = fish
  }
  function recordLockonShot() {
    lockonBulletsFired.value++
    if (lockonBulletsFired.value >= lockonBulletLimit.value) {
      lockonComplete.value = true
    }
  }
  function completeLockon() {
    lockonComplete.value = true
  }
  function deactivateLockon() {
    lockonActive.value = false
    lockonTargetFish.value = null
    lockonSubStep.value = 3
  }

  // Step 7: auto-fishing
  function activateAutofish() {
    autofishActive.value = true
    autofishSubStep.value = 1
  }
  function toggleAutofishType(type) {
    const idx = autofishSelectedTypes.value.indexOf(type)
    if (idx >= 0) {
      autofishSelectedTypes.value.splice(idx, 1)
    } else {
      autofishSelectedTypes.value.push(type)
    }
  }
  function confirmAutofishTypes() {
    if (autofishSelectedTypes.value.length > 0) {
      autofishSubStep.value = 2
    }
  }
  function setAutofishBullets(n) {
    autofishBulletCount.value = n
    autofishSubStep.value = 3
  }
  function startAutofish() {
    autofishRunning.value = true
  }
  function finishAutofish(results) {
    autofishRunning.value = false
    autofishResults.value = results
    autofishActive.value = false
  }

  // Completion
  function completeTutorial() {
    tutorialCompleted.value = true
    // Mark as completed in localStorage
    try {
      localStorage.setItem('fm01_tutorial_completed', 'true')
    } catch (e) { /* ignore */ }
  }

  function claimReward() {
    rewardClaimed.value = true
  }

  function isTutorialCompleted() {
    try {
      return localStorage.getItem('fm01_tutorial_completed') === 'true'
    } catch (e) {
      return false
    }
  }

  function reset() {
    currentStepIndex.value = 0
    tutorialCompleted.value = false
    rewardClaimed.value = false
    shotsFiredInStep4.value = 0
    scopeActive.value = false
    scopeSubStep.value = 0
    scopeTargetFish.value = null
    scopeHits.value = 0
    lockonActive.value = false
    lockonSubStep.value = 0
    lockonBulletLimit.value = 10
    lockonBulletsFired.value = 0
    lockonTargetFish.value = null
    lockonComplete.value = false
    autofishActive.value = false
    autofishSubStep.value = 0
    autofishSelectedTypes.value = []
    autofishBulletCount.value = 10
    autofishRunning.value = false
    autofishResults.value = null
  }

  return {
    // State
    currentStepIndex,
    currentStep,
    totalSteps,
    isLastStep,
    canAdvance,
    tutorialCompleted,
    rewardClaimed,
    steps: STEPS,

    // Step 4: basic firing
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

    // Step 7: auto-fishing
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
    reset,
  }
}
