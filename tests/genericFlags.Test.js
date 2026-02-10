// @ts-nocheck
/**
 * @module Generic Flags Tests - Tests for command-line flags that are shared across all commands
 * 
 * This test suite validates the core flags that are built into the hana-cli framework
 * and should work consistently across all commands. These include:
 * - --debug: Enables debug output
 * - --disableVerbose/--quiet: Suppresses verbose output
 * - --admin: Uses admin connection
 * - --conn: Specifies connection file
 * 
 * By testing these flags generically, we ensure they work across all commands and
 * catch framework-level issues early before they affect individual commands.
 */

import * as base from './base.js'
import * as child_process from 'child_process'

describe('Generic Command Flags', function () {

    describe('--debug flag', function () {
        this.timeout(15000) // Debug output may take longer

        it('should enable debug output for tables command', function (done) {
            child_process.exec('hana-cli tables --debug --limit 5', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                // Check that debug output is present (look for [cli] or other debug markers)
                const hasDebugOutput = stdout.includes('[cli]') || 
                                      stdout.includes('hana-cli') ||
                                      stderr.includes('[cli]') ||
                                      stderr.includes('hana-cli')
                
                base.assert.ok(hasDebugOutput, 'Debug output should be present when --debug flag is used')
                done()
            })
        })

        it('should enable debug output for functions command', function (done) {
            child_process.exec('hana-cli functions --debug --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const hasDebugOutput = stdout.includes('[cli]') || 
                                      stdout.includes('hana-cli') ||
                                      stderr.includes('[cli]') ||
                                      stderr.includes('hana-cli')
                
                base.assert.ok(hasDebugOutput, 'Debug output should be present when --debug flag is used')
                done()
            })
        })

        it('should enable debug output for views command', function (done) {
            child_process.exec('hana-cli views --debug --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const hasDebugOutput = stdout.includes('[cli]') || 
                                      stdout.includes('hana-cli') ||
                                      stderr.includes('[cli]') ||
                                      stderr.includes('hana-cli')
                
                base.assert.ok(hasDebugOutput, 'Debug output should be present when --debug flag is used')
                done()
            })
        })

        it('should enable debug output for procedures command', function (done) {
            child_process.exec('hana-cli procedures --debug --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const hasDebugOutput = stdout.includes('[cli]') || 
                                      stdout.includes('hana-cli') ||
                                      stderr.includes('[cli]') ||
                                      stderr.includes('hana-cli')
                
                base.assert.ok(hasDebugOutput, 'Debug output should be present when --debug flag is used')
                done()
            })
        })

        it('should work with Debug alias (capital D)', function (done) {
            child_process.exec('hana-cli tables --Debug --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const hasDebugOutput = stdout.includes('[cli]') || 
                                      stdout.includes('hana-cli') ||
                                      stderr.includes('[cli]') ||
                                      stderr.includes('hana-cli')
                
                base.assert.ok(hasDebugOutput, 'Debug output should be present with --Debug alias')
                done()
            })
        })
    })

    describe('--quiet flag (disableVerbose)', function () {
        this.timeout(10000)

        it('should suppress verbose output for tables command', function (done) {
            child_process.exec('hana-cli tables --quiet --limit 5', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                
                // With quiet flag, output should be minimal
                // Should not have debug markers
                const hasDebugOutput = stdout.includes('[cli]') || stderr.includes('[cli]')
                base.assert.ok(!hasDebugOutput, 'Debug output should not be present with --quiet flag')
                
                done()
            })
        })

        it('should work with --disableVerbose flag', function (done) {
            child_process.exec('hana-cli functions --disableVerbose --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                
                const hasDebugOutput = stdout.includes('[cli]') || stderr.includes('[cli]')
                base.assert.ok(!hasDebugOutput, 'Debug output should not be present with --disableVerbose flag')
                
                done()
            })
        })
    })

    describe('--help flag', function () {
        it('should display help for tables command', function (done) {
            child_process.exec('hana-cli tables --help', (error, stdout, stderr) => {
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
            child_process.exec('hana-cli functions --help', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                
                base.assert.ok(stdout.includes('Usage') || stdout.includes('Options'), 
                    'Help output should contain usage or options information')
                base.assert.ok(stdout.includes('debug') || stdout.includes('Debug'), 
                    'Help should list debug flag')
                
                done()
            })
        })

        it('should use -h alias for help', function (done) {
            child_process.exec('hana-cli views -h', (error, stdout, stderr) => {
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
            child_process.exec('hana-cli tables --debug --limit 10', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const hasDebugOutput = stdout.includes('[cli]') || 
                                      stdout.includes('hana-cli') ||
                                      stderr.includes('[cli]') ||
                                      stderr.includes('hana-cli')
                
                base.assert.ok(hasDebugOutput, 'Debug output should be present when combined with other flags')
                done()
            })
        })

        it('should handle --debug with --schema flag', function (done) {
            child_process.exec('hana-cli tables --debug --schema SYSTEM --limit 5', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const hasDebugOutput = stdout.includes('[cli]') || 
                                      stdout.includes('hana-cli') ||
                                      stderr.includes('[cli]') ||
                                      stderr.includes('hana-cli')
                
                base.assert.ok(hasDebugOutput, 'Debug output should be present when combined with schema flag')
                done()
            })
        })

        it('should not show debug output when only using --quiet', function (done) {
            child_process.exec('hana-cli functions --quiet --limit 5', (error, stdout, stderr) => {
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
            child_process.exec('hana-cli tables --admin --quiet --limit 3', (error, stdout, stderr) => {
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
            child_process.exec('hana-cli tables --conn default.env --quiet --limit 3', (error, stdout, stderr) => {
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
            child_process.exec('hana-cli tables -a --quiet --limit 3', (error, stdout, stderr) => {
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
                child_process.exec(`hana-cli ${cmd} --debug --limit 3`, (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Command', value: cmd })
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasDebugOutput = stdout.includes('[cli]') || 
                                          stdout.includes('hana-cli') ||
                                          stderr.includes('[cli]') ||
                                          stderr.includes('hana-cli')
                    
                    base.assert.ok(hasDebugOutput, `--debug should work for ${cmd} command`)
                    done()
                })
            })
        })

        commands.forEach(cmd => {
            it(`--quiet flag should work for ${cmd} command`, function (done) {
                child_process.exec(`hana-cli ${cmd} --quiet --limit 3`, (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Command', value: cmd })
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    
                    const hasDebugOutput = stdout.includes('[cli]') || stderr.includes('[cli]')
                    base.assert.ok(!hasDebugOutput, `--quiet should work for ${cmd} command`)
                    
                    done()
                })
            })
        })
    })
})
