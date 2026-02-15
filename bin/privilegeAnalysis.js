// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'privilegeAnalysis'
export const aliases = ['privanalysis', 'privanalyze']
export const describe = baseLite.bundle.getText("privilegeAnalysis")

export const builder = baseLite.getBuilder({
  user: {
    alias: ['u'],
    type: 'string',
    desc: baseLite.bundle.getText("targetUser")
  },
  role: {
    alias: ['r'],
    type: 'string',
    desc: baseLite.bundle.getText("targetRole")
  },
  showUnused: {
    alias: ['unused'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("showUnusedPrivileges")
  },
  suggest: {
    alias: ['s'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("suggestLeastPrivilege")
  }
})

export let inputPrompts = {
  user: {
    description: baseLite.bundle.getText("targetUser"),
    type: 'string',
    required: false
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, analyzePrivileges, inputPrompts, true, true, builder)
}

/**
 * Analyze user privileges and suggest least privilege
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function analyzePrivileges(prompts) {
  const base = await import('../utils/base.js')
  base.debug('analyzePrivileges')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const targetUser = prompts.user || null
      const targetRole = prompts.role || null
      const showUnused = prompts.showUnused || false
      const suggest = prompts.suggest !== false

      base.output('')
      base.output(base.colors.bold(base.bundle.getText('privilegeAnalysisHeader')))
      base.output('')

      // Analyze user privileges
      if (targetUser) {
        await analyzeUserPrivileges(db, targetUser, showUnused, suggest, base)
      } else if (targetRole) {
        await analyzeRolePrivileges(db, targetRole, base)
      } else {
        // Analyze current user
        const currentUserQuery = `SELECT CURRENT_USER FROM DUMMY`
        const currentUser = await db.execSQL(currentUserQuery)
        if (currentUser && currentUser.length > 0) {
          await analyzeUserPrivileges(db, currentUser[0].CURRENT_USER, showUnused, suggest, base)
        }
      }

      await base.end()
    } catch (error) {
      await base.error(error)
    }
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Analyze privileges for a specific user
 * @param {object} db - Database connection
 * @param {string} userName - User name to analyze
 * @param {boolean} showUnused - Show unused privileges
 * @param {boolean} suggest - Suggest least privilege
 * @param {object} base - Base utility object
 */
async function analyzeUserPrivileges(db, userName, showUnused, suggest, base) {
  base.output(base.colors.bold(base.bundle.getText('analyzingUser', [userName])))
  base.output('')

  // Get granted system privileges
  const systemPrivQuery = `
    SELECT 
      PRIVILEGE,
      IS_GRANTABLE,
      GRANTOR
    FROM SYS.GRANTED_PRIVILEGES
    WHERE GRANTEE = ?
      AND OBJECT_TYPE = 'SYSTEMPRIVILEGE'
    ORDER BY PRIVILEGE
  `

  const systemPrivs = await db.statementExecPromisified(
    await db.preparePromisified(systemPrivQuery),
    [userName]
  )

  if (systemPrivs && systemPrivs.length > 0) {
    base.output(base.colors.bold(base.bundle.getText('systemPrivileges') + ':'))
    const displayPrivs = systemPrivs.map(row => ({
      'Privilege': row.PRIVILEGE,
      'Grantable': row.IS_GRANTABLE,
      'Granted By': row.GRANTOR
    }))
    base.outputTableFancy(displayPrivs)
    base.output('')
  }

  // Get granted object privileges
  const objectPrivQuery = `
    SELECT 
      OBJECT_TYPE,
      SCHEMA_NAME,
      OBJECT_NAME,
      PRIVILEGE,
      IS_GRANTABLE
    FROM SYS.GRANTED_PRIVILEGES
    WHERE GRANTEE = ?
      AND OBJECT_TYPE != 'SYSTEMPRIVILEGE'
    ORDER BY OBJECT_TYPE, SCHEMA_NAME, OBJECT_NAME, PRIVILEGE
  `

  const objectPrivs = await db.statementExecPromisified(
    await db.preparePromisified(objectPrivQuery),
    [userName]
  )

  if (objectPrivs && objectPrivs.length > 0) {
    base.output(base.colors.bold(base.bundle.getText('objectPrivileges') + ':'))
    const displayObjPrivs = objectPrivs.map(row => ({
      'Type': row.OBJECT_TYPE,
      'Schema': row.SCHEMA_NAME,
      'Object': row.OBJECT_NAME,
      'Privilege': row.PRIVILEGE,
      'Grantable': row.IS_GRANTABLE
    }))
    base.outputTableFancy(displayObjPrivs)
    base.output('')
  }

  // Get granted roles
  const rolesQuery = `
    SELECT 
      ROLE_NAME,
      GRANTOR,
      IS_GRANTABLE
    FROM SYS.GRANTED_ROLES
    WHERE GRANTEE = ?
    ORDER BY ROLE_NAME
  `

  const roles = await db.statementExecPromisified(
    await db.preparePromisified(rolesQuery),
    [userName]
  )

  if (roles && roles.length > 0) {
    base.output(base.colors.bold(base.bundle.getText('grantedRolesDetail') + ':'))
    const displayRoles = roles.map(row => ({
      'Role': row.ROLE_NAME,
      'Grantable': row.IS_GRANTABLE,
      'Granted By': row.GRANTOR
    }))
    base.outputTableFancy(displayRoles)
    base.output('')
  }

  // Summary statistics
  base.output(base.colors.bold(base.bundle.getText('privilegeSummary') + ':'))
  base.output(`  ${base.bundle.getText('totalSystemPrivileges')}: ${systemPrivs ? systemPrivs.length : 0}`)
  base.output(`  ${base.bundle.getText('totalObjectPrivileges')}: ${objectPrivs ? objectPrivs.length : 0}`)
  base.output(`  ${base.bundle.getText('totalRoles')}: ${roles ? roles.length : 0}`)
  base.output('')

  // Suggest least privilege if requested
  if (suggest) {
    base.output(base.colors.bold(base.bundle.getText('leastPrivilegeSuggestions') + ':'))
    
    // Check for overly permissive system privileges
    const dangerousPrivs = systemPrivs?.filter(p => 
      ['CATALOG READ', 'USER ADMIN', 'ROLE ADMIN', 'TRUST ADMIN'].includes(p.PRIVILEGE)
    ) || []

    if (dangerousPrivs.length > 0) {
      base.output(base.colors.yellow('  ⚠ ' + base.bundle.getText('dangerousPrivilegesDetected') + ':'))
      dangerousPrivs.forEach(p => {
        base.output(`    - ${p.PRIVILEGE}`)
      })
      base.output('')
    }

    // Check for wildcard grants
    const wildcardGrants = objectPrivs?.filter(p => 
      p.SCHEMA_NAME === '%' || p.OBJECT_NAME === '%'
    ) || []

    if (wildcardGrants.length > 0) {
      base.output(base.colors.yellow('  ⚠ ' + base.bundle.getText('wildcardGrantsDetected') + ':'))
      base.output(`    ${base.bundle.getText('consideredSpecificGrants')}`)
      base.output('')
    }

    // Check for grantable privileges
    const grantablePrivs = [...(systemPrivs || []), ...(objectPrivs || [])].filter(p => 
      p.IS_GRANTABLE === 'TRUE'
    )

    if (grantablePrivs.length > 0) {
      base.output(base.colors.yellow('  ⚠ ' + base.bundle.getText('grantablePrivilegesFound', [grantablePrivs.length])))
      base.output(`    ${base.bundle.getText('reviewGrantOption')}`)
      base.output('')
    }

    if (dangerousPrivs.length === 0 && wildcardGrants.length === 0 && grantablePrivs.length === 0) {
      base.output(base.colors.green('  ✓ ' + base.bundle.getText('noIssuesDetected')))
      base.output('')
    }
  }
}

/**
 * Analyze privileges for a specific role
 * @param {object} db - Database connection
 * @param {string} roleName - Role name to analyze
 * @param {object} base - Base utility object
 */
async function analyzeRolePrivileges(db, roleName, base) {
  base.output(base.colors.bold(base.bundle.getText('analyzingRole', [roleName])))
  base.output('')

  // Get role privileges
  const rolePrivQuery = `
    SELECT 
      OBJECT_TYPE,
      SCHEMA_NAME,
      OBJECT_NAME,
      PRIVILEGE
    FROM SYS.GRANTED_PRIVILEGES
    WHERE GRANTEE = ?
    ORDER BY OBJECT_TYPE, SCHEMA_NAME, OBJECT_NAME, PRIVILEGE
  `

  const rolePrivs = await db.statementExecPromisified(
    await db.preparePromisified(rolePrivQuery),
    [roleName]
  )

  if (rolePrivs && rolePrivs.length > 0) {
    base.output(base.colors.bold(base.bundle.getText('rolePrivileges') + ':'))
    base.outputTableFancy(rolePrivs)
  } else {
    base.output(base.bundle.getText('noPrivilegesFound'))
  }
}
