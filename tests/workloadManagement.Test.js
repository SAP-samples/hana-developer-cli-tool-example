// @ts-check
import * as base from './base.js'

describe('workloadManagement', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/workloadManagement.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/workloadManagement.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/workloadManagement.js -l 10 --quiet", done)
    })

    it("supports wlm alias", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/wlm.js --help 2>/dev/null || node bin/workloadManagement.js --help", done)
    })

    it("returns output with specific priority filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/workloadManagement.js -p HIGH --quiet", done)
    })

})
