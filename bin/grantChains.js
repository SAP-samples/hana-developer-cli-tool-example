// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'grantChains'
export const aliases = ['grants', 'grantchain']
export const describe = baseLite.bundle.getText("grantChains")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
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
  depth: {
    alias: ['d'],
    type: 'number',
    default: 5,
    desc: baseLite.bundle.getText("chainDepth")
  },
  format: {
    alias: ['f'],
    type: 'string',
    choices: ['tree', 'table', 'json'],
    default: 'tree',
    desc: baseLite.bundle.getText("outputFormat")
  }
})).example('hana-cli grantChains --user DBUSER', baseLite.bundle.getText("grantChainsExample"))

export let inputPrompts = {
  user: {
    description: baseLite.bundle.getText("targetUser"),
    type: 'string',
    required: false
  },
  depth: {
    description: baseLite.bundle.getText("chainDepth"),
    type: 'number',
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
  base.promptHandler(argv, visualizeGrantChains, inputPrompts, true, true, builder)
}

/**
 * Visualize privilege inheritance chains
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function visualizeGrantChains(prompts) {
  const base = await import('../utils/base.js')
  base.debug('visualizeGrantChains')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const targetUser = prompts.user || null
      const targetRole = prompts.role || null
      const maxDepth = prompts.depth || 5
      const format = prompts.format || 'tree'

      base.output('')
      base.output(base.colors.bold(base.bundle.getText('grantChainsHeader')))
      base.output('')

      if (targetUser) {
        await analyzeUserGrantChain(db, targetUser, maxDepth, format, base)
      } else if (targetRole) {
        await analyzeRoleGrantChain(db, targetRole, maxDepth, format, base)
      } else {
        // Analyze current user
        const currentUserQuery = `SELECT CURRENT_USER FROM DUMMY`
        const currentUser = await db.execSQL(currentUserQuery)
        if (currentUser && currentUser.length > 0) {
          await analyzeUserGrantChain(db, currentUser[0].CURRENT_USER, maxDepth, format, base)
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
 * Analyze grant chain for a specific user
 */
async function analyzeUserGrantChain(db, userName, maxDepth, format, base) {
  base.output(base.colors.bold(base.bundle.getText('analyzingGrantChain', [userName])))
  base.output('')

  // Get roles granted to user
  const userRolesQuery = `
    SELECT 
      ROLE_NAME,
      GRANTOR,
      IS_GRANTABLE
    FROM SYS.GRANTED_ROLES
    WHERE GRANTEE = ?
    ORDER BY ROLE_NAME
  `

  const userRoles = await db.statementExecPromisified(
    await db.preparePromisified(userRolesQuery),
    [userName]
  )

  if (!userRoles || userRoles.length === 0) {
    base.output(base.bundle.getText('noRolesGranted'))
    base.output('')
    return
  }

  // Build the full grant chain
  const grantChain = {
    name: userName,
    type: 'USER',
    roles: []
  }

  for (const role of userRoles) {
    const roleChain = await buildRoleChain(db, role.ROLE_NAME, 1, maxDepth, base)
    roleChain.grantor = role.GRANTOR
    roleChain.isGrantable = role.IS_GRANTABLE
    grantChain.roles.push(roleChain)
  }

  // Display based on format
  if (format === 'tree') {
    displayTreeFormat(grantChain, base)
  } else if (format === 'table') {
    displayTableFormat(grantChain, base)
  } else if (format === 'json') {
    base.output(JSON.stringify(grantChain, null, 2))
  }

  base.output('')
  displayGrantChainSummary(grantChain, base)
}

/**
 * Build role inheritance chain recursively
 */
async function buildRoleChain(db, roleName, currentDepth, maxDepth, base) {
  const roleInfo = {
    name: roleName,
    type: 'ROLE',
    depth: currentDepth,
    privileges: [],
    nestedRoles: []
  }

  // Get privileges directly granted to this role
  const privilegesQuery = `
    SELECT 
      OBJECT_TYPE,
      SCHEMA_NAME,
      OBJECT_NAME,
      PRIVILEGE
    FROM SYS.GRANTED_PRIVILEGES
    WHERE GRANTEE = ?
    ORDER BY OBJECT_TYPE, SCHEMA_NAME, OBJECT_NAME, PRIVILEGE
  `

  const privileges = await db.statementExecPromisified(
    await db.preparePromisified(privilegesQuery),
    [roleName]
  )

  roleInfo.privileges = privileges || []

  // Get nested roles if we haven't reached max depth
  if (currentDepth < maxDepth) {
    const nestedRolesQuery = `
      SELECT ROLE_NAME, GRANTOR, IS_GRANTABLE
      FROM GRANTED_ROLES
      WHERE GRANTEE = ?
      ORDER BY ROLE_NAME
    `

    const nestedRoles = await db.statementExecPromisified(
      await db.preparePromisified(nestedRolesQuery),
      [roleName]
    )

    if (nestedRoles && nestedRoles.length > 0) {
      for (const nested of nestedRoles) {
        const nestedChain = await buildRoleChain(db, nested.ROLE_NAME, currentDepth + 1, maxDepth, base)
        nestedChain.grantor = nested.GRANTOR
        nestedChain.isGrantable = nested.IS_GRANTABLE
        roleInfo.nestedRoles.push(nestedChain)
      }
    }
  }

  return roleInfo
}

/**
 * Display grant chain in tree format
 */
function displayTreeFormat(grantChain, base) {
  base.output(base.colors.cyan.bold(`📦 ${grantChain.type}: ${grantChain.name}`))
  base.output('')

  for (const role of grantChain.roles) {
    displayRoleTree(role, 0, base)
  }
}

/**
 * Display role tree recursively
 */
function displayRoleTree(role, indent, base) {
  const indentStr = '  '.repeat(indent)
  const grantableStr = role.isGrantable === 'TRUE' ? base.colors.yellow(' [GRANTABLE]') : ''
  
  base.output(`${indentStr}├─ ${base.colors.blue('ROLE:')} ${role.name}${grantableStr}`)
  
  if (role.grantor) {
    base.output(`${indentStr}│  ${base.colors.gray(`Granted by: ${role.grantor}`)}`)
  }

  // Show privileges
  if (role.privileges && role.privileges.length > 0) {
    const privCount = role.privileges.length
    base.output(`${indentStr}│  ${base.colors.green(`${privCount} privilege(s):`)}`)
    
    // Group by object type
    const privsByType = {}
    for (const priv of role.privileges) {
      if (!privsByType[priv.OBJECT_TYPE]) {
        privsByType[priv.OBJECT_TYPE] = []
      }
      privsByType[priv.OBJECT_TYPE].push(priv)
    }

    for (const [objType, privs] of Object.entries(privsByType)) {
      if (privs.length <= 3) {
        for (const priv of privs) {
          const fullName = priv.SCHEMA_NAME ? `${priv.SCHEMA_NAME}.${priv.OBJECT_NAME}` : priv.OBJECT_NAME
          base.output(`${indentStr}│     • ${priv.PRIVILEGE} on ${objType} ${fullName}`)
        }
      } else {
        base.output(`${indentStr}│     • ${privs.length} ${objType} privileges`)
      }
    }
  }

  // Show nested roles
  if (role.nestedRoles && role.nestedRoles.length > 0) {
    base.output(`${indentStr}│`)
    for (const nested of role.nestedRoles) {
      displayRoleTree(nested, indent + 1, base)
    }
  }

  base.output(`${indentStr}│`)
}

/**
 * Display grant chain in table format
 */
function displayTableFormat(grantChain, base) {
  const flattenedGrants = []
  
  for (const role of grantChain.roles) {
    flattenGrants(role, grantChain.name, '', flattenedGrants)
  }

  if (flattenedGrants.length > 0) {
    base.output(base.colors.bold(base.bundle.getText('grantChainTable')))
    base.outputTableFancy(flattenedGrants)
  }
}

/**
 * Flatten grant chain for table display
 */
function flattenGrants(role, owner, path, result) {
  const currentPath = path ? `${path} → ${role.name}` : role.name

  result.push({
    'Grantee': owner,
    'Path': currentPath,
    'Type': role.type,
    'Privileges': role.privileges ? role.privileges.length : 0,
    'Grantable': role.isGrantable === 'TRUE' ? 'Yes' : 'No',
    'Depth': role.depth || 0
  })

  if (role.nestedRoles && role.nestedRoles.length > 0) {
    for (const nested of role.nestedRoles) {
      flattenGrants(nested, owner, currentPath, result)
    }
  }
}

/**
 * Analyze grant chain for a specific role
 */
async function analyzeRoleGrantChain(db, roleName, maxDepth, format, base) {
  base.output(base.colors.bold(base.bundle.getText('analyzingRoleChain', [roleName])))
  base.output('')

  const roleChain = await buildRoleChain(db, roleName, 0, maxDepth, base)

  if (format === 'tree') {
    displayRoleTree(roleChain, 0, base)
  } else if (format === 'table') {
    const flattenedGrants = []
    flattenGrants(roleChain, roleName, '', flattenedGrants)
    if (flattenedGrants.length > 0) {
      base.outputTableFancy(flattenedGrants)
    }
  } else if (format === 'json') {
    base.output(JSON.stringify(roleChain, null, 2))
  }

  base.output('')
}

/**
 * Display grant chain summary
 */
function displayGrantChainSummary(grantChain, base) {
  let totalRoles = 0
  let totalPrivileges = 0
  let maxDepth = 0
  let grantableCount = 0

  function countChain(role, depth) {
    totalRoles++
    if (role.privileges) {
      totalPrivileges += role.privileges.length
    }
    if (depth > maxDepth) {
      maxDepth = depth
    }
    if (role.isGrantable === 'TRUE') {
      grantableCount++
    }
    if (role.nestedRoles && role.nestedRoles.length > 0) {
      for (const nested of role.nestedRoles) {
        countChain(nested, depth + 1)
      }
    }
  }

  for (const role of grantChain.roles) {
    countChain(role, 1)
  }

  base.output(base.colors.bold(base.bundle.getText('grantChainSummary')))
  base.output(`  ${base.bundle.getText('totalRolesInChain')}: ${totalRoles}`)
  base.output(`  ${base.bundle.getText('totalPrivileges')}: ${totalPrivileges}`)
  base.output(`  ${base.bundle.getText('maxChainDepth')}: ${maxDepth}`)
  base.output(`  ${base.bundle.getText('grantableRoles')}: ${grantableCount}`)
  base.output('')

  if (grantableCount > 0) {
    base.output(base.colors.yellow(`⚠️  ${base.bundle.getText('grantableRolesWarning')}`))
    base.output('')
  }
}
