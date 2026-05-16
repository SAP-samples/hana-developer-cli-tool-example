import { ref } from 'vue'

export interface HelpTopic {
  key: string
  label: string
  helpText: string
}

const topicCache = new Map<string, HelpTopic[]>()
const docsCache = new Map<string, string>()
const loading = ref(false)
const docsLoading = ref(false)

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
  const documentation = ref('')

  async function loadTopics(commandName: string) {
    if (!commandName) {
      topics.value = []
      documentation.value = ''
      return
    }

    if (topicCache.has(commandName)) {
      topics.value = topicCache.get(commandName)!
    } else {
      loading.value = true
      try {
        const res = await fetch(`/i18n/${commandName}.properties`)
        if (res.ok) {
          const text = await res.text()
          const props = parseProperties(text)
          const built = buildTopics(props)
          topicCache.set(commandName, built)
          topics.value = built
        } else {
          topics.value = []
        }
      } catch {
        topics.value = []
      } finally {
        loading.value = false
      }
    }

    if (docsCache.has(commandName)) {
      documentation.value = docsCache.get(commandName)!
    } else {
      docsLoading.value = true
      try {
        const res = await fetch(`/api/docs/${commandName}`)
        if (res.ok) {
          const md = await res.text()
          docsCache.set(commandName, md)
          documentation.value = md
        } else {
          documentation.value = ''
        }
      } catch {
        documentation.value = ''
      } finally {
        docsLoading.value = false
      }
    }
  }

  return { topics, documentation, loading, docsLoading, loadTopics }
}
