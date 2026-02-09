// @ts-check
import * as base from './base.js'

describe('tables', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli tables --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli tables --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli tables -l 10 --quiet", done)
    })

    it("returns output with specific schema", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli tables -s SYSTEM --quiet", done)
    })

    it("returns output with table filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli tables -t M_* --quiet", done)
    })

})
