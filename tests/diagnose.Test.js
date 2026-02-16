// @ts-check
import * as base from './base.js'

describe('diagnose', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/diagnose.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/diagnose.js --quiet", done)
    })

    it("returns output with specific check", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/diagnose.js --checks services --quiet", done)
    })

    it("returns output with multiple checks", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/diagnose.js --checks services,memory,alerts --quiet", done)
    })

})
