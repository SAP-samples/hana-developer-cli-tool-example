// @ts-check
import * as base from './base.js'

describe('inspectView', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectView --help", done)
    })

    it("returns normal output with quiet", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectView -v M_VIEWS -s SYS --quiet", done)
    })

    it("returns output in SQL format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectView -v M_VIEWS -s SYS -o sql --quiet", done)
    })

    it("returns output in CDS format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectView -v M_VIEWS -s SYS -o cds --quiet", done)
    })

    it("returns output in JSON format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectView -v M_VIEWS -s SYS -o json --quiet", done)
    })

})
