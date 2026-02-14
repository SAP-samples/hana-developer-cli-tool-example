// @ts-check
import * as base from './base.js'

describe('backup', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/backup.js --help", done)
    })
})
