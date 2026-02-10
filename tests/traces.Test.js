// @ts-check
import * as base from './base.js'

describe('traces', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/traces.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/traces.js --quiet", done)
    })

})
