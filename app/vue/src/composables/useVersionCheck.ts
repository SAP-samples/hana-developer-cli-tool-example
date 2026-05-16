import { useNotifications } from './useNotifications'
import { useHanaApi } from './useHanaApi'

const LAST_KNOWN_KEY = 'hana-cli-last-known-version'
const UPDATE_NOTIFIED_KEY = 'hana-cli-update-notified-version'

let checked = false

export async function checkVersion() {
  if (checked) return
  checked = true

  const { notify } = useNotifications()
  const { fetchDirect } = useHanaApi()

  try {
    const info = await fetchDirect<Record<string, string>>('/hana/version-ui')
    const current = info['hana-cli']
    const latest = info['latestVersion']
    if (!current) return

    const lastKnown = localStorage.getItem(LAST_KNOWN_KEY)

    if (lastKnown && lastKnown !== current && isNewer(current, lastKnown)) {
      notify('success', `Updated to v${current}`, `hana-cli has been updated from v${lastKnown}.`)
    }

    localStorage.setItem(LAST_KNOWN_KEY, current)

    if (latest && latest !== current && isNewer(latest, current)) {
      const alreadyNotified = localStorage.getItem(UPDATE_NOTIFIED_KEY)
      if (alreadyNotified !== latest) {
        notify('info', `Update available: v${latest}`, `Run "npm update -g hana-cli" to upgrade from v${current}.`)
        localStorage.setItem(UPDATE_NOTIFIED_KEY, latest)
      }
    }
  } catch {
    // Version check is non-critical — fail silently
  }
}

function isNewer(a: string, b: string): boolean {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return true
    if ((pa[i] || 0) < (pb[i] || 0)) return false
  }
  return false
}
