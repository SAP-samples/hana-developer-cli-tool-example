// @ts-check
import * as base from '../utils/base.js'

export const command = 'createJWT [name]'
export const aliases = ['cJWT', 'cjwt', 'cJwt']
export const describe = base.bundle.getText("createJWT")

export const builder = base.getBuilder({
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

export function handler (argv) {
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

export async function activate(prompts) {
  base.debug('activate')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

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


