// @ts-check
import * as base from './base.js'

describe('adminHDIGroup', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/adminHDIGroup.js --help", done)
    })

})
