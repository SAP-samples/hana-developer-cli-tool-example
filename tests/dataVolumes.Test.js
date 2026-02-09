// @ts-check
import * as base from './base.js'

describe('dataVolumes', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli dataVolumes --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli dataVolumes --quiet", done)
    })

})
