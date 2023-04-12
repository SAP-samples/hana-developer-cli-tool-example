// @ts-check
import * as base from './base.js'

describe('btpSubs', function () {

     it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli btpSubs --help", done)
    }) 

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli btpSubs", done)
    })

})

