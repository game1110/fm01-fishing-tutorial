import { ref, onMounted, onUnmounted } from 'vue'

export function useCountdown(getTargetTime) {
  const days = ref(0)
  const hours = ref(0)
  const minutes = ref(0)
  const seconds = ref(0)
  const isExpired = ref(false)
  const isUrgent = ref(false)
  let timer = null

  function update() {
    const target = typeof getTargetTime === 'function' ? getTargetTime() : getTargetTime
    const diff = target - Date.now()

    if (diff <= 0) {
      days.value = 0
      hours.value = 0
      minutes.value = 0
      seconds.value = 0
      isExpired.value = true
      isUrgent.value = false
      return
    }

    isExpired.value = false
    isUrgent.value = diff < 60 * 60 * 1000 // < 1 hour

    days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
    hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    seconds.value = Math.floor((diff % (1000 * 60)) / 1000)
  }

  onMounted(() => {
    update()
    timer = setInterval(update, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return { days, hours, minutes, seconds, isExpired, isUrgent }
}
