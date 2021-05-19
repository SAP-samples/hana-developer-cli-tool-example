const base = require("../utils/base")

exports.command = 'hdbsql'
exports.describe = base.bundle.getText("hdbsql")
exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, launchHdbsql, {})
}

async function launchHdbsql(prompts) {
  try {
    const conn = require("../utils/connections")

    let envFile = conn.resolveEnv(prompts)
    const xsenv = require("@sap/xsenv")
    xsenv.loadEnv(envFile)

    let options = await xsenv.getServices({ hana: { tag: 'hana' }, })
    let encrypt = ''
    if (options.hana.encrypt == true) {
      if (options.hana.sslValidateCertificate == true) {
        if (options.hana.sslTrustStore) {
          encrypt = `-e -ssltruststore ${options.hana.sslTrustStore} `
          if (options.hana.sslCryptoProvider) {
            encrypt += `-sslprovider ${options.hana.sslCryptoProvider}`
          }
        } else {
          let str = options.hana.certificate.replace(/\r?\n|\r/g, " ")
          encrypt = `-e -ssltruststore "${str}" `
        }
      }
    }
    base.debug(options)
    let cmd = `hdbsql -u ${options.hana.user} -n ${options.hana.host + ":" + options.hana.port} -p ${options.hana.password} ${encrypt} -A -m -j`
    const { spawn } = require('child_process')
    await spawn(cmd, [], { shell: true, stdio: 'inherit' })
    return base.end()
  } catch (error) {
    base.error(error)
  }

}