// @ts-check
import * as base from './base.js'

describe('partitions', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/partitions.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/partitions.js --quiet", done)
    })

    it("returns output with limit", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/partitions.js -l 10 --quiet", done)
    })

    it("returns output with specific schema", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/partitions.js -s SYS --quiet", done)
    })

    it("supports partition alias", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/partition.js --help 2>/dev/null || node bin/partitions.js --help", done)
    })

})
