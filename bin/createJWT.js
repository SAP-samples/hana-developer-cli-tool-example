const base = require("../utils/base")

exports.command = 'createJWT [name]'
exports.aliases = ['cJWT', 'cjwt', 'cJwt']
exports.describe = base.bundle.getText("createJWT")

exports.builder = base.getBuilder({
  name: {
    alias: ['c', 'Name'],
    type: 'string',
    desc: base.bundle.getText("jwtName")
  },
  certificate: {
    alias: ['c', 'Certificate'],
    type: 'string',
    desc: base.bundle.getText("certificate")
  },
  issuer: {
    alias: ['i', 'Issuer'],
    desc: base.bundle.getText("issuer"),
    type: 'string'
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, activate, {
    name: {
      description: base.bundle.getText("jwtName"),
      required: true
    },
    certificate: {
      description: base.bundle.getText("certificate"),
      required: true
    },
    issuer: {
      description: base.bundle.getText("issuer"),
      required: true
    }
  })
}

async function activate(prompts) {

  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    let results = await db.execSQL(
      `CREATE certificate from '${prompts.certificate}';`)
    console.table(results)

    results = await db.execSQL(
      `CALL SYSTEM.CREATE_JWT_PROVIDER('${prompts.name}', '${prompts.issuer}', 'user_name', true);`)
    console.table(results)

    results = await db.execSQL(
      `CREATE pse ${prompts.name};`)
    console.table(results)

    let cert = await db.execSQL(
      `SELECT CERTIFICATE_ID FROM CERTIFICATES WHERE ISSUER_COMMON_NAME = '${prompts.issuer}'`)

    results = await db.execSQL(
      `ALTER pse ${prompts.name} ADD certificate ${cert[0].CERTIFICATE_ID};`)
    console.table(results)

    results = await db.execSQL(
      `CALL SYSTEM.SET_PSE_PURPOSE('${prompts.name}', 'JWT', ARRAY('${prompts.name}'));`)
    console.table(results)

    return base.end()
  } catch (error) {
    base.error(error)
  }
}


