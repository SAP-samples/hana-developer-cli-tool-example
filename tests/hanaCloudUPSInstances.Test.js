// @ts-check
import * as base from './base.js'

describe('hanaCloudUPSInstances', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/hanaCloudUPSInstances.js --help", done)
    })

})
