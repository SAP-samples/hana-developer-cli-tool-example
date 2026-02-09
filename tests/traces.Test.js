// @ts-check
import * as base from './base.js'

describe('traces', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli traces --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli traces --quiet", done)
    })

})
