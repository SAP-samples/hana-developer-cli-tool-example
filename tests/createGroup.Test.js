// @ts-check
import * as base from './base.js'

describe('createGroup', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/createGroup.js --help", done)
    })

})
