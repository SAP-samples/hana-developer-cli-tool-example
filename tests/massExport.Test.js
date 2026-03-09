// @ts-check
import * as base from './base.js'

describe('massExport', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/massExport.js --help", done)
    })

})
