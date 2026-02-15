// @ts-check
import * as base from './base.js'

describe('auditLog', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/auditLog.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/auditLog.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/auditLog.js -l 20 --quiet", done)
    })

    it("returns output with days filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/auditLog.js --days 30 --quiet", done)
    })

    it("returns output with severity filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/auditLog.js --level CRITICAL --quiet", done)
    })

})
