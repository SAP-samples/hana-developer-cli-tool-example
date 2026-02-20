// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'pwdPolicy'
export const aliases = ['pwdpolicy', 'passpolicies']
export const describe = baseLite.bundle.getText("pwdPolicy")

const pwdPolicyOptions = {
  policy: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("policyName")
  },
  list: {
    alias: ['l'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("listPolicies")
  },
  users: {
    alias: ['u'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("showPolicyUsers")
  },
  details: {
    alias: ['d'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("detailedPolicyInfo")
  }
}

export const builder = (yargs) => yargs.options(baseLite.getBuilder(pwdPolicyOptions)).wrap(160).example('hana-cli pwdPolicy --list --details', baseLite.bundle.getText('pwdPolicyExample')).wrap(160).epilog(buildDocEpilogue('pwdPolicy', 'security', ['users', 'inspectUser']))

export const pwdPolicyBuilderOptions = baseLite.getBuilder(pwdPolicyOptions)

export let inputPrompts = {
  list: {
    description: baseLite.bundle.getText("listPolicies"),
    type: 'boolean',
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
  base.promptHandler(argv, managePasswordPolicies, inputPrompts, true, true, pwdPolicyBuilderOptions)
}

/**
 * View and manage password policies
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function managePasswordPolicies(prompts) {
  const base = await import('../utils/base.js')
  base.debug('managePasswordPolicies')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const policyName = prompts.policy || null
      const listAll = prompts.list !== false
      const showUsers = prompts.users || false
      const showDetails = prompts.details || false

      base.output('')
      base.output(base.colors.bold(base.bundle.getText('pwdPolicyHeader')))
      base.output('')

      if (policyName) {
        // Show specific policy
        await showPolicyDetails(db, policyName, showUsers, base)
      } else if (listAll) {
        // List all policies
        await listAllPolicies(db, showDetails, base)
      }

      // Show policy compliance summary
      await showComplianceSummary(db, base)

      await base.end()
    } catch (error) {
      await base.error(error)
    }
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Show details for a specific password policy
 */
async function showPolicyDetails(db, policyName, showUsers, base) {
  base.output(base.colors.bold(base.bundle.getText('policyDetails', [policyName])))
  base.output('')
  
  const policyInfo = [
    { 'Property': base.bundle.getText('policyName') || 'Policy Name', 'Value': policyName },
    { 'Property': base.bundle.getText('status') || 'Status', 'Value': 'Configured at Database Level' },
    { 'Property': base.bundle.getText('applicableUsers') || 'Applicable Users', 'Value': 'All users' }
  ]

  base.outputTableFancy(policyInfo)
  base.output('')

  if (showUsers) {
    const usersQuery = `
      SELECT USER_NAME, USER_DEACTIVATED, LAST_SUCCESSFUL_CONNECT
      FROM SYS.USERS
      WHERE USER_DEACTIVATED = 'FALSE'
      ORDER BY USER_NAME
    `

    const users = await db.statementExecPromisified(
      await db.preparePromisified(usersQuery),
      []
    )

    if (users && users.length > 0) {
      base.output(base.colors.bold(base.bundle.getText('usersWithPolicy', [users.length])))
      const displayUsers = users.map(row => ({
        'User': row.USER_NAME,
        'Active': row.USER_DEACTIVATED === 'FALSE' ? 'Yes' : 'No',
        'Last Login': row.LAST_SUCCESSFUL_CONNECT || 'Never'
      }))
      base.outputTableFancy(displayUsers)
      base.output('')
    } else {
      base.output(base.bundle.getText('noUsersWithPolicy'))
      base.output('')
    }
  }

  // Policy strength assessment
  assessPolicyStrength({}, base)
}

/**
 * List all password policies
 */
async function listAllPolicies(db, showDetails, base) {
  base.output(base.colors.bold(base.bundle.getText('allPasswordPolicies')))
  base.output('')
  
  // Get user statistics
  const userStatsQuery = `
    SELECT COUNT(*) as "Total Users",
           SUM(CASE WHEN USER_DEACTIVATED = 'FALSE' THEN 1 ELSE 0 END) as "Active Users",
           SUM(CASE WHEN USER_DEACTIVATED = 'TRUE' THEN 1 ELSE 0 END) as "Deactivated Users"
    FROM SYS.USERS
  `

  const stats = await db.execSQL(userStatsQuery)

  if (stats && stats.length > 0) {
    const displayStats = [{
      'Metric': 'Total Users',
      'Count': stats[0]['Total Users']
    }, {
      'Metric': 'Active Users',
      'Count': stats[0]['Active Users']
    }, {
      'Metric': 'Deactivated Users',
      'Count': stats[0]['Deactivated Users']
    }]
    
    base.outputTableFancy(displayStats)
    base.output('')
  }

  base.output(base.bundle.getText('passwordPoliciesAreConfiguredAtDatabaseLevel') || 'Password policies are configured at the database level in SAP HANA.')
  base.output(base.bundle.getText('useDetailsFlagForMoreInfo') || 'Use the --details flag for more detailed information.')
}

/**
 * Show compliance summary
 */
async function showComplianceSummary(db, base) {
  base.output(base.colors.bold(base.bundle.getText('complianceSummary')))
  
  const complianceChecks = []

  // Check: Active users count
  const activeUsersQuery = `
    SELECT COUNT(*) as "Count"
    FROM SYS.USERS
    WHERE USER_DEACTIVATED = 'FALSE'
  `
  const activeUsers = await db.execSQL(activeUsersQuery)
  const activeUserCount = activeUsers[0].Count

  complianceChecks.push({
    'Check': 'Active Users',
    'Status': 'INFO',
    'Count': activeUserCount
  })

  // Check: Password Policy Strength
  complianceChecks.push({
    'Check': 'Password Policy Strength',
    'Status': 'INFO',
    'Count': 'Managed at DB Level'
  })

  // Check: Deactivated users
  const deactivatedQuery = `
    SELECT COUNT(*) as "Count"
    FROM SYS.USERS
    WHERE USER_DEACTIVATED = 'TRUE'
  `
  const deactivated = await db.execSQL(deactivatedQuery)
  const deactivatedCount = deactivated[0].Count

  if (deactivatedCount > 0) {
    complianceChecks.push({
      'Check': 'Deactivated Users',
      'Status': 'WARN',
      'Count': deactivatedCount
    })
  } else {
    complianceChecks.push({
      'Check': 'Deactivated Users',
      'Status': 'PASS',
      'Count': 0
    })
  }

  base.outputTableFancy(complianceChecks)
  base.output('')
}

/**
 * Assess password policy strength
 */
function assessPolicyStrength(policy, base) {
  base.output(base.colors.bold(base.bundle.getText('policyStrengthAssessment')))
  
  // If no policy object provided, show general guidance
  if (!policy || Object.keys(policy).length === 0) {
    base.output(base.colors.blue('  Password policies are managed at the SAP HANA database level.'))
    base.output(base.colors.blue('  For specific policy details, configure them in the database settings.'))
    base.output('')
    return
  }

  const issues = []
  const recommendations = []

  if (policy.MINIMUM_PASSWORD_LENGTH < 8) {
    issues.push(base.bundle.getText('shortPasswordLength'))
  } else if (policy.MINIMUM_PASSWORD_LENGTH < 12) {
    recommendations.push(base.bundle.getText('recommendLongerPassword'))
  }

  if (policy.PASSWORD_EXPIRE_TIME === 0) {
    issues.push(base.bundle.getText('noPasswordExpiration'))
  } else if (policy.PASSWORD_EXPIRE_TIME > 365) {
    recommendations.push(base.bundle.getText('longExpirationTime'))
  }

  if (policy.MAXIMUM_INVALID_CONNECT_ATTEMPTS === 0) {
    issues.push(base.bundle.getText('noAccountLockout'))
  }

  if (policy.MINIMAL_PASSWORD_COMPLEXITY === '0' || policy.MINIMAL_PASSWORD_COMPLEXITY === 'LOW') {
    recommendations.push(base.bundle.getText('lowComplexityRequirement'))
  }

  if (policy.LAST_USED_PASSWORDS < 5) {
    recommendations.push(base.bundle.getText('passwordReuseNotPrevented'))
  }

  if (issues.length > 0) {
    base.output(base.colors.red('  Issues:'))
    issues.forEach(issue => base.output(`    - ${issue}`))
  }

  if (recommendations.length > 0) {
    base.output(base.colors.yellow('  Recommendations:'))
    recommendations.forEach(rec => base.output(`    - ${rec}`))
  }

  if (issues.length === 0 && recommendations.length === 0) {
    base.output(base.colors.green('  ✓ ' + base.bundle.getText('strongPolicy')))
  }

  base.output('')
}
