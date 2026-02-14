// @ts-check
import * as base from './base.js'

describe('backupStatus', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/backupStatus.js --help", done)
    })
})
