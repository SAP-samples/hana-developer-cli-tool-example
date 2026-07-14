import * as assert from 'assert'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { discoverConfigDirs } from '../../src/connection/discovery.js'

let tmpRoot: string

function write(rel: string, contents: string): void {
  const full = path.join(tmpRoot, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, contents)
}

suite('Connection config discovery', () => {
  setup(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'hana-cli-discovery-'))
  })

  teardown(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  test('finds a CAP project config in a subfolder', () => {
    // Mirrors the cloud-cap-hana-swapi layout: config lives in cap/, not root
    write('cap/package.json', JSON.stringify({ dependencies: { '@sap/cds': '^10.0.3' } }))
    write('cap/.cdsrc-private.json', JSON.stringify({ requires: { db: { credentials: { host: 'h' } } } }))

    const found = discoverConfigDirs(tmpRoot, 3)

    assert.strictEqual(found.length, 1, 'expected exactly one candidate')
    assert.strictEqual(found[0].dir, path.join(tmpRoot, 'cap'))
    assert.ok(found[0].kinds.includes('cap'), 'candidate should be flagged as cap')
  })

  test('finds a default-env.json in a subfolder', () => {
    write('cap/default-env.json', JSON.stringify({ VCAP_SERVICES: {} }))

    const found = discoverConfigDirs(tmpRoot, 3)

    assert.strictEqual(found.length, 1)
    assert.strictEqual(found[0].dir, path.join(tmpRoot, 'cap'))
    assert.ok(found[0].kinds.includes('default-env'))
  })

  test('prefers the shallowest candidate first (root before subfolder)', () => {
    write('default-env.json', JSON.stringify({ VCAP_SERVICES: {} }))
    write('cap/default-env.json', JSON.stringify({ VCAP_SERVICES: {} }))

    const found = discoverConfigDirs(tmpRoot, 3)

    assert.ok(found.length >= 2)
    assert.strictEqual(found[0].dir, tmpRoot, 'root must sort before subfolder')
  })

  test('ignores node_modules and .git', () => {
    write('node_modules/some-pkg/default-env.json', JSON.stringify({ VCAP_SERVICES: {} }))
    write('.git/default-env.json', JSON.stringify({ VCAP_SERVICES: {} }))

    const found = discoverConfigDirs(tmpRoot, 3)

    assert.strictEqual(found.length, 0, 'must not descend into node_modules or .git')
  })

  test('respects the depth limit', () => {
    write('a/b/c/d/default-env.json', JSON.stringify({ VCAP_SERVICES: {} }))

    const found = discoverConfigDirs(tmpRoot, 2)

    assert.strictEqual(found.length, 0, 'candidate deeper than maxDepth must be skipped')
  })

  test('does not flag a plain folder without config', () => {
    write('srv/service.cds', 'service Foo {}')

    const found = discoverConfigDirs(tmpRoot, 3)

    assert.strictEqual(found.length, 0)
  })
})
