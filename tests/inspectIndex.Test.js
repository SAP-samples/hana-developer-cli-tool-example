// @ts-check
import * as base from './base.js'

describe('inspectIndex', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectIndex --help", done)
    })

    it("returns normal output with quiet", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli inspectIndex -i _SYS_TREE_CS_#* -s SYS --quiet", done)
    })

})
