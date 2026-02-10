// @ts-check
import * as base from './base.js'

describe('disks', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/disks.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/disks.js --quiet", done)
    })

})
