// @ts-check
import * as base from './base.js'

describe('kafkaConnect', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/kafkaConnect.js --help", done)
    })

    it("returns normal output with list action", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/kafkaConnect.js list --quiet", done)
    })

    it("returns output with status action", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/kafkaConnect.js status --quiet", done)
    })

    it("returns output with info action", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/kafkaConnect.js info --quiet", done)
    })

})
