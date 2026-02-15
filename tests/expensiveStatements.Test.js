// @ts-check
import * as base from './base.js'

describe('expensiveStatements', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/expensiveStatements.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/expensiveStatements.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/expensiveStatements.js -l 5 --quiet", done)
    })

})
