// @ts-check
import * as base from './base.js'

describe('inspectTable', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectTable --help", done)
    })

    it("returns normal output with quiet", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectTable -t M_TABLES -s SYS --quiet", done)
    })

    it("returns output in SQL format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectTable -t M_TABLES -s SYS -o sql --quiet", done)
    })

    it("returns output in CDS format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectTable -t M_TABLES -s SYS -o cds --quiet", done)
    })

    it("returns output in JSON format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectTable -t M_TABLES -s SYS -o json --quiet", done)
    })

    it("returns output in YAML format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectTable -t M_TABLES -s SYS -o yaml --quiet", done)
    })

    it("returns output in hdbtable format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectTable -t M_TABLES -s SYS -o hdbtable --quiet", done)
    })

    it("returns output with quoted identifiers", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectTable -t M_TABLES -s SYS -o cds --quoted --quiet", done)
    })

})
