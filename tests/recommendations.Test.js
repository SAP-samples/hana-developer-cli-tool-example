// @ts-check
import * as base from './base.js'

describe('recommendations', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/recommendations.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/recommendations.js --quiet", done)
    })

    it("returns output with category filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/recommendations.js --category indexes --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/recommendations.js -l 25 --quiet", done)
    })

})
