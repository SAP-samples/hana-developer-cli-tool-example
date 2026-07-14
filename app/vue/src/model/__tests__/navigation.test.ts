import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { navigation } from '../navigation'

/**
 * Nav contract tests.
 *
 * `navigation.ts` is the SINGLE source of truth for the side menu rendered by
 * BOTH `hana-cli ui` and the VS Code extension webview (the extension ships a
 * copy of the same Vue build). These tests pin the menu structure so a future
 * change cannot silently drop an entry — e.g. the Export command going missing
 * from the "Import / Export / Convert" group.
 */

// Parse route names straight from the router source. Importing router.ts here
// would instantiate createWebHashHistory(), which needs a DOM `location` we
// don't want to stand up just to read the route table.
const routerSrc = readFileSync(
  fileURLToPath(new URL('../../router.ts', import.meta.url)),
  'utf8'
)
const routeNames = new Set(
  [...routerSrc.matchAll(/name:\s*'([^']+)'/g)].map(m => m[1])
)
describe('navigation contract', () => {
  it('exposes the Import / Export / Convert group with all three tools', () => {
    const tools = navigation.find(g => g.key === 'tools')
    expect(tools, "nav group 'tools' must exist").toBeDefined()
    expect(tools!.title).toBe('Import / Export / Convert')
    expect(tools!.items.map(i => i.key)).toEqual(['import', 'export', 'massConvert'])
  })

  it('has unique group keys and unique item keys', () => {
    const groupKeys = navigation.map(g => g.key)
    expect(new Set(groupKeys).size).toBe(groupKeys.length)

    const itemKeys = navigation.flatMap(g => g.items.map(i => i.key))
    expect(new Set(itemKeys).size).toBe(itemKeys.length)
  })

  it('every route-based nav item resolves to a registered router route', () => {
    const missing = navigation
      .flatMap(g => g.items)
      .filter(i => i.route)
      .map(i => i.route!)
      .filter(route => !routeNames.has(route))

    expect(missing, `nav items point at unregistered routes: ${missing.join(', ')}`)
      .toEqual([])
  })
})
