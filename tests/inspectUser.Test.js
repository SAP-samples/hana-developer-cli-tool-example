// @ts-check
import * as base from './base.js'

describe('inspectUser', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectUser --help", done)
    })

    it("returns normal output for SYSTEM user", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectUser -u SYSTEM --quiet", done)
    })

})
