// @ts-check
import * as base from './base.js'

describe('memoryAnalysis', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/memoryAnalysis.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/memoryAnalysis.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/memoryAnalysis.js -l 10 --quiet", done)
    })

})
