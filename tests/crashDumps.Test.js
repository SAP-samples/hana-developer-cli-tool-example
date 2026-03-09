// @ts-check
import * as base from './base.js'

describe('crashDumps', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/crashDumps.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/crashDumps.js --quiet", done)
    })

    it("returns output with days filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/crashDumps.js --days 30 --quiet", done)
    })

    it("returns output with type filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/crashDumps.js --type SEGMENTATION --quiet", done)
    })

})
