// @ts-check
import * as base from './base.js'

describe('@all @dataSync', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/dataSync.js --help", done)
    })
})
