// @ts-check
import * as base from './base.js'

describe('copy2Env', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/copy2Env.js --help", done)
    })

})
