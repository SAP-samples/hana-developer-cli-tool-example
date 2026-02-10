// @ts-check
import * as base from './base.js'

describe('views', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/views.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/views.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/views.js -l 10 --quiet", done)
    })

    it("returns output with specific schema", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/views.js -s SYS --quiet", done)
    })

    it("returns output with view filter", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/views.js -v M_* --quiet", done)
    })

})
