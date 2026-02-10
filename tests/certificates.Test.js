// @ts-check
import * as base from './base.js'

describe('certificates', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/certificates.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/certificates.js --quiet", done)
    })

})
