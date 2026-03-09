// @ts-check
import * as base from './base.js'

describe('columnStats', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/columnStats.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/columnStats.js --quiet", done)
    })

    it("returns output with schema", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/columnStats.js -s SYS --quiet", done)
    })

})
