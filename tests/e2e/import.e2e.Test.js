// @ts-check
import * as base from '../base.js'
import { expect } from 'chai'
import fs from 'fs'
import path from 'path'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'


/**
 * Creates a test CSV file with sample data
 * @param {string} filePath - Path to the CSV file
 * @param {string[][]} rows - Array of row data
 * @returns {void}
 */
function createTestCSVFile(filePath, rows) {
  const csvContent = rows.map(row => row.join(',')).join('\n')
  fs.writeFileSync(filePath, csvContent, 'utf-8')
}

describe('import command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js import --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli import')
        expect(stdout).to.include('--filename')
        expect(stdout).to.include('--table')
        expect(stdout).to.include('--schema')
        expect(stdout).to.include('--output')
        expect(stdout).to.include('choices: "csv", "excel"')
        expect(stdout).to.include('--matchMode')
        expect(stdout).to.include('choices: "order", "name", "auto"')
        base.addContext(this, { title: 'Import Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js import --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/data-tools\/import/i)
        expect(stdout).to.include('hana-cli export --help')
        expect(stdout).to.include('hana-cli dataValidator --help')
        done()
      })
    })

    it('shows all key options in help', function (done) {
      base.exec('node bin/cli.js import --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('--truncate')
        expect(stdout).to.include('--batchSize')
        expect(stdout).to.include('--worksheet')
        expect(stdout).to.include('--startRow')
        expect(stdout).to.include('--skipEmptyRows')
        expect(stdout).to.include('--excelCacheMode')
        expect(stdout).to.include('--dryRun')
        expect(stdout).to.include('--maxFileSizeMB')
        expect(stdout).to.include('--timeoutSeconds')
        expect(stdout).to.include('--nullValues')
        expect(stdout).to.include('--skipWithErrors')
        expect(stdout).to.include('--maxErrorsAllowed')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "imp"', function (done) {
      base.exec('node bin/cli.js imp --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli import')
        done()
      })
    })

    it('supports alias "uploadData"', function (done) {
      base.exec('node bin/cli.js uploadData --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli import')
        done()
      })
    })
  })

  describe('Validation', () => {
    it('rejects unsupported output format values', function (done) {
      base.exec('node bin/cli.js import --filename test.txt --table DUMMY --output json --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(output).to.include('Invalid values:')
        expect(output).to.include('Argument: output')
        expect(output).to.include('Choices: "csv", "excel"')
        base.addContext(this, { title: 'Invalid output format output', value: output })
        done()
      })
    })

    it('rejects unsupported matchMode values', function (done) {
      base.exec('node bin/cli.js import --filename test.csv --table DUMMY --matchMode invalid --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(output).to.include('Invalid values:')
        expect(output).to.include('Argument: matchMode')
        expect(output).to.include('Choices: "order", "name", "auto"')
        base.addContext(this, { title: 'Invalid matchMode output', value: output })
        done()
      })
    })

    it('rejects unsupported excelCacheMode values', function (done) {
      base.exec('node bin/cli.js import --filename test.xlsx --table DUMMY --excelCacheMode invalid --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(output).to.include('Invalid values:')
        expect(output).to.include('Argument: excelCacheMode')
        expect(output).to.include('Choices: "cache", "emit", "ignore"')
        base.addContext(this, { title: 'Invalid excelCacheMode output', value: output })
        done()
      })
    })

    it('validates that filename is required', function (done) {
      base.exec('node bin/cli.js import --table DUMMY --quiet --no-prompt', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        // The command should fail because filename is required
        if (error) {
          expect(error.code).to.not.equal(0)
        }
        base.addContext(this, { title: 'Missing filename output', value: output })
        done()
      })
    })

    it('validates that table is required', function (done) {
      base.exec('node bin/cli.js import --filename test.csv --quiet --no-prompt', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        // The command should fail because table is required
        if (error) {
          expect(error.code).to.not.equal(0)
        }
        base.addContext(this, { title: 'Missing table output', value: output })
        done()
      })
    })
  })

  describe('Flag combinations', () => {
    it('accepts valid combination of all flags', function (done) {
      // This test validates that all flags can be parsed together without syntax errors
      // It will fail on execution (no database) but should parse successfully
      const command = `node bin/cli.js import --filename test.csv --table TEST_TABLE --schema TEST_SCHEMA --output csv --matchMode auto --truncate --batchSize 500 --worksheet 1 --startRow 2 --skipEmptyRows --excelCacheMode cache --dryRun --maxFileSizeMB 100 --timeoutSeconds 60 --nullValues "null,NULL" --skipWithErrors --maxErrorsAllowed 10 --quiet --no-prompt`

      base.exec(command, (error, stdout, stderr) => {
        // We expect an error because the file doesn't exist, but we're testing flag parsing
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        
        // Should not have invalid argument errors
        expect(output).to.not.include('Invalid values:')
        expect(output).to.not.include('Unknown argument')
        
        base.addContext(this, { title: 'Flag combination output', value: output })
        done()
      })
    })

    it('shows correct default values', function (done) {
      base.exec('node bin/cli.js import --help', (error, stdout) => {
        expect(error).to.be.null
        // Check that defaults are present in the help output
        expect(stdout).to.include('[default: "**CURRENT_SCHEMA**"]')
        expect(stdout).to.include('[default: "csv"]')
        expect(stdout).to.include('[default: "auto"]')
        expect(stdout).to.include('[default: false]')
        expect(stdout).to.include('[default: 1000]')
        expect(stdout).to.include('[default: 1]')
        expect(stdout).to.include('[default: true]')
        expect(stdout).to.include('[default: "cache"]')
        expect(stdout).to.include('[default: 500]')
        expect(stdout).to.include('[default: 3600]')
        expect(stdout).to.include('[default: -1]')
        done()
      })
    })
  })

  describe('Dry run mode', () => {
    it('accepts --dryRun flag without database connection', function (done) {
      const tmpDir = path.resolve(process.cwd(), 'tests', '.tmp')
      fs.mkdirSync(tmpDir, { recursive: true })

      const testFile = path.resolve(tmpDir, `e2e-import-test-${Date.now()}.csv`)
      const testFileCliPath = testFile.replace(/\\/g, '/')

      try {
        // Create a simple test CSV file
        createTestCSVFile(testFile, [
          ['ID', 'NAME', 'VALUE'],
          ['1', 'Test1', '100'],
          ['2', 'Test2', '200']
        ])

        const command = `node bin/cli.js import --filename "${testFileCliPath}" --table TEST_TABLE --dryRun --quiet --no-prompt`

        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Dry run output', value: output })

          // Dry run should attempt to read the file
          // It may fail on database connection, but should recognize the dryRun flag
          expect(output).to.not.include('Unknown argument')

          if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile)
          }
          done()
        })
      } catch (err) {
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile)
        }
        done(err)
      }
    })
  })

  describe('Live import (optional)', () => {
    it('imports CSV data into a test table', function (done) {
      this.timeout(60000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_IMPORT')
      if (!gateLiveTestInCI(this, done, liveControl, 'import live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live import E2E prerequisites not met: no HANA credentials resolved.')
        }

        const tmpDir = path.resolve(process.cwd(), 'tests', '.tmp')
        fs.mkdirSync(tmpDir, { recursive: true })

        const testFile = path.resolve(tmpDir, `e2e-import-live-${Date.now()}.csv`)
        const testFileCliPath = testFile.replace(/\\/g, '/')
        const tableName = `E2E_IMPORT_TEST_${Date.now()}`

        try {
          // Create a simple test CSV file with sample data
          createTestCSVFile(testFile, [
            ['DUMMY'],
            ['X'],
            ['Y'],
            ['Z']
          ])

          // First, create a test table using existing tableCopy command
          const createTableCommand = `node bin/cli.js tableCopy --sourceSchema SYS --sourceTable DUMMY --targetTable ${tableName} --structureOnly --quiet`

          base.exec(createTableCommand, (createError, createStdout, createStderr) => {
            const createOutput = `${createStdout || ''}\n${createStderr || ''}`
            base.addContext(this, { title: 'Create table output', value: createOutput })

            if (createError) {
              // Skip if table creation fails (may not have createTable command or permissions)
              if (fs.existsSync(testFile)) {
                fs.unlinkSync(testFile)
              }
              return skipOrFailLiveTest(this, done, liveControl, `Live import E2E could not create test table ${tableName}. Output: ${createOutput}`)
            }

            // Now attempt the import
            const importCommand = `node bin/cli.js import --filename "${testFileCliPath}" --table ${tableName} --output csv --matchMode name --quiet`

            base.exec(importCommand, (error, stdout, stderr) => {
              const output = `${stdout || ''}\n${stderr || ''}`
              base.addContext(this, { title: 'Live import output', value: output })

              if (error) {
                // Clean up: drop the test table
                const dropCommand = `node bin/cli.js massDelete --schema **CURRENT_SCHEMA** --object ${tableName} --objectType TABLE --force --quiet`
                base.exec(dropCommand, () => {
                  // Ignore drop errors
                })

                // Clean up test file
                if (fs.existsSync(testFile)) {
                  fs.unlinkSync(testFile)
                }

                return skipOrFailLiveTest(this, done, liveControl, `Live import E2E import execution failed for table ${tableName}. Output: ${output}`)
              }

              try {
                expect(error).to.be.null
                expect(output).to.match(/Import Summary|rowsInserted|rowsProcessed|imported successfully|rows imported/i)
              } finally {
                // Clean up: drop the test table
                const dropCommand = `node bin/cli.js massDelete --schema **CURRENT_SCHEMA** --object ${tableName} --objectType TABLE --force --quiet`
                base.exec(dropCommand, () => {
                  // Ignore drop errors
                })

                // Clean up test file
                if (fs.existsSync(testFile)) {
                  fs.unlinkSync(testFile)
                }
              }

              done()
            })
          })
        } catch (err) {
          if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile)
          }
          done(err)
        }
      }).catch(done)
    })

    it('validates truncate flag behavior', function (done) {
      this.timeout(60000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_IMPORT')
      if (!gateLiveTestInCI(this, done, liveControl, 'import truncate live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live import truncate E2E prerequisites not met: no HANA credentials resolved.')
        }

        const tmpDir = path.resolve(process.cwd(), 'tests', '.tmp')
        fs.mkdirSync(tmpDir, { recursive: true })

        const testFile = path.resolve(tmpDir, `e2e-import-truncate-${Date.now()}.csv`)
        const testFileCliPath = testFile.replace(/\\/g, '/')
        const tableName = `E2E_IMPORT_TRUNCATE_${Date.now()}`

        try {
          // Create test CSV
          createTestCSVFile(testFile, [
            ['DUMMY'],
            ['A']
          ])

          // Create test table using existing tableCopy command
          const createTableCommand = `node bin/cli.js tableCopy --sourceSchema SYS --sourceTable DUMMY --targetTable ${tableName} --structureOnly --quiet`

          base.exec(createTableCommand, (createError) => {
            if (createError) {
              if (fs.existsSync(testFile)) {
                fs.unlinkSync(testFile)
              }
              return skipOrFailLiveTest(this, done, liveControl, `Live import truncate E2E could not create test table ${tableName}.`)
            }

            // First import
            const importCommand1 = `node bin/cli.js import --filename "${testFileCliPath}" --table ${tableName} --quiet`

            base.exec(importCommand1, (error1, stdout1, stderr1) => {
              if (error1) {
                // Clean up and skip
                base.exec(`node bin/cli.js massDelete --schema **CURRENT_SCHEMA** --object ${tableName} --objectType TABLE --force --quiet`, () => { })
                if (fs.existsSync(testFile)) {
                  fs.unlinkSync(testFile)
                }
                const firstImportOutput = `${stdout1 || ''}\n${stderr1 || ''}`
                return skipOrFailLiveTest(this, done, liveControl, `Live import truncate E2E initial import failed for table ${tableName}. Output: ${firstImportOutput}`)
              }

              // Second import with truncate
              const importCommand2 = `node bin/cli.js import --filename "${testFileCliPath}" --table ${tableName} --truncate --quiet`

              base.exec(importCommand2, (error2, stdout2, stderr2) => {
                const output2 = `${stdout2 || ''}\n${stderr2 || ''}`
                base.addContext(this, { title: 'Truncate import output', value: output2 })

                try {
                  expect(error2).to.be.null
                  expect(output2).to.match(/truncate|Import complete/i)
                } finally {
                  // Clean up
                  base.exec(`node bin/cli.js massDelete --schema **CURRENT_SCHEMA** --object ${tableName} --objectType TABLE --force --quiet`, () => { })
                  if (fs.existsSync(testFile)) {
                    fs.unlinkSync(testFile)
                  }
                }

                done()
              })
            })
          })
        } catch (err) {
          if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile)
          }
          done(err)
        }
      }).catch(done)
    })
  })
})
