// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'auditLog'
export const aliases = ['audit', 'auditlog']
export const describe = baseLite.bundle.getText("auditLog")

const auditLogOptions = {
  limit: {
    alias: ['l'],
    type: 'number',
    default: 100,
    desc: baseLite.bundle.getText("limit")
  },
  user: {
    alias: ['u'],
    type: 'string',
    desc: baseLite.bundle.getText("auditUser")
  },
  action: {
    alias: ['a'],
    type: 'string',
    desc: baseLite.bundle.getText("auditAction")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    desc: baseLite.bundle.getText("auditSchema")
  },
  level: {
    alias: ['lvl'],
    type: 'string',
    choices: ['all', 'CRITICAL', 'ERROR', 'WARNING', 'INFO'],
    default: 'all',
    desc: baseLite.bundle.getText("auditLevel")
  },
  days: {
    alias: ['d'],
    type: 'number',
    default: 7,
    desc: baseLite.bundle.getText("auditDays")
  }
}

export const builder = (yargs) => yargs.options(baseLite.getBuilder(auditLogOptions)).wrap(160).example('hana-cli auditLog --days 7 --level ERROR', baseLite.bundle.getText("auditLogExample")).wrap(160).epilog(buildDocEpilogue('auditLog', 'security', ['systemInfo', 'securityScan']))

export const auditLogBuilderOptions = baseLite.getBuilder(auditLogOptions)

export let inputPrompts = {
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: true
  },
  days: {
    description: baseLite.bundle.getText("auditDays"),
    type: 'number',
    required: true
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, viewAuditLog, inputPrompts, true, true, auditLogBuilderOptions)
}

/**
 * View and filter audit trail entries
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function viewAuditLog(prompts) {
  const base = await import('../utils/base.js')
  base.debug('viewAuditLog')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      base.output('')
      base.output(base.colors.bold('Audit Configuration & Policies'))
      base.output('')

      // Check global auditing state
      const auditStateQuery = `
        SELECT KEY, VALUE
        FROM SYS.M_INIFILE_CONTENTS
        WHERE FILE_NAME = 'global.ini'
          AND SECTION = 'auditing'
        ORDER BY KEY
      `

      try {
        const auditState = await db.execSQL(auditStateQuery)
        if (auditState && auditState.length > 0) {
          base.output(base.colors.bold('Global Audit Settings:'))
          base.outputTableFancy(auditState.map(r => ({
            'Parameter': r.KEY,
            'Value': r.VALUE
          })))
          base.output('')
        }
      } catch (err) {
        base.output(base.colors.yellow('  Global audit settings not available'))
        base.output('')
      }

      // List audit policies
      try {
        const policiesQuery = `
          SELECT * FROM SYS.AUDIT_POLICIES
          ORDER BY POLICY_NAME
        `
        const policies = await db.execSQL(policiesQuery)
        
        if (policies && policies.length > 0) {
          base.output(base.colors.bold('Audit Policies:'))
          base.output(`Total: ${policies.length}`)
          base.outputTableFancy(policies.map(p => ({
            'Policy': p.POLICY_NAME || p.NAME,
            'Description': p.DESCRIPTION,
            'Created': p.CREATETIME || p.CREATED_AT || 'N/A'
          })))
          base.output('')
        } else {
          base.output(base.colors.yellow('No audit policies defined'))
          base.output('')
        }
      } catch (err) {
        base.output(base.colors.yellow('Audit policies not available'))
        base.output('')
      }

      // Audit configuration info
      base.output(base.colors.bold('Audit Information:'))
      base.output('  • Audit logging tracks database operations for security compliance')
      base.output('  • Note: M_AUDIT_LOG (actual audit entries) may require additional licensing')
      base.output('  • To enable auditing, configure audit policies and global audit settings')
      base.output('  • Current settings shown above from global.ini [auditing] section')

      await base.end()
    } catch (error) {
      await base.error(error)
    }
  } catch (error) {
    await base.error(error)
  }
}
