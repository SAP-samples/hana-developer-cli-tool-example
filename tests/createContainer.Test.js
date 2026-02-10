// @ts-check
import * as base from './base.js'

describe('createContainer', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/createContainer.js --help", done)
    })

})
