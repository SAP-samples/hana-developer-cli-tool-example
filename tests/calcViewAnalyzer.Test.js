// @ts-check
import * as base from './base.js'

describe('calcViewAnalyzer', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/calcViewAnalyzer.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/calcViewAnalyzer.js --quiet", done)
    })

    it("returns output with schema", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/calcViewAnalyzer.js -s SYS --quiet", done)
    })

    it("returns output with metrics flag", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/calcViewAnalyzer.js --metrics --quiet", done)
    })

})
