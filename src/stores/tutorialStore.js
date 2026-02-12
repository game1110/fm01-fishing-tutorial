import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const FISH_TYPES = [
  { kind: 'small', emoji: '🐟', label: '小丑魚', minScore: 10, maxScore: 50, size: 'text-2xl', weight: 50 },
  { kind: 'medium', emoji: '🐠', label: '熱帶魚', minScore: 100, maxScore: 300, size: 'text-3xl', weight: 25 },
  { kind: 'large', emoji: '🐡', label: '河豚', minScore: 500, maxScore: 1000, size: 'text-4xl', weight: 15 },
  { kind: 'jellyfish', emoji: '🪼', label: '水母', minScore: 200, maxScore: 600, size: 'text-3xl', weight: 20 },
  { kind: 'rare', emoji: '🦈', label: '鯊魚', minScore: 2000, maxScore: 5000, size: 'text-5xl', weight: 8 },
  { kind: 'boss', emoji: '🐳', label: '鯨魚', minScore: 10000, maxScore: 10000, size: 'text-6xl', weight: 2 },
]

const TURRETS = [
  { id: 'basic', label: '初級砲台', cost: 10, power: 1, emoji: '🔫' },
  { id: 'medium', label: '中級砲台', cost: 30, power: 2, emoji: '💥' },
  { id: 'advanced', label: '高級砲台', cost: 50, power: 3, emoji: '🚀' },
]

// Fish types available for auto-fishing target selection
const AUTOFISH_TARGETS = FISH_TYPES.filter(f => ['small', 'medium', 'jellyfish', 'large'].includes(f.kind))

const MAX_FISH = 10

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickFishType() {
  const totalWeight = FISH_TYPES.reduce((s, f) => s + f.weight, 0)
  let roll = Math.random() * totalWeight
  for (const ft of FISH_TYPES) {
    roll -= ft.weight
    if (roll <= 0) return ft
  }
  return FISH_TYPES[0]
}

let nextFishId = 1
let nextBulletId = 1

