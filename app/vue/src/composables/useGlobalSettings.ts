import { reactive } from 'vue'

export interface GlobalSettings {
  admin: boolean
  conn: string
  disableVerbose: boolean
  debug: boolean
}

const STORAGE_KEY = 'hana-cli-global-settings'

function loadFromStorage(): GlobalSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaults(), ...JSON.parse(raw) }
  } catch { /* ignore parse errors */ }
  return defaults()
}

function defaults(): GlobalSettings {
  return { admin: false, conn: '', disableVerbose: false, debug: false }
}

const settings = reactive<GlobalSettings>(loadFromStorage())

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function useGlobalSettings() {
  function update(patch: Partial<GlobalSettings>) {
    Object.assign(settings, patch)
    save()
  }

  function getApiParams(): Record<string, any> {
    const params: Record<string, any> = {}
    if (settings.admin) params.admin = true
    if (settings.conn) params.conn = settings.conn
    if (settings.disableVerbose) params.disableVerbose = true
    if (settings.debug) params.debug = true
    return params
  }

  return { settings, update, getApiParams }
}
