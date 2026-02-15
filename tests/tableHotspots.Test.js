// @ts-check
import * as base from './base.js'

describe('tableHotspots', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tableHotspots.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tableHotspots.js --quiet", done)
    })

    it("returns output without partitions", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tableHotspots.js --includePartitions false --quiet", done)
    })

})
