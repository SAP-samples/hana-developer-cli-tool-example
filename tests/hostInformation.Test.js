// @ts-check
import * as base from './base.js'

describe('hostInformation', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/hostInformation.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/hostInformation.js --quiet", done)
    })

})
