// @ts-check
import * as base from './base.js'

describe('hanaCloudStart', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/hanaCloudStart.js --help", done)
    })

})
