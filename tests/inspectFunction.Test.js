// @ts-check
import * as base from './base.js'

describe('inspectFunction', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectFunction --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectFunction -f GET_TYPE_MAP -s SYS --quiet", done)
    })

    it("returns output in SQL format", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectFunction -f GET_TYPE_MAP -s SYS -o sql --quiet", done)
    })

})
