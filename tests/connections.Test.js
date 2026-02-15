// @ts-check
import * as base from './base.js'

describe('connections', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/connections.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/connections.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/connections.js -l 30 --quiet", done)
    })

    it("returns output including idle connections", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/connections.js --idle --quiet", done)
    })

})
