// @ts-check
import * as base from './base.js'

describe('massConvert', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/massConvert.js --help", done)
    })

})
