// @ts-check
import * as base from './base.js'

describe('changeLog', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli changeLog --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli changeLog", done)
    })

})
