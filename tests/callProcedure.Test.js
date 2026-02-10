// @ts-check
import * as base from './base.js'

describe('callProcedure', function () {

     it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/callProcedure.js --help", done)
    }) 

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/callProcedure.js -s SYS -p GET_TYPE_MAP --quiet", done)
    })

})

