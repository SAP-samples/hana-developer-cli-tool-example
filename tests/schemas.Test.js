// @ts-check
import * as base from './base.js'

describe('schemas', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/schemas.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/schemas.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/schemas.js -l 10 --quiet", done)
    })

    it("returns output for all schemas", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/schemas.js --all --quiet", done)
    })

    it("returns output with schema filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/schemas.js -s SYS* --quiet", done)
    })

})
