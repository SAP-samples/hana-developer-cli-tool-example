// @ts-check
import * as base from './base.js'

describe('hanaCloudStop', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli hanaCloudStop --help", done)
    })

})
