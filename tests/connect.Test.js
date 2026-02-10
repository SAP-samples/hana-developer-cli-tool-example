// @ts-check
import * as base from './base.js'

describe('connect', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/connect.js --help", done)
    })

})
