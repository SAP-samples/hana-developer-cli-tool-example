// @ts-check
import * as base from './base.js'

describe('alerts', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/alerts.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/alerts.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/alerts.js -l 20 --quiet", done)
    })

    it("returns output filtered by severity", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/alerts.js --severity CRITICAL --quiet", done)
    })

})
