// @ts-check
import * as base from './base.js'

describe('btpInfo', function () {

     it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli btpInfo --help", done)
    }) 

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli btpInfo", done)
    })

    it("returns output with json option", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli btpInfo -o json", done)
    })

})

