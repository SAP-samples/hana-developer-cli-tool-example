// @ts-check
import * as base from './base.js'

describe('@all @schemaClone', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/schemaClone.js --help", done)
    })
})
