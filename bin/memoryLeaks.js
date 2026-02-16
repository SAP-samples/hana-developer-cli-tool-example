// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'memoryLeaks'
export const aliases = ['memleak', 'ml']
export const describe = baseLite.bundle.getText("memoryLeaks")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  component: {
    alias: ['c'],
    type: 'string',
    default: null,
    desc: baseLite.bundle.getText("component")
  },
  threshold: {
    alias: ['t'],
    type: 'number',
    default: 10,
    desc: baseLite.bundle.getText("threshold")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 50,
    desc: baseLite.bundle.getText("limit")
  }
})).example('hana-cli memoryLeaks --threshold 25 --limit 100', baseLite.bundle.getText('memoryLeaksExample'))

export let inputPrompts = {
  component: {
    description: baseLite.bundle.getText("component"),
    type: 'string',
    required: false
  },
  threshold: {
    description: baseLite.bundle.getText("threshold"),
    type: 'number',
    required: false
  },
  limit: {
    description: baseLite.bundle.getText("limit"),
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
  base.promptHandler(argv, detectMemoryLeaks, inputPrompts)
}

/**
 * Detect potential memory leaks
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function detectMemoryLeaks(prompts) {
  const base = await import('../utils/base.js')
  base.debug('detectMemoryLeaks')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const limit = base.validateLimit(prompts.limit)
      const component = prompts.component || null
      const threshold = prompts.threshold || 10

      base.output('')
      base.output(base.colors.bold(base.bundle.getText('memoryLeaksHeader')))
      base.output(`${base.bundle.getText('thresholdPercent')}: ${threshold}%`)
      base.output('')

      // Check service memory usage
      base.output(base.colors.cyan('► ' + base.bundle.getText('checkingServiceMemory')))
      base.output('')

      let serviceQuery = `
        SELECT 
          HOST,
          PORT,
          SERVICE_NAME,
          ROUND(HEAP_MEMORY_ALLOCATED_SIZE / 1024 / 1024 / 1024, 2) AS "Heap Allocated (GB)",
          ROUND(HEAP_MEMORY_USED_SIZE / 1024 / 1024 / 1024, 2) AS "Heap Used (GB)",
          ROUND(HEAP_MEMORY_USED_SIZE / HEAP_MEMORY_ALLOCATED_SIZE * 100, 2) AS "Heap Usage %",
          ROUND(SHARED_MEMORY_ALLOCATED_SIZE / 1024 / 1024 / 1024, 2) AS "Shared Allocated (GB)",
          ROUND(SHARED_MEMORY_USED_SIZE / 1024 / 1024 / 1024, 2) AS "Shared Used (GB)"
        FROM SYS.M_SERVICE_MEMORY
        WHERE HEAP_MEMORY_ALLOCATED_SIZE > 0
        ORDER BY HEAP_MEMORY_USED_SIZE DESC
      `

      if (limit && base.sqlInjection.isAcceptableParameter(limit.toString())) {
        serviceQuery += ` LIMIT ${limit.toString()}`
      }

      const serviceResults = await db.execSQL(serviceQuery)
      let highMemoryServices = []

      if (!serviceResults || serviceResults.length === 0) {
        base.output(base.bundle.getText('noDataFound'))
      } else {
        base.outputTableFancy(serviceResults)
        base.output('')

        // Identify high memory usage
        highMemoryServices = serviceResults.filter(row => row['Heap Usage %'] > threshold)
        if (highMemoryServices.length > 0) {
          base.output(base.colors.yellow(`⚠ ${highMemoryServices.length} ${base.bundle.getText('servicesHighMemory')}`))
          highMemoryServices.forEach(service => {
            base.output(base.colors.yellow(`  • ${service.SERVICE_NAME}: ${service['Heap Usage %']}% ${base.bundle.getText('heapUsed')}`))
          })
          base.output('')
        }
      }

      // Check memory objects by component
      base.output(base.colors.cyan('► ' + base.bundle.getText('checkingMemoryObjects')))
      base.output('')

      let objectsQuery = `
        SELECT 
          CATEGORY,
          COMPONENT,
          COUNT(*) AS "Object Count",
          ROUND(SUM(EXCLUSIVE_SIZE_IN_USE) / 1024 / 1024, 2) AS "Total Size (MB)"
        FROM SYS.M_HEAP_MEMORY
      `

      if (component && base.sqlInjection.isAcceptableParameter(component)) {
        objectsQuery += ` WHERE COMPONENT LIKE '%${component}%'`
      }

      objectsQuery += `
        GROUP BY CATEGORY, COMPONENT
        ORDER BY SUM(EXCLUSIVE_SIZE_IN_USE) DESC
      `

      if (limit && base.sqlInjection.isAcceptableParameter(limit.toString())) {
        objectsQuery += ` LIMIT ${limit.toString()}`
      }

      const objectsResults = await db.execSQL(objectsQuery)

      if (!objectsResults || objectsResults.length === 0) {
        base.output(base.bundle.getText('noDataFound'))
      } else {
        base.outputTableFancy(objectsResults)
        base.output('')
      }

      // Summary and recommendations
      base.output(base.colors.bold(base.bundle.getText('memoryLeaksSummary')))
      base.output('')

      const suspiciousServices = serviceResults ? serviceResults.filter(row => row['Heap Usage %'] > 90) : []
      
      if (suspiciousServices.length > 0) {
        base.output(base.colors.red(`✗ ${base.bundle.getText('potentialMemoryLeaks')}`))
        base.output('')
        base.output(base.colors.bold(base.bundle.getText('recommendations')))
        base.output(base.colors.cyan('1. ' + base.bundle.getText('memoryRec1')))
        base.output(base.colors.cyan('2. ' + base.bundle.getText('memoryRec2')))
        base.output(base.colors.cyan('3. ' + base.bundle.getText('memoryRec3')))
        base.output(base.colors.cyan('4. ' + base.bundle.getText('memoryRec4')))
      } else if (highMemoryServices.length > 0) {
        base.output(base.colors.yellow(`⚠ ${base.bundle.getText('moderateMemoryUsage')}`))
        base.output('')
        base.output(base.colors.bold(base.bundle.getText('recommendations')))
        base.output(base.colors.cyan('1. ' + base.bundle.getText('memoryRec1')))
        base.output(base.colors.cyan('2. ' + base.bundle.getText('memoryRec2')))
      } else {
        base.output(base.colors.green('✓ ' + base.bundle.getText('noLeaksDetected')))
      }

      base.output('')
      await base.end()
    } catch (innerError) {
      if (innerError.message && innerError.message.includes('Could not find table')) {
        base.output(base.colors.yellow('⚠️  ' + base.bundle.getText('viewNotAccessible')))
      } else {
        throw innerError
      }
      await base.end()
    }
  } catch (error) {
    await base.error(error)
  }
}
