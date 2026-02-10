// @ts-check
import * as base from './base.js'

describe('inspectTrigger', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectTrigger.js --help", done)
    })

})
