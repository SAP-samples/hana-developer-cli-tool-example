// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'createJWT [name]'
export const aliases = ['cJWT', 'cjwt', 'cJwt']
export const describe = baseLite.bundle.getText("createJWT")

export const builder = baseLite.getBuilder({
  name: {
    alias: ['c', 'Name'],
    type: 'string',
    desc: baseLite.bundle.getText("jwtName")
  },
  certificate: {
    alias: ['c', 'Certificate'],
    type: 'string',
    desc: baseLite.bundle.getText("certificate")
  },
  issuer: {
    alias: ['i', 'Issuer'],
    desc: baseLite.bundle.getText("issuer"),
    type: 'string'
  }
})

export async function handler (argv) {
  const base = await import('../utils/base.js')
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
  const base = await import('../utils/base.js')
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
    await base.error(error)
  }
}


