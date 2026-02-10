// @ts-check
import * as base from './base.js'

describe('inspectJWT', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectJWT.js --help", done)
    })

})
