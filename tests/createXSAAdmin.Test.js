// @ts-check
import * as base from './base.js'

describe('createXSAAdmin', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/createXSAAdmin.js --help", done)
    })

})
