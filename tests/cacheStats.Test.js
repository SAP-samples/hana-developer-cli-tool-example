// @ts-check
import * as base from './base.js'

describe('cacheStats', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/cacheStats.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/cacheStats.js --quiet", done)
    })

    it("returns output with cache type", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/cacheStats.js -t plan --quiet", done)
    })

})
