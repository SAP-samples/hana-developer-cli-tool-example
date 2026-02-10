// @ts-check
import * as base from './base.js'

describe('hanaCloudSecureStoreInstances', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/hanaCloudSecureStoreInstances.js --help", done)
    })

})
