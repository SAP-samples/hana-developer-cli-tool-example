import { ref, computed } from 'vue'
import { toast } from './useToast'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  timestamp: number
  read: boolean
}

const STORAGE_KEY = 'hana-cli-notifications'
const MAX_ENTRIES = 100

function load(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function persist(items: Notification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)))
}

const notifications = ref<Notification[]>(load())

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function notify(type: Notification['type'], title: string, message?: string) {
  const entry: Notification = {
    id: crypto.randomUUID(),
    type,
    title,
    message,
    timestamp: Date.now(),
    read: false
  }
  notifications.value.unshift(entry)
  if (notifications.value.length > MAX_ENTRIES) {
    notifications.value = notifications.value.slice(0, MAX_ENTRIES)
  }
  persist(notifications.value)

  const duration = type === 'error' ? 5000 : 3000
  toast.show(title, duration)
}

function dismiss(id: string) {
  notifications.value = notifications.value.filter(n => n.id !== id)
  persist(notifications.value)
}

function markAllRead() {
  notifications.value.forEach(n => { n.read = true })
  persist(notifications.value)
}

function clearAll() {
  notifications.value = []
  persist(notifications.value)
}

export function useNotifications() {
  return { notifications, unreadCount, notify, dismiss, markAllRead, clearAll }
}
