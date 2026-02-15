// @ts-check
import * as base from './base.js'

describe('queryPlan', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/queryPlan.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/queryPlan.js --sql \"select 1 from dummy\" --quiet", done)
    })

})
