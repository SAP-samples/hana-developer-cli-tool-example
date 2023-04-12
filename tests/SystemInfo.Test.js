// @ts-check
import * as base from './base.js'

describe('systemInfo', function () {

     it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli systemInfo --help", done)
    }) 

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli systemInfo --quiet", done)
    })

    it("returns output with env option", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli systemInfo -o env", done)
    })

    it("returns output with dbx option", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli systemInfo -o dbx", done)
    })
})

