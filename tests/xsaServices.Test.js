// @ts-check
import * as base from './base.js'

describe('xsaServices', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/xsaServices.js --help", done)
    })

    it("returns normal output with list action", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/xsaServices.js list --quiet", done)
    })

    it("returns output with status action", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/xsaServices.js status --quiet", done)
    })

    it("returns output with details flag", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/xsaServices.js list --details --quiet", done)
    })

})
