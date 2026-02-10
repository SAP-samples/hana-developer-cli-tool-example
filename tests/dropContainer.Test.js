// @ts-check
import * as base from './base.js'

describe('dropContainer', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/dropContainer.js --help", done)
    })

})
