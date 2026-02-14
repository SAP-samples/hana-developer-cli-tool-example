// @ts-check
import * as base from './base.js'

describe('backupList', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/backupList.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/backupList.js --quiet", done)
    })
})
