// @ts-check
import * as base from './base.js'

describe('fragmentationCheck', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/fragmentationCheck.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/fragmentationCheck.js --quiet", done)
    })

    it("returns output with schema filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/fragmentationCheck.js --schema MYSCHEMA --quiet", done)
    })

    it("returns output with threshold", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/fragmentationCheck.js --threshold 20 --quiet", done)
    })

})
