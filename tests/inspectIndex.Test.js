// @ts-check
import * as base from './base.js'

describe('inspectIndex', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectIndex.js --help", done)
    })

    it("returns normal output with quiet", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/inspectIndex.js -i _SYS_TREE_CS_#* -s SYS --quiet", done)
    })

})
