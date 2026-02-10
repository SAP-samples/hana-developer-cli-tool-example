// @ts-check
import * as base from './base.js'

describe('copy2Secrets', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/copy2Secrets.js --help", done)
    })

})
