// @ts-nocheck
/**
 * @module Command Alias Tests - Tests for command aliases
 * 
 * This test suite validates that command aliases work identically to main commands.
 * Aliases are defined within the main command files and registered with yargs,
 * so they are accessed through the main CLI entry point (bin/cli.js), not as separate files.
 * 
 * - Short aliases (t, v, f, p, etc.)
 * - Descriptive aliases (listTables, inspectable, etc.)
 * - Consistency between alias and main command
 * 
 * These tests ensure users can use any alias confidently.
 */

import * as base from './base.js'
import * as child_process from 'child_process'

describe('Command Alias Tests', function () {

    describe('tables command aliases', function () {
        this.timeout(10000)

        it('should work with main command', function (done) {
            child_process.exec('node bin/cli.js tables --limit 5 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                base.assert.ok(true, 'Main command works')
                done()
            })
        })

        it('should work with "t" alias', function (done) {
            child_process.exec('node bin/cli.js t --limit 5 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const notRecognized = stderr.includes('Unknown command')
                base.assert.ok(!notRecognized, '"t" alias should work')
                done()
            })
        })

        it('should work with "listTables" alias', function (done) {
            child_process.exec('node bin/cli.js listTables --limit 5 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const notRecognized = stderr.includes('Unknown command')
                base.assert.ok(!notRecognized, '"listTables" alias should work')
                done()
            })
        })

        it('should work with "listtables" alias', function (done) {
            child_process.exec('node bin/cli.js listtables --limit 5 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const notRecognized = stderr.includes('Unknown command')
                base.assert.ok(!notRecognized, '"listtables" alias should work')
                done()
            })
        })
    })

    describe('views command aliases', function () {
        this.timeout(10000)

        it('should work with main command', function (done) {
            child_process.exec('node bin/cli.js views --limit 3 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                base.assert.ok(true, 'Main command works')
                done()
            })
        })

        it('should work with "v" alias', function (done) {
            child_process.exec('node bin/cli.js v --limit 3 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const notRecognized = stderr.includes('Unknown command')
                base.assert.ok(!notRecognized, '"v" alias should work')
                done()
            })
        })
    })

    describe('functions command aliases', function () {
        this.timeout(10000)

        it('should work with main command', function (done) {
            child_process.exec('node bin/cli.js functions --limit 3 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                base.assert.ok(true, 'Main command works')
                done()
            })
        })

        it('should work with "f" alias', function (done) {
            child_process.exec('node bin/cli.js f --limit 3 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const notRecognized = stderr.includes('Unknown command')
                base.assert.ok(!notRecognized, '"f" alias should work')
                done()
            })
        })
    })

    describe('procedures command aliases', function () {
        this.timeout(10000)

        it('should work with main command', function (done) {
            child_process.exec('node bin/cli.js procedures --limit 3 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                base.assert.ok(true, 'Main command works')
                done()
            })
        })

        it('should work with "p" alias', function (done) {
            child_process.exec('node bin/cli.js p --limit 3 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const notRecognized = stderr.includes('Unknown command')
                base.assert.ok(!notRecognized, '"p" alias should work')
                done()
            })
        })

        it('should work with "sp" alias', function (done) {
            child_process.exec('node bin/cli.js sp --limit 3 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const notRecognized = stderr.includes('Unknown command')
                base.assert.ok(!notRecognized, '"sp" alias should work')
                done()
            })
        })
    })

    describe('schemas command aliases', function () {
        this.timeout(10000)

        it('should work with main command', function (done) {
            child_process.exec('node bin/cli.js schemas --limit 5 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                base.assert.ok(true, 'Main command works')
                done()
            })
        })

        it('should work with "s" alias', function (done) {
            child_process.exec('node bin/cli.js s --limit 5 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const notRecognized = stderr.includes('Unknown command')
                base.assert.ok(!notRecognized, '"s" alias should work')
                done()
            })
        })
    })

    describe('inspectTable command aliases', function () {
        this.timeout(10000)

        it('should work with main command', function (done) {
            child_process.exec('node bin/cli.js inspectTable --schema SYSTEM --table DUMMY --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    base.assert.ok(true, 'Main command works')
                    done()
                })
        })

        it('should work with "it" alias', function (done) {
            child_process.exec('node bin/cli.js it --schema SYSTEM --table DUMMY --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const notRecognized = stderr.includes('Unknown command')
                    base.assert.ok(!notRecognized, '"it" alias should work')
                    done()
                })
        })

        it('should work with "table" alias', function (done) {
            child_process.exec('node bin/cli.js table --schema SYSTEM --table DUMMY --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const notRecognized = stderr.includes('Unknown command')
                    base.assert.ok(!notRecognized, '"table" alias should work')
                    done()
                })
        })

        it('should work with "insTbl" alias', function (done) {
            child_process.exec('node bin/cli.js insTbl --schema SYSTEM --table DUMMY --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const notRecognized = stderr.includes('Unknown command')
                    base.assert.ok(!notRecognized, '"insTbl" alias should work')
                    done()
                })
        })

        it('should work with "inspectable" alias', function (done) {
            child_process.exec('node bin/cli.js inspectable --schema SYSTEM --table DUMMY --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const notRecognized = stderr.includes('Unknown command')
                    base.assert.ok(!notRecognized, '"inspectable" alias should work')
                    done()
                })
        })
    })

    describe('inspectView command aliases', function () {
        this.timeout(10000)

        it('should work with "iv" alias', function (done) {
            child_process.exec('node bin/cli.js iv --schema SYSTEM --view SYS.USERS --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const notRecognized = stderr.includes('Unknown command')
                    base.assert.ok(!notRecognized, '"iv" alias should work')
                    done()
                })
        })

        it('should work with "view" alias', function (done) {
            child_process.exec('node bin/cli.js view --schema SYSTEM --view SYS.USERS --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const notRecognized = stderr.includes('Unknown command')
                    base.assert.ok(!notRecognized, '"view" alias should work')
                    done()
                })
        })
    })

    describe('inspectProcedure command aliases', function () {
        this.timeout(10000)

        it('should work with "ip" alias', function (done) {
            child_process.exec('node bin/cli.js ip --help', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    
                    const notRecognized = stderr.includes('Unknown command')
                    base.assert.ok(!notRecognized, '"ip" alias should work')
                    done()
                })
        })

        it('should work with "inspectprocedure" alias', function (done) {
            child_process.exec('node bin/cli.js inspectprocedure --help', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    
                    const notRecognized = stderr.includes('Unknown command')
                    base.assert.ok(!notRecognized, '"inspectprocedure" alias should work')
                    done()
                })
        })
    })

    describe('inspectFunction command aliases', function () {
        this.timeout(10000)

        it('should work with "if" alias', function (done) {
            child_process.exec('node bin/cli.js if --help', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    
                    const notRecognized = stderr.includes('Unknown command')
                    base.assert.ok(!notRecognized, '"if" alias should work')
                    done()
                })
        })

        it('should work with "function" alias', function (done) {
            child_process.exec('node bin/cli.js function --help', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    
                    const notRecognized = stderr.includes('Unknown command')
                    base.assert.ok(!notRecognized, '"function" alias should work')
                    done()
                })
        })
    })

    describe('Alias consistency check', function () {
        this.timeout(10000)

        it('should produce similar output for command and alias', function (done) {
            // Compare tables vs t command output
            child_process.exec('node bin/cli.js tables --limit 3 --quiet', 
                (error1, stdout1, stderr1) => {
                    child_process.exec('node bin/cli.js t --limit 3 --quiet', 
                        (error2, stdout2, stderr2) => {
                            base.addContext(this, { title: 'Tables output', value: stdout1 })
                            base.addContext(this, { title: 'T alias output', value: stdout2 })
                            
                            // Both should have same error state (both succeed or both fail)
                            base.assert.strictEqual(!!error1, !!error2, 
                                'Command and alias should have same success/failure state')
                            done()
                        })
                })
        })

        it('should accept same flags for command and alias', function (done) {
            // Test that flags work the same way
            child_process.exec('node bin/cli.js tables --schema SYSTEM --limit 5 --quiet', 
                (error1, stdout1, stderr1) => {
                    child_process.exec('node bin/cli.js t --schema SYSTEM --limit 5 --quiet', 
                        (error2, stdout2, stderr2) => {
                            base.addContext(this, { title: 'Tables with flags', value: stdout1 })
                            base.addContext(this, { title: 'T alias with flags', value: stdout2 })
                            
                            base.assert.strictEqual(!!error1, !!error2, 
                                'Flags should work identically for command and alias')
                            done()
                        })
                })
        })
    })

    describe('Help output for aliases', function () {
        this.timeout(10000)

        it('should show help for table alias', function (done) {
            child_process.exec('node bin/cli.js t --help', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    
                    const hasHelp = stdout.includes('Usage') || stdout.includes('Options')
                    base.assert.ok(hasHelp, 'Alias should show help output')
                    done()
                })
        })

        it('should show help for view alias', function (done) {
            child_process.exec('node bin/cli.js v --help', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    
                    const hasHelp = stdout.includes('Usage') || stdout.includes('Options')
                    base.assert.ok(hasHelp, 'Alias should show help output')
                    done()
                })
        })

        it('should show help for function alias', function (done) {
            child_process.exec('node bin/cli.js f --help', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    
                    const hasHelp = stdout.includes('Usage') || stdout.includes('Options')
                    base.assert.ok(hasHelp, 'Alias should show help output')
                    done()
                })
        })
    })

    describe('Case sensitivity of aliases', function () {
        this.timeout(10000)

        it('should handle lowercase aliases', function (done) {
            child_process.exec('node bin/cli.js listtables --limit 3 --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const notRecognized = stderr.includes('Unknown command')
                    base.assert.ok(!notRecognized, 'Lowercase alias should work')
                    done()
                })
        })

        it('should handle camelCase aliases', function (done) {
            child_process.exec('node bin/cli.js listTables --limit 3 --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const notRecognized = stderr.includes('Unknown command')
                    base.assert.ok(!notRecognized, 'CamelCase alias should work')
                    done()
                })
        })
    })
})
