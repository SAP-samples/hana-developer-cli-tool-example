// @ts-check
import * as base from './base.js'

describe('inspectFunction', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectFunction.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectFunction.js -f GET_CALC_VIEW_COLUMN_DEPENDENCIES -s SYS --quiet", done)
    })

    it("returns output in SQL format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectFunction.js -f GET_CALC_VIEW_COLUMN_DEPENDENCIES -s SYS -o sql --quiet", done)
    })

})
