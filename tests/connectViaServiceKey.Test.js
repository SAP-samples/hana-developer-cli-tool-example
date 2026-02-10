// @ts-check
import * as base from './base.js'

describe('connectViaServiceKey', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/connectViaServiceKey.js --help", done)
    })

})
