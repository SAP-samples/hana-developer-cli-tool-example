// @ts-check
import * as base from './base.js'

describe('@all @tableCopy', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tableCopy.js --help", done)
    })
})
