// @ts-check
import * as base from './base.js'

describe('inspectView', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectView.js --help", done)
    })

    it("returns normal output with quiet", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectView.js -v M_FEATURES -s SYS --quiet", done)
    })

    it("returns output in SQL format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectView.js -v M_FEATURES -s SYS -o sql --quiet", done)
    })

    it("returns output in CDS format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectView.js -v M_FEATURES -s SYS -o cds --quiet", done)
    })

    it("returns output in JSON format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectView.js -v M_FEATURES -s SYS -o json --quiet", done)
    })

})
