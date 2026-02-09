// @ts-check
import * as base from './base.js'

describe('copy2Secrets', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli copy2Secrets --help", done)
    })

})
