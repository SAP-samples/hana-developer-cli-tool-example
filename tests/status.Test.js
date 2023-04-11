// @ts-check
import * as base from './base.js'

describe('status', function () {

     it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli status --help", done)
    }) 

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli status --quiet", done)
    })

    it("returns output with privileges", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli status -p --quiet", done)
    })
})

