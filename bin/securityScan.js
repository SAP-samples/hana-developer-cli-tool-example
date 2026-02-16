// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'securityScan'
export const aliases = ['secscan', 'scan']
export const describe = baseLite.bundle.getText("securityScan")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  category: {
    alias: ['c'],
    type: 'string',
    choices: ['all', 'users', 'passwords', 'privileges', 'encryption', 'audit'],
    default: 'all',
    desc: baseLite.bundle.getText("securityCategory")
  },
  detailed: {
    alias: ['d'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("detailedScan")
  },
  fix: {
    alias: ['f'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("autoFix")
  }
})).example('hana-cli securityScan --category all --detailed', baseLite.bundle.getText('securityScanExample'))

export let inputPrompts = {
  category: {
    description: baseLite.bundle.getText("securityCategory"),
    type: 'string',
    required: true
  },
  detailed: {
    description: baseLite.bundle.getText("detailedScan"),
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
  base.promptHandler(argv, scanForVulnerabilities, inputPrompts, true, true, builder)
}

/**
 * Scan for common security vulnerabilities
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function scanForVulnerabilities(prompts) {
  const base = await import('../utils/base.js')
  base.debug('scanForVulnerabilities')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const category = prompts.category || 'all'
      const detailed = prompts.detailed || false
      const autoFix = prompts.fix || false

      let issues = []
      let warnings = []
      let info = []

      base.output('')
      base.output(base.colors.bold(base.bundle.getText('securityScanHeader')))
      base.output(`${base.bundle.getText('scanningCategory')}: ${category}`)
      base.output('')

      // Scan categories
      if (category === 'all' || category === 'users') {
        const userIssues = await scanUsers(db, detailed, base)
        issues = issues.concat(userIssues.issues)
        warnings = warnings.concat(userIssues.warnings)
        info = info.concat(userIssues.info)
      }

      if (category === 'all' || category === 'passwords') {
        const passwordIssues = await scanPasswords(db, detailed, base)
        issues = issues.concat(passwordIssues.issues)
        warnings = warnings.concat(passwordIssues.warnings)
        info = info.concat(passwordIssues.info)
      }

      if (category === 'all' || category === 'privileges') {
        const privilegeIssues = await scanPrivileges(db, detailed, base)
        issues = issues.concat(privilegeIssues.issues)
        warnings = warnings.concat(privilegeIssues.warnings)
        info = info.concat(privilegeIssues.info)
      }

      if (category === 'all' || category === 'encryption') {
        const encryptionIssues = await scanEncryption(db, detailed, base)
        issues = issues.concat(encryptionIssues.issues)
        warnings = warnings.concat(encryptionIssues.warnings)
        info = info.concat(encryptionIssues.info)
      }

      if (category === 'all' || category === 'audit') {
        const auditIssues = await scanAudit(db, detailed, base)
        issues = issues.concat(auditIssues.issues)
        warnings = warnings.concat(auditIssues.warnings)
        info = info.concat(auditIssues.info)
      }

      // Display results
      base.output('')
      base.output(base.colors.bold(base.bundle.getText('scanResults') + ':'))
      base.output('')

      if (issues.length > 0) {
        base.output(base.colors.red.bold('🔴 ' + base.bundle.getText('criticalIssues', [issues.length])))
        issues.forEach((issue, idx) => {
          base.output(`  ${idx + 1}. ${issue}`)
        })
        base.output('')
      }

      if (warnings.length > 0) {
        base.output(base.colors.yellow.bold('⚠️  ' + base.bundle.getText('warnings', [warnings.length])))
        warnings.forEach((warning, idx) => {
          base.output(`  ${idx + 1}. ${warning}`)
        })
        base.output('')
      }

      if (info.length > 0 && detailed) {
        base.output(base.colors.blue.bold('ℹ️  ' + base.bundle.getText('informational', [info.length])))
        info.forEach((infoItem, idx) => {
          base.output(`  ${idx + 1}. ${infoItem}`)
        })
        base.output('')
      }

      if (issues.length === 0 && warnings.length === 0) {
        base.output(base.colors.green('✅ ' + base.bundle.getText('noSecurityIssuesFound')))
        base.output('')
      }

      // Summary
      base.output(base.colors.bold(base.bundle.getText('scanSummary') + ':'))
      base.output(`  ${base.bundle.getText('criticalIssues', [issues.length])}`)
      base.output(`  ${base.bundle.getText('warnings', [warnings.length])}`)
      base.output(`  ${base.bundle.getText('informational', [info.length])}`)
      base.output('')

      if (autoFix && issues.length > 0) {
        base.output(base.colors.yellow(base.bundle.getText('autoFixNotImplemented')))
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
 * Scan for user-related security issues
 */
async function scanUsers(db, detailed, base) {
  const issues = []
  const warnings = []
  const info = []

  // Check for users without login attempts limit
  const noLockoutQuery = `
    SELECT USER_NAME
    FROM SYS.USERS
    WHERE USER_DEACTIVATED = 'FALSE'
  `
  const noLockoutUsers = await db.execSQL(noLockoutQuery)
  
  if (noLockoutUsers && noLockoutUsers.length > 0) {
    warnings.push(base.bundle.getText('usersWithoutLockout', [noLockoutUsers.length]))
  }

  // Check for inactive users
  const inactiveQuery = `
    SELECT USER_NAME, LAST_SUCCESSFUL_CONNECT
    FROM SYS.USERS
    WHERE USER_DEACTIVATED = 'FALSE'
      AND LAST_SUCCESSFUL_CONNECT < ADD_DAYS(CURRENT_TIMESTAMP, -90)
  `
  const inactiveUsers = await db.execSQL(inactiveQuery)
  
  if (inactiveUsers && inactiveUsers.length > 0) {
    info.push(base.bundle.getText('inactiveUsers', [inactiveUsers.length]))
  }

  return { issues, warnings, info }
}

/**
 * Scan for password-related security issues
 */
async function scanPasswords(db, detailed, base) {
  const issues = []
  const warnings = []
  const info = []

  // Check for deactivated users (potential security risk if they still have access)
  const deactivatedQuery = `
    SELECT COUNT(*) as "Count"
    FROM SYS.USERS
    WHERE USER_DEACTIVATED = 'TRUE'
  `
  const deactivated = await db.execSQL(deactivatedQuery)
  
  if (deactivated && deactivated[0] && deactivated[0].Count > 0) {
    warnings.push(base.bundle.getText('deactivatedUsersWithAccess', [deactivated[0].Count]))
  }

  // Check for total active users
  const activeQuery = `
    SELECT COUNT(*) as "Count"
    FROM SYS.USERS
    WHERE USER_DEACTIVATED = 'FALSE'
  `
  const activeUsers = await db.execSQL(activeQuery)
  
  if (activeUsers && activeUsers[0]) {
    info.push(base.bundle.getText('totalActiveUsers', [activeUsers[0].Count]))
  }

  return { issues, warnings, info }
}

/**
 * Scan for privilege-related security issues
 */
async function scanPrivileges(db, detailed, base) {
  const issues = []
  const warnings = []
  const info = []

  // Check for total system users
  const systemUsersQuery = `
    SELECT COUNT(*) as "Count"
    FROM SYS.USERS
    WHERE USER_DEACTIVATED = 'FALSE'
  `
  const systemUsers = await db.execSQL(systemUsersQuery)
  
  if (systemUsers && systemUsers[0]) {
    info.push(base.bundle.getText('systemUsers', [systemUsers[0].Count]))
  }

  // Check for users that have never logged in
  const neverLoggedInQuery = `
    SELECT COUNT(*) as "Count"
    FROM SYS.USERS
    WHERE LAST_SUCCESSFUL_CONNECT IS NULL
      AND USER_DEACTIVATED = 'FALSE'
  `
  const neverLoggedIn = await db.execSQL(neverLoggedInQuery)
  
  if (neverLoggedIn && neverLoggedIn[0] && neverLoggedIn[0].Count > 0) {
    warnings.push(base.bundle.getText('usersNeverLoggedIn', [neverLoggedIn[0].Count]))
  }

  return { issues, warnings, info }
}

/**
 * Scan for encryption-related security issues
 */
async function scanEncryption(db, detailed, base) {
  const issues = []
  const warnings = []
  const info = []

  // Check if encryption is enabled
  const encryptionQuery = `
    SELECT VALUE
    FROM SYS.M_INIFILE_CONTENTS
    WHERE FILE_NAME = 'global.ini'
      AND SECTION = 'persistence'
      AND KEY = 'encryption'
  `
  const encryption = await db.execSQL(encryptionQuery)
  
  if (!encryption || encryption.length === 0 || encryption[0].VALUE !== 'on') {
    issues.push(base.bundle.getText('dataEncryptionNotEnabled'))
  }

  // Check SSL configuration
  const sslQuery = `
    SELECT VALUE
    FROM SYS.M_INIFILE_CONTENTS
    WHERE FILE_NAME = 'global.ini'
      AND SECTION = 'communication'
      AND KEY = 'ssl'
  `
  const ssl = await db.execSQL(sslQuery)
  
  if (!ssl || ssl.length === 0 || ssl[0].VALUE !== 'on') {
    warnings.push(base.bundle.getText('sslNotEnforced'))
  }

  return { issues, warnings, info }
}

/**
 * Scan for audit-related security issues
 */
async function scanAudit(db, detailed, base) {
  const issues = []
  const warnings = []
  const info = []

  // Check if audit is enabled
  const auditQuery = `
    SELECT VALUE
    FROM SYS.M_INIFILE_CONTENTS
    WHERE FILE_NAME = 'global.ini'
      AND SECTION = 'auditing configuration'
      AND KEY = 'global_auditing_state'
  `
  const audit = await db.execSQL(auditQuery)
  
  if (!audit || audit.length === 0 || audit[0].VALUE !== 'true') {
    warnings.push(base.bundle.getText('auditingNotEnabled'))
  }

  // Check audit policy coverage
  const auditPolicyQuery = `
    SELECT COUNT(*) as "Count"
    FROM SYS.AUDIT_POLICIES
    WHERE IS_AUDIT_POLICY_ACTIVE = 'TRUE'
  `
  const auditPolicies = await db.execSQL(auditPolicyQuery)
  
  if (!auditPolicies || auditPolicies[0].Count === 0) {
    warnings.push(base.bundle.getText('noActiveAuditPolicies'))
  }

  return { issues, warnings, info }
}
