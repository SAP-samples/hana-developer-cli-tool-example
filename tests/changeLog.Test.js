// @ts-check
import * as base from './base.js'

describe('changeLog', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/changeLog.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/changeLog.js", done)
    })

})
