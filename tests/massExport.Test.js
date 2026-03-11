// @ts-check
import * as base from './base.js'
import yargs from 'yargs/yargs'
import { assert } from './base.js'

describe('massExport', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/massExport.js --help", done)
    })

    it('parses --folder as folder and not schema', async function () {
        const massExportCmd = await import('../bin/massExport.js')

        const parser = massExportCmd.builder(yargs([])
            .scriptName('hana-cli')
            .help(false)
            .version(false)
            .exitProcess(false))

        const argv = await parser.parse(['--object', '%', '-t', 'TABLE', '--data', '--folder', './tmp'])

        assert.strictEqual(argv.folder, './tmp')
        assert.notStrictEqual(argv.schema, './tmp')
    })

    it('defaults schema to CURRENT_SCHEMA when schema is omitted', async function () {
        const massExportCmd = await import('../bin/massExport.js')

        const parser = massExportCmd.builder(yargs([])
            .scriptName('hana-cli')
            .help(false)
            .version(false)
            .exitProcess(false))

        const argv = await parser.parse(['--object', '%', '--folder', './tmp'])

        assert.strictEqual(argv.schema, '**CURRENT_SCHEMA**')
    })

    it('defaults object to wildcard when object is omitted', async function () {
        const massExportCmd = await import('../bin/massExport.js')

        const parser = massExportCmd.builder(yargs([])
            .scriptName('hana-cli')
            .help(false)
            .version(false)
            .exitProcess(false))

        const argv = await parser.parse(['--folder', './tmp'])

        assert.strictEqual(argv.object, '*')
    })

})
