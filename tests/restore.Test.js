// @ts-check
import * as base from './base.js'

describe('restore', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/restore.js --help", done)
    })
})
