// @ts-check
import * as base from './base.js'

describe('version', function () {

     it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli version --help", done)
    }) 
    it("returns normal output", function (done) {
        base.exec("hana-cli version", (error, stdout) => {
            base.addContext(this, { title: 'Stdout', value: stdout })
            base.assert.match(stdout, /hana-cli: /)
            done()
        })
    })

})