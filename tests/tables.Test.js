// @ts-check
import * as base from './base.js'

describe('tables', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tables.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tables.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tables.js -l 10 --quiet", done)
    })

    it("returns output with specific schema", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tables.js -s SYSTEM --quiet", done)
    })

    it("returns output with table filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tables.js -t M_* --quiet", done)
    })

})
