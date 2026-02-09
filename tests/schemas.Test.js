// @ts-check
import * as base from './base.js'

describe('schemas', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli schemas --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli schemas --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli schemas -l 10 --quiet", done)
    })

    it("returns output for all schemas", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli schemas --all --quiet", done)
    })

    it("returns output with schema filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli schemas -s SYS* --quiet", done)
    })

})
