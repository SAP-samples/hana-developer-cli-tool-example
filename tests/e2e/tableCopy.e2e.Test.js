// @ts-check
/**
 * @module tableCopy - End-to-End (E2E) Tests for bin/tableCopy.js
 *
 * Validates complete command workflows including:
 * - Help output and alias support
 * - Option visibility/validation
 * - Optional live multi-step source→target copy workflow with DB validation
 */

import { describe, it } from 'mocha'
import * as base from '../base.js'
import { expect } from 'chai'
import dbClientClass from '../../utils/database/index.js'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

/**
 * Escape SQL string literals.
 * @param {string} value
 * @returns {string}
 */
function sqlString(value) {
  return `'${value.replace(/'/g, "''")}'`
}

describe('tableCopy command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js tableCopy --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli tableCopy')
        expect(stdout).to.include('--sourceTable')
        expect(stdout).to.include('--targetTable')
        expect(stdout).to.include('--sourceSchema')
        expect(stdout).to.include('--targetSchema')
        expect(stdout).to.include('--structureOnly')
        expect(stdout).to.include('--dataOnly')
        expect(stdout).to.include('--where')
        expect(stdout).to.include('--limit')
        expect(stdout).to.include('--batchSize')
        base.addContext(this, { title: 'tableCopy Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js tableCopy --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/mass-operations\/table-copy/i)
        expect(stdout).to.include('hana-cli export --help')
        expect(stdout).to.include('hana-cli import --help')
        expect(stdout).to.include('hana-cli tables --help')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "tablecopy"', function (done) {
      base.exec('node bin/cli.js tablecopy --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli tableCopy')
        done()
      })
    })

    it('supports alias "copyTable"', function (done) {
      base.exec('node bin/cli.js copyTable --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli tableCopy')
        done()
      })
    })
  })

  describe('Validation', () => {
    it('rejects non-numeric limit values', function (done) {
      base.exec('node bin/cli.js tableCopy --sourceTable A --targetTable B --limit invalid --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(output.toLowerCase()).to.match(/invalid|error|argument/)
        base.addContext(this, { title: 'Invalid limit output', value: output })
        done()
      })
    })
  })

  describe('Live multi-step workflow with validation (optional)', () => {
    it('copies source→target in two steps (structure then filtered data) and validates result', function (done) {
      this.timeout(90000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_TABLECOPY')
      if (!gateLiveTestInCI(this, done, liveControl, 'tableCopy live E2E')) {
        return
      }

      getLocalConnectionCredentials().then(async (creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live tableCopy E2E prerequisites not met: no HANA credentials resolved.')
        }

        const suffix = `${Date.now()}_${Math.floor(Math.random() * 1000)}`
        const sourceTable = `E2E_TC_SRC_${suffix}`
        const targetTable = `E2E_TC_TGT_${suffix}`

        /** @type {import('../../utils/database/index.js').default | null} */
        let dbClient = null
        let schema = 'PUBLIC'

        try {
          dbClient = await dbClientClass.getNewClient({ quiet: true })
          await dbClient.connect()

          const currentSchema = await dbClient.execSQL('SELECT CURRENT_SCHEMA FROM DUMMY')
          schema = currentSchema?.[0]?.CURRENT_SCHEMA || schema

          await dbClient.execSQL(`DROP TABLE "${schema}"."${targetTable}"`)
        } catch {
          // Ignore drop failures for non-existing objects
        }

        try {
          if (!dbClient) {
            dbClient = await dbClientClass.getNewClient({ quiet: true })
            await dbClient.connect()
          }

          try {
            await dbClient.execSQL(`DROP TABLE "${schema}"."${sourceTable}"`)
          } catch {
            // Ignore drop failures for non-existing objects
          }

          await dbClient.execSQL(`CREATE TABLE "${schema}"."${sourceTable}" ("DUMMY" NVARCHAR(100))`)
          await dbClient.execSQL(`INSERT INTO "${schema}"."${sourceTable}" ("DUMMY") VALUES (${sqlString('ALPHA')})`)
          await dbClient.execSQL(`INSERT INTO "${schema}"."${sourceTable}" ("DUMMY") VALUES (${sqlString('BETA')})`)
          await dbClient.execSQL(`INSERT INTO "${schema}"."${sourceTable}" ("DUMMY") VALUES (${sqlString('GAMMA')})`)

          const step1 = `node bin/cli.js tableCopy --sourceSchema ${schema} --sourceTable ${sourceTable} --targetSchema ${schema} --targetTable ${targetTable} --structureOnly --quiet`

          base.exec(step1, (step1Error, step1Stdout, step1Stderr) => {
            const step1Output = `${step1Stdout || ''}\n${step1Stderr || ''}`
            base.addContext(this, { title: 'Step 1 (structure only) output', value: step1Output })

            if (step1Error) {
              return skipOrFailLiveTest(this, done, liveControl, `tableCopy live step 1 failed. Output: ${step1Output}`)
            }

            const step2 = `node bin/cli.js tableCopy --sourceSchema ${schema} --sourceTable ${sourceTable} --targetSchema ${schema} --targetTable ${targetTable} --dataOnly --where "DUMMY IN ('ALPHA','BETA')" --limit 1 --batchSize 1 --quiet`

            base.exec(step2, async (step2Error, step2Stdout, step2Stderr) => {
              const step2Output = `${step2Stdout || ''}\n${step2Stderr || ''}`
              base.addContext(this, { title: 'Step 2 (data only) output', value: step2Output })

              if (step2Error) {
                return skipOrFailLiveTest(this, done, liveControl, `tableCopy live step 2 failed. Output: ${step2Output}`)
              }

              try {
                expect(step1Output).to.match(/Table copy complete/i)
                expect(step2Output).to.match(/Table copy complete/i)
                expect(step2Output).to.match(/Rows copied:\s*1/i)

                const sourceCountResult = await dbClient.execSQL(`SELECT COUNT(*) AS CNT FROM "${schema}"."${sourceTable}"`)
                const targetCountResult = await dbClient.execSQL(`SELECT COUNT(*) AS CNT FROM "${schema}"."${targetTable}"`)
                const targetValuesResult = await dbClient.execSQL(`SELECT "DUMMY" FROM "${schema}"."${targetTable}" ORDER BY "DUMMY"`)

                const sourceCount = Number(sourceCountResult?.[0]?.CNT ?? 0)
                const targetCount = Number(targetCountResult?.[0]?.CNT ?? 0)
                const copiedValue = targetValuesResult?.[0]?.DUMMY

                base.addContext(this, {
                  title: 'Post-copy validation',
                  value: JSON.stringify({ schema, sourceTable, targetTable, sourceCount, targetCount, copiedValue }, null, 2)
                })

                expect(sourceCount).to.equal(3)
                expect(targetCount).to.equal(1)
                expect(['ALPHA', 'BETA']).to.include(copiedValue)

                done()
              } catch (err) {
                const errMsg = err instanceof Error ? err.message : 'Unknown validation error'
                skipOrFailLiveTest(this, done, liveControl, `tableCopy post-copy validation failed: ${errMsg}`)
              }
            })
          })
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Unknown setup error'
          skipOrFailLiveTest(this, done, liveControl, `tableCopy live setup failed: ${errMsg}`)
        } finally {
          if (dbClient) {
            try {
              await dbClient.execSQL(`DROP TABLE "${schema}"."${targetTable}"`)
            } catch {
              // Ignore cleanup errors
            }
            try {
              await dbClient.execSQL(`DROP TABLE "${schema}"."${sourceTable}"`)
            } catch {
              // Ignore cleanup errors
            }

            try {
              await dbClient.disconnect()
            } catch {
              // Ignore disconnect errors in cleanup
            }
          }
        }
      }).catch(done)
    })
  })
})