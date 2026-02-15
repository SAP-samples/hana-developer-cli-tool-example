// @ts-check
import * as base from './base.js'

describe('timeSeriesTools', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/timeSeriesTools.js --help", done)
    })

    it("returns normal output with list action", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/timeSeriesTools.js list --quiet", done)
    })

    it("returns output with analyze action", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/timeSeriesTools.js analyze --quiet", done)
    })

    it("returns output with info action", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/timeSeriesTools.js info --quiet", done)
    })

})
