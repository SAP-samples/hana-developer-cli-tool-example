// @ts-check
import * as base from './base.js'

describe('hdbsql', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/hdbsql.js --help", done)
    })

})
