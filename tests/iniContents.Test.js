// @ts-check
import * as base from './base.js'

describe('iniContents', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/iniContents.js --help", done)
    })

})
