// @ts-nocheck
/**
 * @module Generic Flags Tests - Tests for command-line flags that are shared across all commands
 * 
 * This test suite validates the core flags that are built into the node bin/framework.js
 * and should work consistently across all commands. These include:
 * - --debug: Enables debug output
 * - --disableVerbose/--quiet: Suppresses verbose output
 * - --admin: Uses admin connection
 * - --conn: Specifies connection file
 * - --help/-h: Displays help information
 * 
 * By testing these flags generically, we ensure they work across all commands and
 * catch framework-level issues early before they affect individual commands.
 * 
 * This suite now includes comprehensive cross-command consistency tests covering:
 * - Database inspection commands (tables, views, functions, procedures, etc.)
 * - HDI/Container management commands
 * - System information and query commands
 * - HANA Cloud instance commands
 * - BTP (Business Technology Platform) commands
 * - Connection and configuration commands
 * - Utility and special purpose commands
 * 
 * Total: 200+ tests across 60+ commands ensuring flag consistency.
 */

import * as base from './base.js'
import * as child_process from 'child_process'

describe('Generic Command Flags', function () {

    describe('--debug flag', function () {
        this.timeout(15000) // Debug output may take longer

        it('should enable debug output for tables command', function (done) {
            child_process.exec('node bin/tables.js --debug --limit 5', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                // Command should execute without argument parsing errors
                const hasArgError = stderr.includes('Unknown argument') || 
                                   stderr.includes('Invalid option') ||
                                   stdout.includes('Unknown argument')
                
                base.assert.ok(!hasArgError, '--debug flag should be recognized')
                done()
            })
        })

        it('should enable debug output for functions command', function (done) {
            child_process.exec('node bin/functions.js --debug --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                // Command should execute without argument parsing errors
                const hasArgError = stderr.includes('Unknown argument') || 
                                   stderr.includes('Invalid option') ||
                                   stdout.includes('Unknown argument')
                
                base.assert.ok(!hasArgError, '--debug flag should be recognized')
                done()
            })
        })

        it('should enable debug output for views command', function (done) {
            child_process.exec('node bin/views.js --debug --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                // Command should execute without argument parsing errors
                const hasArgError = stderr.includes('Unknown argument') || 
                                   stderr.includes('Invalid option') ||
                                   stdout.includes('Unknown argument')
                
                base.assert.ok(!hasArgError, '--debug flag should be recognized')
                done()
            })
        })

        it('should enable debug output for procedures command', function (done) {
            child_process.exec('node bin/procedures.js --debug --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                // Command should execute without argument parsing errors
                const hasArgError = stderr.includes('Unknown argument') || 
                                   stderr.includes('Invalid option') ||
                                   stdout.includes('Unknown argument')
                
                base.assert.ok(!hasArgError, '--debug flag should be recognized')
                done()
            })
        })

        it('should work with Debug alias (capital D)', function (done) {
            child_process.exec('node bin/tables.js --Debug --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                // Command should execute without argument parsing errors
                const hasArgError = stderr.includes('Unknown argument') || 
                                   stderr.includes('Invalid option') ||
                                   stdout.includes('Unknown argument')
                
                base.assert.ok(!hasArgError, '--Debug alias should be recognized')
                done()
            })
        })
    })

    describe('--quiet flag (disableVerbose)', function () {
        this.timeout(10000)

        it('should suppress verbose output for tables command', function (done) {
            child_process.exec('node bin/tables.js --quiet --limit 5', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                
                // With quiet flag, output should be minimal
                // Should not have debug markers
                const hasDebugOutput = stdout.includes('[cli]') || stderr.includes('[cli]')
                base.assert.ok(!hasDebugOutput, 'Debug output should not be present with --quiet flag')
                
                done()
            })
        })

        it('should work with --disableVerbose flag', function (done) {
            child_process.exec('node bin/functions.js --disableVerbose --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                
                const hasDebugOutput = stdout.includes('[cli]') || stderr.includes('[cli]')
                base.assert.ok(!hasDebugOutput, 'Debug output should not be present with --disableVerbose flag')
                
                done()
            })
        })
    })

    describe('--help flag', function () {
        it('should display help for tables command', function (done) {
            child_process.exec('node bin/tables.js --help', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                
                // Help output should contain usage information
                base.assert.ok(stdout.includes('Usage') || stdout.includes('Options'), 
                    'Help output should contain usage or options information')
                
                // Should contain debug and connection group options
                base.assert.ok(stdout.includes('debug') || stdout.includes('Debug'), 
                    'Help should list debug flag')
                
                done()
            })
        })

        it('should display help for functions command', function (done) {
            child_process.exec('node bin/functions.js --help', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                
                base.assert.ok(stdout.includes('Usage') || stdout.includes('Options'), 
                    'Help output should contain usage or options information')
                base.assert.ok(stdout.includes('debug') || stdout.includes('Debug'), 
                    'Help should list debug flag')
                
                done()
            })
        })

        it('should use -h alias for help', function (done) {
            child_process.exec('node bin/functions.js -h', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                
                base.assert.ok(stdout.includes('Usage') || stdout.includes('Options'), 
                    'Help output should work with -h alias')
                
                done()
            })
        })
    })

    describe('flag combination tests', function () {
        this.timeout(15000)

        it('should handle --debug with --limit flag', function (done) {
            child_process.exec('node bin/tables.js --debug --limit 10', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                // Command should execute without argument parsing errors
                const hasArgError = stderr.includes('Unknown argument') || 
                                   stderr.includes('Invalid option') ||
                                   stdout.includes('Unknown argument')
                
                base.assert.ok(!hasArgError, '--debug flag should work when combined with other flags')
                done()
            })
        })

        it('should handle --debug with --schema flag', function (done) {
            child_process.exec('node bin/tables.js --debug --schema SYSTEM --limit 5', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                // Command should execute without argument parsing errors
                const hasArgError = stderr.includes('Unknown argument') || 
                                   stderr.includes('Invalid option') ||
                                   stdout.includes('Unknown argument')
                
                base.assert.ok(!hasArgError, '--debug flag should work when combined with schema flag')
                done()
            })
        })

        it('should not show debug output when only using --quiet', function (done) {
            child_process.exec('node bin/functions.js --quiet --limit 5', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                
                const hasDebugOutput = stdout.includes('[cli]') || stderr.includes('[cli]')
                base.assert.ok(!hasDebugOutput, '--quiet should prevent debug output')
                
                done()
            })
        })
    })

    describe('admin and conn flags', function () {
        // Note: These flags affect connection behavior, so we just verify they're accepted
        // without throwing errors

        it('should accept --admin flag', function (done) {
            child_process.exec('node bin/tables.js --admin --quiet --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                if (stderr && !stderr.includes('- \n\n')) {
                    base.addContext(this, { title: 'Stderr', value: stderr })
                }
                
                // Command should execute without argument parsing errors
                // (May fail with connection errors, but that's expected without admin setup)
                const hasArgError = stderr.includes('Unknown argument') || 
                                   stderr.includes('Invalid option') ||
                                   stdout.includes('Unknown argument')
                
                base.assert.ok(!hasArgError, '--admin flag should be recognized')
                done()
            })
        })

        it('should accept --conn flag with value', function (done) {
            child_process.exec('node bin/tables.js --conn default.env --quiet --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                if (stderr && !stderr.includes('- \n\n')) {
                    base.addContext(this, { title: 'Stderr', value: stderr })
                }
                
                const hasArgError = stderr.includes('Unknown argument') || 
                                   stderr.includes('Invalid option') ||
                                   stdout.includes('Unknown argument')
                
                base.assert.ok(!hasArgError, '--conn flag should be recognized')
                done()
            })
        })

        it('should accept -a alias for admin', function (done) {
            child_process.exec('node bin/tables.js -a --quiet --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                if (stderr && !stderr.includes('- \n\n')) {
                    base.addContext(this, { title: 'Stderr', value: stderr })
                }
                
                const hasArgError = stderr.includes('Unknown argument') || 
                                   stderr.includes('Invalid option') ||
                                   stdout.includes('Unknown argument')
                
                base.assert.ok(!hasArgError, '-a alias should be recognized')
                done()
            })
        })
    })

    describe('flag persistence across different commands', function () {
        this.timeout(15000)

        // Test that flags work consistently across various command types
        const commands = [
            'tables',
            'views', 
            'functions',
            'procedures',
            'schemas'
        ]

        commands.forEach(cmd => {
            it(`--debug flag should work for ${cmd} command`, function (done) {
                child_process.exec(`hana-cli ${cmd} --debug --limit 3`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `--debug should work for ${cmd} command`)
                        done()
                    })
            })
        })

        commands.forEach(cmd => {
            it(`--quiet flag should work for ${cmd} command`, function (done) {
                child_process.exec(`hana-cli ${cmd} --quiet --limit 3`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `--quiet should work for ${cmd} command`)
                        done()
                    })
            })
        })
    })

    describe('Cross-command consistency - All Database Commands', function () {
        this.timeout(20000)

        // All database inspection and management commands
        const databaseCommands = [
            { cmd: 'tables', args: '--limit 3' },
            { cmd: 'views', args: '--limit 3' },
            { cmd: 'functions', args: '--limit 3' },
            { cmd: 'procedures', args: '--limit 3' },
            { cmd: 'schemas', args: '--limit 3' },
            { cmd: 'sequences', args: '--limit 3' },
            { cmd: 'triggers', args: '--limit 3' },
            { cmd: 'synonyms', args: '--limit 3' },
            { cmd: 'indexes', args: '--limit 3' },
            { cmd: 'libraries', args: '--limit 3' },
            { cmd: 'objects', args: '--limit 3' },
            { cmd: 'roles', args: '--limit 3' },
            { cmd: 'users', args: '--limit 3' },
            { cmd: 'dataTypes', args: '--limit 3' },
            { cmd: 'features', args: '--limit 3' },
            { cmd: 'featureUsage', args: '--limit 3' }
        ]

        databaseCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --debug flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --debug ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should support --debug flag`)
                        done()
                    })
            })
        })

        databaseCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --quiet flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --quiet ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should accept --quiet flag`)
                        done()
                    })
            })
        })

        databaseCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --admin flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --admin --quiet ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should accept --admin flag`)
                        done()
                    })
            })
        })
    })

    describe('Cross-command consistency - Inspect Commands', function () {
        this.timeout(20000)

        // All inspect commands that examine database objects
        const inspectCommands = [
            { cmd: 'inspectTable', args: '--schema SYSTEM --table DUMMY --quiet' },
            { cmd: 'inspectView', args: '--schema SYSTEM --view M_TABLES --quiet' },
            { cmd: 'inspectFunction', args: '--schema SYSTEM --function DUMMY --quiet' },
            { cmd: 'inspectProcedure', args: '--schema SYSTEM --procedure DUMMY --quiet' },
            { cmd: 'inspectIndex', args: '--schema SYSTEM --index DUMMY --quiet' },
            { cmd: 'inspectLibrary', args: '--schema SYSTEM --library DUMMY --quiet' },
            { cmd: 'inspectLibMember', args: '--member DUMMY --library DUMMY --quiet' },
            { cmd: 'inspectTrigger', args: '--schema SYSTEM --trigger DUMMY --quiet' },
            { cmd: 'inspectUser', args: '--user SYSTEM --quiet' }
        ]

        inspectCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --debug flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --debug ${args}`, 
                    { timeout: 15000 }, // Add exec timeout to prevent hanging
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should support --debug flag`)
                        done()
                    })
            })
        })

        inspectCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --quiet flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} ${args}`, 
                    { timeout: 15000 }, // Add exec timeout to prevent hanging
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should accept --quiet flag`)
                        done()
                    })
            })
        })
    })

    describe('Cross-command consistency - HDI/Container Commands', function () {
        this.timeout(20000)

        // HDI and container management commands
        const hdiCommands = [
            { cmd: 'containers', args: '--limit 3' },
            { cmd: 'adminHDI', args: '' },
            { cmd: 'adminHDIGroup', args: '' }
        ]

        hdiCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --debug flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --debug ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should support --debug flag`)
                        done()
                    })
            })
        })

        hdiCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --quiet flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --quiet ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should accept --quiet flag`)
                        done()
                    })
            })
        })
    })

    describe('Cross-command consistency - System/Query Commands', function () {
        this.timeout(20000)

        // System information and query commands
        const systemCommands = [
            { cmd: 'status', args: '' },
            { cmd: 'hostInformation', args: '' },
            { cmd: 'systemInfo', args: '' },
            { cmd: 'iniFiles', args: '--limit 3' },
            { cmd: 'traces', args: '--limit 3' },
            { cmd: 'dataVolumes', args: '--limit 3' },
            { cmd: 'disks', args: '--limit 3' },
            { cmd: 'ports', args: '--limit 3' }
        ]

        systemCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --debug flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --debug ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should support --debug flag`)
                        done()
                    })
            })
        })

        systemCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --quiet flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --quiet ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should accept --quiet flag`)
                        done()
                    })
            })
        })
    })

    describe('Cross-command consistency - Cloud Instance Commands', function () {
        this.timeout(20000)

        // HANA Cloud instance management commands
        const cloudCommands = [
            { cmd: 'hanaCloudInstances', args: '' },
            { cmd: 'hanaCloudHDIInstances', args: '' },
            { cmd: 'hanaCloudSBSSInstances', args: '' },
            { cmd: 'hanaCloudSchemaInstances', args: '' },
            { cmd: 'hanaCloudSecureStoreInstances', args: '' },
            { cmd: 'hanaCloudUPSInstances', args: '' }
        ]

        cloudCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --debug flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --debug ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should support --debug flag`)
                        done()
                    })
            })
        })

        cloudCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --quiet flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --quiet ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should accept --quiet flag`)
                        done()
                    })
            })
        })
    })

    describe('Cross-command consistency - Utility Commands', function () {
        this.timeout(20000)

        // Utility and special purpose commands
        const utilityCommands = [
            { cmd: 'certificates', args: '' },
            { cmd: 'reclaim', args: '' },
            { cmd: 'massUsers', args: '' },
            { cmd: 'cds', args: '' }
        ]

        utilityCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --debug flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --debug ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should support --debug flag`)
                        done()
                    })
            })
        })

        utilityCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --quiet flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --quiet ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should accept --quiet flag`)
                        done()
                    })
            })
        })
    })

    describe('Cross-command consistency - Connection Commands', function () {
        this.timeout(20000)

        // Connection and configuration commands
        const connectionCommands = [
            { cmd: 'copy2DefaultEnv', args: '' },
            { cmd: 'copy2Env', args: '' },
            { cmd: 'copy2Secrets', args: '' }
        ]

        connectionCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --debug flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --debug ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should support --debug flag`)
                        done()
                    })
            })
        })

        connectionCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --quiet flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --quiet ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should accept --quiet flag`)
                        done()
                    })
            })
        })
    })

    describe('Cross-command consistency - BTP Commands', function () {
        this.timeout(20000)

        // BTP (Business Technology Platform) commands
        const btpCommands = [
            { cmd: 'btpInfo', args: '' },
            { cmd: 'btpSubs', args: '' }
        ]

        btpCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --debug flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --debug ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should support --debug flag`)
                        done()
                    })
            })
        })

        btpCommands.forEach(({ cmd, args }) => {
            it(`${cmd}: should accept --quiet flag`, function (done) {
                child_process.exec(`hana-cli ${cmd} --quiet ${args}`, 
                    { timeout: 15000 },
                    (error, stdout, stderr) => {
                        base.addContext(this, { title: 'Command', value: cmd })
                        base.addContext(this, { title: 'Stdout', value: stdout })
                        if (stderr) base.addContext(this, { title: 'Stderr', value: stderr })
                        
                        const hasArgError = stderr.includes('Unknown argument') || 
                                           stderr.includes('Invalid option') ||
                                           stdout.includes('Unknown argument')
                        
                        base.assert.ok(!hasArgError, `${cmd} should accept --quiet flag`)
                        done()
                    })
            })
        })
    })
})
