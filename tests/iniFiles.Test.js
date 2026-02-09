// @ts-check
import * as base from './base.js'

describe('iniFiles', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli iniFiles --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli iniFiles --quiet", done)
    })

})
