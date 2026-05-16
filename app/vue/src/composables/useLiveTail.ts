import { ref, onUnmounted } from 'vue'

export interface LiveTailOptions {
  onError?: (consecutiveErrors: number) => void
  onAutoStop?: () => void
}

export function useLiveTail(options: LiveTailOptions = {}) {
  const isWatching = ref(false)
  const interval = ref(Number(localStorage.getItem('hana-cli-live-tail-interval') || 5000))

  let timer: ReturnType<typeof setInterval> | null = null
  let executing = false
  let consecutiveErrors = 0
  let currentExecuteFn: (() => Promise<void>) | null = null

  async function tick() {
    if (executing || !currentExecuteFn) return
    executing = true
    try {
      await currentExecuteFn()
      consecutiveErrors = 0
    } catch {
      consecutiveErrors++
      options.onError?.(consecutiveErrors)
      if (consecutiveErrors >= 3) {
        stop()
        options.onAutoStop?.()
      }
    } finally {
      executing = false
    }
  }

  function start(executeFn: () => Promise<void>) {
    if (isWatching.value) return
    currentExecuteFn = executeFn
    isWatching.value = true
    consecutiveErrors = 0

    tick()
    timer = setInterval(tick, interval.value)
  }

  function stop() {
    isWatching.value = false
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    executing = false
    currentExecuteFn = null
  }

  function updateInterval(ms: number) {
    interval.value = ms
    localStorage.setItem('hana-cli-live-tail-interval', String(ms))
    if (isWatching.value && currentExecuteFn) {
      if (timer) clearInterval(timer)
      timer = setInterval(tick, ms)
    }
  }

  onUnmounted(() => stop())

  return {
    isWatching,
    interval,
    start,
    stop,
    updateInterval
  }
}
