// @ts-check
import * as base from './base.js'

describe('tableGroups', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tableGroups.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tableGroups.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tableGroups.js -l 10 --quiet", done)
    })

    it("returns output with specific schema", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tableGroups.js -s SYS --quiet", done)
    })

    it("supports tg alias", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tg.js --help 2>/dev/null || node bin/tableGroups.js --help", done)
    })

})
