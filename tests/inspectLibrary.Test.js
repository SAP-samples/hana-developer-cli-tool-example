// @ts-check
import * as base from './base.js'

describe('inspectLibrary', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectLibrary.js --help", done)
    })

})
