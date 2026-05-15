import { ref } from 'vue'

export interface HelpTopic {
  key: string
  label: string
  helpText: string
}

const cache = new Map<string, HelpTopic[]>()
const loading = ref(false)

function parseProperties(text: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    map.set(trimmed.slice(0, eq).trim(), trimmed.slice(eq + 1).trim())
  }
  return map
}

function buildTopics(props: Map<string, string>): HelpTopic[] {
  const topics: HelpTopic[] = []
  const description = props.get('appDescription') || ''

  if (description) {
    topics.push({ key: '_about', label: 'About This Screen', helpText: description })
  }

  for (const [key, value] of props) {
    if (!key.startsWith('help.')) continue
    const paramKey = key.slice(5)
    const label = props.get(paramKey) || paramKey
    topics.push({ key: paramKey, label, helpText: value })
  }

  return topics
}

export function useHelpTopics() {
  const topics = ref<HelpTopic[]>([])

  async function loadTopics(commandName: string) {
    if (!commandName) {
      topics.value = []
      return
    }

    if (cache.has(commandName)) {
      topics.value = cache.get(commandName)!
      return
    }

    loading.value = true
    try {
      const res = await fetch(`/i18n/${commandName}.properties`)
      if (!res.ok) {
        topics.value = []
        return
      }
      const text = await res.text()
      const props = parseProperties(text)
      const built = buildTopics(props)
      cache.set(commandName, built)
      topics.value = built
    } catch {
      topics.value = []
    } finally {
      loading.value = false
    }
  }

  return { topics, loading, loadTopics }
}
