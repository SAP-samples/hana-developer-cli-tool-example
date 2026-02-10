// @ts-check
import * as base from './base.js'

describe('inspectTable', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectTable.js --help", done)
    })

    it("returns normal output with quiet", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectTable.js -t DUMMY -s SYS --quiet", done)
    })

    it("returns output in SQL format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectTable.js -t DUMMY -s SYS -o sql --quiet", done)
    })

    it("returns output in CDS format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectTable.js -t DUMMY -s SYS -o cds --quiet", done)
    })

    it("returns output in JSON format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectTable.js -t SQLSCRIPT_LOGGING_TABLE_TYPE -s SYS -o json --quiet", done)
    })

    it("returns output in YAML format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectTable.js -t SQLSCRIPT_LOGGING_TABLE_TYPE -s SYS -o yaml --quiet", done)
    })

    it("returns output in hdbtable format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectTable.js -t SQLSCRIPT_LOGGING_TABLE_TYPE -s SYS -o hdbtable --quiet", done)
    })

    it("returns output with quoted identifiers", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectTable.js -t SQLSCRIPT_LOGGING_TABLE_TYPE -s SYS -o cds --quoted --quiet", done)
    })

})
