// @ts-check
import * as base from './base.js'

describe('inspectUser', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectUser.js --help", done)
    })

    it("returns normal output for SYSTEM user", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectUser.js -u SYSTEM --quiet", done)
    })

})
