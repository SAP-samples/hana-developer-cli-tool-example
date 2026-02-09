// @ts-check
import * as base from './base.js'

describe('createXSAAdmin', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli createXSAAdmin --help", done)
    })

})
