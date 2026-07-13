// @ts-check
import { assert } from '../base.js'
import * as base from '../../utils/base.js'

describe('terminal lazy access', () => {
  it('exposes a synchronous terminal object with table and progressBar', () => {
    assert.strictEqual(typeof base.terminal, 'object')
    assert.strictEqual(typeof base.terminal.table, 'function')
    assert.strictEqual(typeof base.terminal.progressBar, 'function')
  })

  it('progressBar returns a controller with startItem/itemDone/stop', () => {
    const bar = base.terminal.progressBar({ title: 'test', percent: false })
    assert.strictEqual(typeof bar.startItem, 'function')
    assert.strictEqual(typeof bar.itemDone, 'function')
    assert.strictEqual(typeof bar.stop, 'function')
    bar.stop()
  })
})
