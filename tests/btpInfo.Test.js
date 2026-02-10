// @ts-check
import * as base from './base.js'

describe('btpInfo', function () {

     it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/btpInfo.js --help", done)
    }) 

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/btpInfo.js", done)
    })

    it("returns output with json option", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/btpInfo.js -o json", done)
    })

})

