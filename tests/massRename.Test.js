// @ts-check
import * as base from './base.js'

describe('massRename', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/massRename.js --help", done)
    })

})
