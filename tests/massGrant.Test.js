// @ts-check
import * as base from './base.js'

describe('massGrant', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/massGrant.js --help", done)
    })

})
