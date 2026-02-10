// @ts-check
import * as base from './base.js'

describe('massUsers', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/massUsers.js --help", done)
    })

})
