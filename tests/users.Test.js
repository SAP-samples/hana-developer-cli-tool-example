// @ts-check
import * as base from './base.js'

describe('users', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli users --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli users --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli users -l 10 --quiet", done)
    })

})
