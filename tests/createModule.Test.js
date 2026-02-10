// @ts-check
import * as base from './base.js'

describe('createModule', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/createModule.js --help", done)
    })

})
