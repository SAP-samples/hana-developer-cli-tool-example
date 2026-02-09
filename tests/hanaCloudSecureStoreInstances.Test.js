// @ts-check
import * as base from './base.js'

describe('hanaCloudSecureStoreInstances', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli hanaCloudSecureStoreInstances --help", done)
    })

})
