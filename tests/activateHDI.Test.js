// @ts-check
import * as base from './base.js'

describe('activateHDI', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/activateHDI.js --help", done)
    })

})
