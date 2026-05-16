import { onMounted, onUnmounted } from 'vue'

export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: (e: KeyboardEvent) => void
  description: string
  category?: string
}

const globalRegistry: Shortcut[] = []

export function getRegisteredShortcuts(): Shortcut[] {
  return [...globalRegistry]
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  function listener(e: KeyboardEvent) {
    const target = e.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ||
      target.getAttribute('contenteditable') === 'true'

    for (const s of shortcuts) {
      const ctrlMatch = (s.ctrl ?? false) === (e.ctrlKey || e.metaKey)
      const shiftMatch = (s.shift ?? false) === e.shiftKey
      const altMatch = (s.alt ?? false) === e.altKey
      const keyMatch = e.key.toLowerCase() === s.key.toLowerCase()

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        if (isInput && !s.ctrl) continue
        e.preventDefault()
        s.handler(e)
        return
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', listener)
    for (const s of shortcuts) {
      if (!globalRegistry.includes(s)) globalRegistry.push(s)
    }
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', listener)
    for (const s of shortcuts) {
      const idx = globalRegistry.indexOf(s)
      if (idx >= 0) globalRegistry.splice(idx, 1)
    }
  })
}
