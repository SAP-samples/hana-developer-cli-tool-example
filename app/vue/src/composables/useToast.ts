import { ref } from 'vue'

export interface ToastMessage {
  text: string
  duration?: number
}

const queue = ref<ToastMessage[]>([])
let toastEl: HTMLElement | null = null

export function useToast() {
  function show(text: string, duration = 3000) {
    if (toastEl) {
      ;(toastEl as any).textContent = text
      ;(toastEl as any).duration = duration
      ;(toastEl as any).open = true
    } else {
      queue.value.push({ text, duration })
    }
  }

  function registerElement(el: HTMLElement) {
    toastEl = el
    while (queue.value.length > 0) {
      const msg = queue.value.shift()!
      setTimeout(() => show(msg.text, msg.duration), 100)
    }
  }

  return { show, registerElement }
}

const singleton = useToast()
export const toast = singleton
