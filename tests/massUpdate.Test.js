// @ts-check
import * as base from './base.js'

describe('massUpdate', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/massUpdate.js --help", done)
    })

})
