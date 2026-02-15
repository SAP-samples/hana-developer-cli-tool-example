// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'kafkaConnect [action]'
export const aliases = ['kafka', 'kafkaAdapter', 'kafkasub']
export const describe = baseLite.bundle.getText("kafkaConnect")

export const builder = baseLite.getBuilder({
  action: {
    alias: ['a', 'Action'],
    type: 'string',
    default: 'list',
    choices: ['list', 'create', 'delete', 'status', 'test', 'info'],
    desc: baseLite.bundle.getText("action")
  },
  name: {
    alias: ['n', 'Name'],
    type: 'string',
    desc: baseLite.bundle.getText("connectorName")
  },
  brokers: {
    alias: ['b', 'Brokers'],
    type: 'string',
    desc: baseLite.bundle.getText("kafkaBrokers")
  },
  topic: {
    alias: ['t', 'Topic'],
    type: 'string',
    desc: baseLite.bundle.getText("kafkaTopic")
  },
  config: {
    alias: ['c', 'Config'],
    type: 'string',
    desc: baseLite.bundle.getText("configPath")
  }
})

export let inputPrompts = {
  action: {
    description: baseLite.bundle.getText("action"),
    type: 'string',
    required: true
  },
  name: {
    description: baseLite.bundle.getText("connectorName"),
    type: 'string',
    required: false
  },
  brokers: {
    description: baseLite.bundle.getText("kafkaBrokers"),
    type: 'string',
    required: false
  },
  topic: {
    description: baseLite.bundle.getText("kafkaTopic"),
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
  base.promptHandler(argv, manageKafkaConnectors, inputPrompts)
}

/**
 * Manage Kafka connector configurations
 * @param {object} prompts - Input prompts with action and configuration
 * @returns {Promise<void>}
 */
export async function manageKafkaConnectors(prompts) {
  const base = await import('../utils/base.js')
  base.debug('manageKafkaConnectors')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    switch (prompts.action.toLowerCase()) {
      case 'list':
        await listKafkaConnectors(db)
        break
      case 'create':
        await createKafkaConnector(db, prompts)
        break
      case 'delete':
        if (!prompts.name) {
          throw new Error(base.bundle.getText("connectorNameRequired"))
        }
        await deleteKafkaConnector(db, prompts.name)
        break
      case 'status':
        await getKafkaConnectorStatus(db, prompts.name)
        break
      case 'test':
        if (!prompts.name) {
          throw new Error(base.bundle.getText("connectorNameRequired"))
        }
        await testKafkaConnector(db, prompts.name)
        break
      case 'info':
        if (!prompts.name) {
          throw new Error(base.bundle.getText("connectorNameRequired"))
        }
        await getKafkaConnectorInfo(db, prompts.name)
        break
      default:
        throw new Error(base.bundle.getText("invalidAction"))
    }
    
    base.end()
  } catch (error) {
    base.error(error)
  }
}

/**
 * List all Kafka connectors
 * @param {object} db - Database connection
 * @returns {Promise<void>}
 */
async function listKafkaConnectors(db) {
  const base = await import('../utils/base.js')
  
  const query = `
SELECT 
  KAFKA_CONNECTOR_ID,
  CONNECTOR_NAME,
  STATUS,
  BROKERS,
  TOPIC,
  CREATION_TIME,
  LAST_MODIFIED_TIME
FROM SYS.KAFKA_CONNECTORS
ORDER BY CONNECTOR_NAME`

  const results = await db.statementExecPromisified(await db.preparePromisified(query), [])
  
  if (results && results.length > 0) {
    base.outputTableFancy(results)
  } else {
    console.log(base.bundle.getText("noConnectorsFound"))
  }
}

/**
 * Create a new Kafka connector
 * @param {object} db - Database connection
 * @param {object} prompts - Configuration prompts
 * @returns {Promise<void>}
 */
async function createKafkaConnector(db, prompts) {
  const base = await import('../utils/base.js')
  
  if (!prompts.name || !prompts.brokers || !prompts.topic) {
    throw new Error(base.bundle.getText("requiredParametersForCreate"))
  }
  
  const query = `
INSERT INTO SYS.KAFKA_CONNECTORS 
  (CONNECTOR_NAME, BROKERS, TOPIC, STATUS, CREATION_TIME)
VALUES (?, ?, ?, 'CREATED', CURRENT_TIMESTAMP)`

  await db.statementExecPromisified(
    await db.preparePromisified(query), 
    [prompts.name, prompts.brokers, prompts.topic]
  )
  
  console.log(base.bundle.getText("connectorCreated", [prompts.name]))
}

/**
 * Delete a Kafka connector
 * @param {object} db - Database connection
 * @param {string} name - Connector name
 * @returns {Promise<void>}
 */
async function deleteKafkaConnector(db, name) {
  const base = await import('../utils/base.js')
  
  const query = `DELETE FROM SYS.KAFKA_CONNECTORS WHERE CONNECTOR_NAME = ?`
  await db.statementExecPromisified(await db.preparePromisified(query), [name])
  
  console.log(base.bundle.getText("connectorDeleted", [name]))
}

/**
 * Get status of Kafka connectors
 * @param {object} db - Database connection
 * @param {string} name - Connector name (optional)
 * @returns {Promise<void>}
 */
async function getKafkaConnectorStatus(db, name) {
  const base = await import('../utils/base.js')
  
  let query = `
SELECT 
  CONNECTOR_NAME,
  STATUS,
  LAST_ERROR,
  MESSAGE_COUNT,
  ERROR_COUNT,
  LAST_ACTIVITY_TIME
FROM SYS.KAFKA_CONNECTOR_STATUS
WHERE 1=1`

  const params = []
  if (name) {
    query += ` AND CONNECTOR_NAME = ?`
    params.push(name)
  }
  
  query += ` ORDER BY CONNECTOR_NAME`

  const results = await db.statementExecPromisified(await db.preparePromisified(query), params)
  base.outputTableFancy(results)
}

/**
 * Test a Kafka connector
 * @param {object} db - Database connection
 * @param {string} name - Connector name
 * @returns {Promise<void>}
 */
async function testKafkaConnector(db, name) {
  const base = await import('../utils/base.js')
  
  const query = `CALL SYS.TEST_KAFKA_CONNECTOR(?)`
  const result = await db.statementExecPromisified(
    await db.preparePromisified(query), 
    [name]
  )
  
  if (result && result.length > 0) {
    base.outputTableFancy(result)
  } else {
    console.log(base.bundle.getText("connectorTestPassed"))
  }
}

/**
 * Get detailed information about a Kafka connector
 * @param {object} db - Database connection
 * @param {string} name - Connector name
 * @returns {Promise<void>}
 */
async function getKafkaConnectorInfo(db, name) {
  const base = await import('../utils/base.js')
  
  const query = `
SELECT 
  KAFKA_CONNECTOR_ID,
  CONNECTOR_NAME,
  STATUS,
  BROKERS,
  TOPIC,
  SCHEMA_NAME,
  TABLE_NAME,
  COLUMN_MAPPING,
  CREATION_TIME,
  LAST_MODIFIED_TIME,
  COMMENTS
FROM SYS.KAFKA_CONNECTORS
WHERE CONNECTOR_NAME = ?`

  const results = await db.statementExecPromisified(await db.preparePromisified(query), [name])
  base.outputTableFancy(results)
}
