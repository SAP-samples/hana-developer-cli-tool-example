// @ts-check
import * as base from './base.js'

describe('privilegeAnalysis', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/privilegeAnalysis.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/privilegeAnalysis.js --quiet", done)
    })

    it("returns output with least privilege suggestions", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/privilegeAnalysis.js --suggest --quiet", done)
    })

    it("returns output with depth parameter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/privilegeAnalysis.js --depth 3 --quiet", done)
    })

    it("handles user alias", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/privanalysis.js --help", done)
    })

})