export const useTutorialStore = defineStore('tutorial', () => {
  // Game state
  const fishes = ref([])
  const bullets = ref([])
  const scorePopups = ref([])
  const score = ref(0)
  const coins = ref(500)
  const fishCaught = ref(0)
  const totalShots = ref(0)
  const selectedTurret = ref(null)
  const turretAngle = ref(0)

  // Scope mode
  const scopeMode = ref(false)
  const scopeLockedFish = ref(null)

  // Lock-on mode
  const lockonMode = ref(false)
  const lockonTarget = ref(null)
  const lockonBulletLimit = ref(10)
  const lockonBulletsFired = ref(0)
  const lockonAutoFireInterval = ref(null)

  // Auto-fishing mode
  const autofishMode = ref(false)
  const autofishTargets = ref([])
  const autofishBullets = ref(10)
  const autofishBulletsFired = ref(0)
  const autofishInterval = ref(null)

  // Spawning
  let spawnInterval = null

  const turrets = TURRETS
  const fishTypes = FISH_TYPES
  const autofishTargetTypes = AUTOFISH_TARGETS

  const isMaxFish = computed(() => fishes.value.length >= MAX_FISH)

  function spawnFish() {
    if (fishes.value.length >= MAX_FISH) return null
    const type = pickFishType()
    const direction = Math.random() > 0.5 ? 'ltr' : 'rtl'
    const yPercent = randomBetween(5, 60)
    const duration = randomBetween(6, 14)
    const fishScore = randomBetween(type.minScore, type.maxScore)
    const fish = {
      id: nextFishId++,
      ...type,
      score: fishScore,
      direction,
      y: yPercent,
      duration,
      alive: true,
      createdAt: Date.now(),
    }
    fishes.value.push(fish)
    setTimeout(() => {
      removeFish(fish.id)
    }, duration * 1000)
    return fish
  }

  function removeFish(fishId) {
    fishes.value = fishes.value.filter((f) => f.id !== fishId)
    // Clear scope/lockon if targeted fish is removed
    if (scopeLockedFish.value?.id === fishId) {
      scopeLockedFish.value = null
    }
    if (lockonTarget.value?.id === fishId) {
      lockonTarget.value = null
      stopLockonAutoFire()
    }
  }

  function startSpawning() {
    if (spawnInterval) return
    for (let i = 0; i < 5; i++) {
      spawnFish()
    }
    spawnInterval = setInterval(() => {
      if (fishes.value.length < MAX_FISH) {
        spawnFish()
      }
    }, 1500)
  }

  function stopSpawning() {
    if (spawnInterval) {
      clearInterval(spawnInterval)
      spawnInterval = null
    }
  }

  function selectTurret(turretId) {
    selectedTurret.value = TURRETS.find((t) => t.id === turretId) || null
  }

  function shoot(targetFish, forceHit = null) {
    if (!selectedTurret.value || !targetFish) return null
    totalShots.value++

    coins.value -= selectedTurret.value.cost

    const bulletId = nextBulletId++
    const bullet = {
      id: bulletId,
      targetFishId: targetFish.id,
      hit: forceHit,
      turret: selectedTurret.value,
      createdAt: Date.now(),
    }
    bullets.value.push(bullet)

    setTimeout(() => {
      bullets.value = bullets.value.filter((b) => b.id !== bulletId)
    }, 800)

    if (forceHit === true || (forceHit === null && Math.random() < 0.4 + selectedTurret.value.power * 0.15)) {
      const earnedScore = targetFish.score * selectedTurret.value.power
      score.value += earnedScore
      coins.value += Math.round(earnedScore / 10)
      fishCaught.value++

      const popup = { id: bulletId, score: earnedScore, x: 50, y: targetFish.y }
      scorePopups.value.push(popup)
      setTimeout(() => {
        scorePopups.value = scorePopups.value.filter((p) => p.id !== popup.id)
      }, 1000)

      removeFish(targetFish.id)
      return { hit: true, score: earnedScore }
    }

    return { hit: false, score: 0 }
  }

  // Scope mode
  function enableScope() {
    scopeMode.value = true
    scopeLockedFish.value = null
  }

  function disableScope() {
    scopeMode.value = false
    scopeLockedFish.value = null
  }

  function scopeLockFish(fish) {
    scopeLockedFish.value = fish
  }

  function scopeShoot() {
    if (!scopeLockedFish.value) return null
    return shoot(scopeLockedFish.value, null)
  }

  // Lock-on mode
  function enableLockon(bulletLimit = 10) {
    lockonMode.value = true
    lockonBulletLimit.value = bulletLimit
    lockonBulletsFired.value = 0
    lockonTarget.value = null
  }

  function disableLockon() {
    stopLockonAutoFire()
    lockonMode.value = false
    lockonTarget.value = null
    lockonBulletsFired.value = 0
  }

  function lockonSelectTarget(fish) {
    lockonTarget.value = fish
    // Start auto-firing at target
    startLockonAutoFire()
  }

  function startLockonAutoFire() {
    stopLockonAutoFire()
    lockonAutoFireInterval.value = setInterval(() => {
      if (!lockonTarget.value || lockonBulletsFired.value >= lockonBulletLimit.value) {
        stopLockonAutoFire()
        return
      }
      lockonBulletsFired.value++
      const result = shoot(lockonTarget.value, null)
      if (result?.hit) {
        stopLockonAutoFire()
      }
    }, 500)
  }

  function stopLockonAutoFire() {
    if (lockonAutoFireInterval.value) {
      clearInterval(lockonAutoFireInterval.value)
      lockonAutoFireInterval.value = null
    }
  }

  // Auto-fishing mode
  function enableAutofish(targetKinds, bulletCount) {
    autofishMode.value = true
    autofishTargets.value = targetKinds
    autofishBullets.value = bulletCount
    autofishBulletsFired.value = 0
  }

  function startAutofishing() {
    autofishInterval.value = setInterval(() => {
      if (autofishBulletsFired.value >= autofishBullets.value) {
        stopAutofishing()
        return
      }
      // Find a matching fish
      const target = fishes.value.find(f => autofishTargets.value.includes(f.kind) && f.alive)
      if (target) {
        autofishBulletsFired.value++
        shoot(target, null)
      }
    }, 600)
  }

  function stopAutofishing() {
    if (autofishInterval.value) {
      clearInterval(autofishInterval.value)
      autofishInterval.value = null
    }
    autofishMode.value = false
  }

  function getAutofishResults() {
    return {
      bulletsUsed: autofishBulletsFired.value,
      totalBullets: autofishBullets.value,
      score: score.value,
      fishCaught: fishCaught.value,
    }
  }

  function reset() {
    stopSpawning()
    stopLockonAutoFire()
    stopAutofishing()
    fishes.value = []
    bullets.value = []
    scorePopups.value = []
    score.value = 0
    coins.value = 500
    fishCaught.value = 0
    totalShots.value = 0
    selectedTurret.value = null
    turretAngle.value = 0
    scopeMode.value = false
    scopeLockedFish.value = null
    lockonMode.value = false
    lockonTarget.value = null
    lockonBulletLimit.value = 10
    lockonBulletsFired.value = 0
    autofishMode.value = false
    autofishTargets.value = []
    autofishBullets.value = 10
    autofishBulletsFired.value = 0
    nextFishId = 1
    nextBulletId = 1
  }

  return {
    // Game state
    fishes,
    bullets,
    scorePopups,
    score,
    coins,
    fishCaught,
    totalShots,
    selectedTurret,
    turretAngle,
    turrets,
    fishTypes,
    autofishTargetTypes,
    isMaxFish,

    // Basic
    spawnFish,
    removeFish,
    startSpawning,
    stopSpawning,
    selectTurret,
    shoot,

    // Scope
    scopeMode,
    scopeLockedFish,
    enableScope,
    disableScope,
    scopeLockFish,
    scopeShoot,

    // Lock-on
    lockonMode,
    lockonTarget,
    lockonBulletLimit,
    lockonBulletsFired,
    enableLockon,
    disableLockon,
    lockonSelectTarget,
    stopLockonAutoFire,

    // Auto-fishing
    autofishMode,
    autofishTargets,
    autofishBullets,
    autofishBulletsFired,
    enableAutofish,
    startAutofishing,
    stopAutofishing,
    getAutofishResults,

    reset,
  }
})
