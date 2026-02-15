// @ts-check
import * as base from './base.js'

describe('longRunning', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/longRunning.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/longRunning.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/longRunning.js -l 10 --quiet", done)
    })

    it("returns output with duration filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/longRunning.js --duration 120 --quiet", done)
    })

})
