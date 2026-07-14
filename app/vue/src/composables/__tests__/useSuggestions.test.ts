import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setAdapter } from '../../adapters/environment'
import { useSuggestions } from '../useSuggestions'

/**
 * Regression tests for useSuggestions in the VS Code webview context.
 *
 * In the extension the page origin is vscode-webview://…, while the hana-cli
 * server runs at http://localhost:<port>. Relative fetches never reach the
 * server, so type-ahead suggestions silently return nothing. These tests pin
 * that every request is prefixed with the adapter's API base URL.
 */

const BASE = 'http://localhost:4321'

function makeAdapter(baseUrl: string) {
  return {
    getApiBaseUrl: () => baseUrl,
    getWebSocketUrl: () => `${baseUrl}/websockets`,
    notifyDirtyState: () => {},
    requestSave: () => {},
    getTheme: () => 'light' as const,
    onMessage: () => {},
    postMessage: () => {},
    isVSCode: () => true
  }
}

describe('useSuggestions API base URL', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setAdapter(makeAdapter(BASE))
    fetchMock = vi.fn(async (url: string) => {
      // PUT to set params returns ok; GET returns rows
      if (url.endsWith('/')) {
        return { ok: true, json: async () => ({}) } as any
      }
      return {
        ok: true,
        json: async () => [{ TABLE_NAME: 'FOO' }, { TABLE_NAME: 'BAR' }]
      } as any
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('prefixes the params PUT and the GET with the adapter base URL', async () => {
    const s = useSuggestions('tables-ui', 'TABLE_NAME')
    await s.load({ schema: 'S', table: '*', limit: 1000 })

    const urls = fetchMock.mock.calls.map(c => c[0] as string)
    expect(urls.some(u => u === `${BASE}/`)).toBe(true)
    expect(urls).toContain(`${BASE}/hana/tables-ui`)
    // No bare relative URLs that would miss the server in the webview
    expect(urls.every(u => u.startsWith(BASE))).toBe(true)
  })

  it('maps the configured name field into suggestion items', async () => {
    const s = useSuggestions('tables-ui', 'TABLE_NAME')
    await s.load({ schema: 'S2', table: '*', limit: 1000 })
    expect(s.items.value).toEqual(['FOO', 'BAR'])
  })
})
