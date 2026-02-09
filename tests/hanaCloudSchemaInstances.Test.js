// @ts-check
import * as base from './base.js'

describe('hanaCloudSchemaInstances', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli hanaCloudSchemaInstances --help", done)
    })

})
