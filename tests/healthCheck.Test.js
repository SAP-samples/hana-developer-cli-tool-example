// @ts-check
import * as base from './base.js'

describe('healthCheck', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/healthCheck.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/healthCheck.js --quiet", done)
    })

    it("returns output with specific check", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/healthCheck.js --checks memory --quiet", done)
    })

})
