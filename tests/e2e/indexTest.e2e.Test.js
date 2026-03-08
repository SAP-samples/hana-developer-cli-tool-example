// @ts-check
/**
 * @module indexTest - End-to-End (E2E) Tests for legacy indexTest placeholder
 * 
 * Validates CLI behavior for the legacy indexTest command placeholder:
 * - Command is not registered in the CLI command map
 * - User receives an unknown command message
 */

import * as base from '../base.js'
import { expect } from 'chai'

describe('indexTest legacy placeholder - E2E Tests', function () {
  this.timeout(20000)

  describe('Command availability', () => {
    it('returns an unknown command message via hana-cli', function (done) {
      base.exec('node bin/cli.js indexTest', (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'indexTest output', value: output })

        expect(error).to.exist
        expect(output).to.match(/unknown.*command|command.*unknown|unknown/i)
        done()
      })
    })
  })
})
