// @ts-check
import * as base from './base.js'

describe('iniFiles', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/iniFiles.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/iniFiles.js --quiet", done)
    })

})
