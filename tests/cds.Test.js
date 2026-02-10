// @ts-check
import * as base from './base.js'

describe('cds', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/cds.js --help", done)
    })

})
