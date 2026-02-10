// @ts-check
import * as base from './base.js'

describe('adminHDI', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/adminHDI.js --help", done)
    })

})
