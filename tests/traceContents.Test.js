// @ts-check
import * as base from './base.js'

describe('traceContents', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/traceContents.js --help", done)
    })

})
