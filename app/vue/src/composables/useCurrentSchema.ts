import { ref } from 'vue'

const resolvedSchema = ref('')
let fetched = false

async function fetchCurrentSchema() {
  if (fetched) return
  fetched = true
  try {
    await fetch('/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    const res = await fetch('/hana')
    if (!res.ok) return
    const data = await res.json()
    if (data.user?.[0]?.CURRENT_SCHEMA) {
      resolvedSchema.value = data.user[0].CURRENT_SCHEMA
    }
  } catch {
    // silently ignore - schema display is cosmetic
  }
}

export function useCurrentSchema() {
  fetchCurrentSchema()
  return { resolvedSchema }
}
