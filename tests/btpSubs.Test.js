// @ts-check
import * as base from './base.js'

describe('btpSubs', function () {

     it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/btpSubs.js --help", done)
    }) 

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/btpSubs.js", done)
    })

})

