// @ts-check
import * as base from './base.js'

describe('systemInfo', function () {

     it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/systemInfo.js --help", done)
    }) 

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/systemInfo.js --quiet", done)
    })

    it("returns output with env option", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/systemInfo.js -o env", done)
    })

    it("returns output with dbx option", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/systemInfo.js -o dbx", done)
    })
})

