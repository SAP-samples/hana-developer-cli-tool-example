// @ts-check
import * as base from './base.js'

describe('inspectProcedure', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectProcedure.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectProcedure.js -p GET_CHECK_ACTIONS -s SYS --quiet", done)
    })

    it("returns output in SQL format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectProcedure.js -p GET_CHECK_ACTIONS -s SYS -o sql --quiet", done)
    })

})
