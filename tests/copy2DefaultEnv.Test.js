// @ts-check
import * as base from './base.js'

describe('copy2DefaultEnv', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli copy2DefaultEnv --help", done)
    })

})
