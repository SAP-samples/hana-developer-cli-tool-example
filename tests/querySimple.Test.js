// @ts-check
import * as base from './base.js'

describe('querySimple', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli querySimple --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli querySimple --query \"SELECT * FROM DUMMY\" --quiet", done)
    })

})
