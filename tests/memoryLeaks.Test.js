// @ts-check
import * as base from './base.js'

describe('memoryLeaks', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/memoryLeaks.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/memoryLeaks.js --quiet", done)
    })

    it("returns output with component filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/memoryLeaks.js --component indexserver --quiet", done)
    })

    it("returns output with threshold", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/memoryLeaks.js --threshold 15 --quiet", done)
    })

})
