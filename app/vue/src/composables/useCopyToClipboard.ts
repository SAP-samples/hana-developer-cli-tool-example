import { ref } from 'vue'
import { toast } from './useToast'

const copiedKey = ref<string | null>(null)

export function useCopyToClipboard() {
  async function copy(value: any, identifier?: string) {
    const text = value === null || value === undefined ? '' : String(value)
    await navigator.clipboard.writeText(text)
    copiedKey.value = identifier ?? null
    toast.show('Copied to clipboard', 1500)
    setTimeout(() => { copiedKey.value = null }, 1500)
  }

  return { copiedKey, copy }
}
