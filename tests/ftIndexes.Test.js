// @ts-check
import * as base from './base.js'

describe('ftIndexes', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/ftIndexes.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/ftIndexes.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/ftIndexes.js -l 10 --quiet", done)
    })

    it("returns output with specific schema", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/ftIndexes.js -s SYS --quiet", done)
    })

    it("returns output with details", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/ftIndexes.js --quiet --details", done)
    })

    it("supports fti alias", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/ftIndexes.js --help", done)
    })

})
