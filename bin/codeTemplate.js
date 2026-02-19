// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'codeTemplate'
export const aliases = ['template', 'codegen', 'scaffold', 'boilerplate']
export const describe = baseLite.bundle.getText("codeTemplate")

const codeTemplateOptions = {
  pattern: {
    alias: ['p'],
    type: 'string',
    choices: ["crud", "service", "repository", "mapper", "dto", "entity", "query", "test", "migration"],
    desc: baseLite.bundle.getText("codeTemplatePattern")
  },
  object: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("codeTemplateObject")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    desc: baseLite.bundle.getText("codeTemplateSchema")
  },
  language: {
    alias: ['l'],
    type: 'string',
    choices: ["javascript", "typescript", "java", "cds", "sql", "python"],
    default: "typescript",
    desc: baseLite.bundle.getText("codeTemplateLanguage")
  },
  output: {
    alias: ['f'],
    type: 'string',
    desc: baseLite.bundle.getText("codeTemplateOutput")
  },
  framework: {
    alias: ['fw'],
    type: 'string',
    choices: ["express", "spring", "nestjs", "cds", "none"],
    default: "none",
    desc: baseLite.bundle.getText("codeTemplateFramework")
  },
  comments: {
    alias: ['c'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("codeTemplateComments")
  },
  profile: {
    alias: ['pr'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
}

export const builder = (yargs) => yargs.options(baseLite.getBuilder(codeTemplateOptions)).example('hana-cli codeTemplate --pattern crud --object myTable', baseLite.bundle.getText("codeTemplateExample"))

export const codeTemplateBuilderOptions = baseLite.getBuilder(codeTemplateOptions)

export const inputPrompts = {
  pattern: {
    description: baseLite.bundle.getText("codeTemplatePattern"),
    type: 'string',
    required: true
  },
  object: {
    description: baseLite.bundle.getText("codeTemplateObject"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("codeTemplateSchema"),
    type: 'string',
    required: false,
    ask: () => false
  },
  language: {
    description: baseLite.bundle.getText("codeTemplateLanguage"),
    type: 'string',
    required: false,
    ask: () => false
  },
  output: {
    description: baseLite.bundle.getText("codeTemplateOutput"),
    type: 'string',
    required: false,
    ask: () => false
  },
  framework: {
    description: baseLite.bundle.getText("codeTemplateFramework"),
    type: 'string',
    required: false,
    ask: () => false
  },
  profile: {
    description: baseLite.bundle.getText("profile"),
    type: 'string',
    required: false,
    ask: () => { }
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, codeTemplateMain, inputPrompts, true, true, codeTemplateBuilderOptions)
}

/**
 * Generate boilerplate code for common patterns
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export async function codeTemplateMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('codeTemplateMain')

  try {
    base.setPrompts(prompts)

    // Connect to database for entity/table analysis
    let dbClient = null
    let schema = prompts.schema
    let tableColumns = null

    if (['crud', 'service', 'repository', 'mapper', 'dto', 'entity', 'test'].includes(prompts.pattern)) {
      dbClient = await dbClientClass.getNewClient(prompts)
      await dbClient.connect()

      const dbKind = (dbClient.getKind() || 'hana').toLowerCase()

      // Get schema if not provided
      if (!schema && dbKind !== 'sqlite') {
        schema = await getCurrentSchema(dbClient, dbKind)
      }

      // Get table structure
      tableColumns = await getTableStructure(dbClient, schema, prompts.object, dbKind)
    }



    // Generate code template
    let code = ''
    switch (prompts.pattern) {
      case 'crud':
        code = generateCRUDTemplate(prompts.object, prompts.language, tableColumns, prompts.comments)
        break
      case 'service':
        code = generateServiceTemplate(prompts.object, prompts.language, prompts.comments)
        break
      case 'repository':
        code = generateRepositoryTemplate(prompts.object, prompts.language, tableColumns || [], prompts.comments)
        break
      case 'mapper':
        code = generateMapperTemplate(prompts.object, prompts.language, tableColumns || [], prompts.comments)
        break
      case 'dto':
        code = generateDTOTemplate(prompts.object, prompts.language, tableColumns || [], prompts.comments)
        break
      case 'entity':
        code = generateEntityTemplate(prompts.object, prompts.language, tableColumns || [], prompts.comments)
        break
      case 'query':
        code = generateQueryTemplate(prompts.object, prompts.language, prompts.comments)
        break
      case 'test':
        code = generateTestTemplate(prompts.object, prompts.language, prompts.comments)
        break
      case 'migration':
        code = generateMigrationTemplate(prompts.object, prompts.language, prompts.comments)
        break
      default:
        throw new Error(`Unknown pattern: ${prompts.pattern}`)
    }

    // Output results
    if (prompts.output) {
      const fs = await import('fs')
      await fs.promises.writeFile(prompts.output, code, 'utf-8')
      console.log(baseLite.bundle.getText("success.templateWritten", [prompts.output]))
    } else {
      console.log(code)
    }

    if (dbClient) {
      await dbClient.disconnect()
    }

  } catch (error) {
    console.error(baseLite.bundle.getText("error.codeTemplate", [error.message]))
    process.exit(1)
  }
}

/**
 * Get current schema
 * @param {object} dbClient - Database client
 * @param {string} dbKind - Database kind
 * @returns {Promise<string>}
 */
async function getCurrentSchema(dbClient, dbKind) {
  if (dbKind === 'hana') {
    const result = await dbClient.execSQL('SELECT CURRENT_SCHEMA FROM DUMMY')
    return result?.[0]?.CURRENT_SCHEMA || 'PUBLIC'
  }
  return 'public'
}

/**
 * Get table structure
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array>}
 */
async function getTableStructure(dbClient, schema, table, dbKind) {
  const query = dbKind === 'hana'
    ? `SELECT COLUMN_NAME, DATA_TYPE_NAME, IS_NULLABLE FROM TABLE_COLUMNS WHERE SCHEMA_NAME = '${schema}' AND TABLE_NAME = '${table}'`
    : `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name = '${table}'`
  
  return await dbClient.execSQL(query)
}

/**
 * Convert column name to camelCase
 * @param {string} name - Column name
 * @returns {string}
 */
function toCamelCase(name) {
  return name.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

/**
 * Convert column name to PascalCase
 * @param {string} name - Column name
 * @returns {string}
 */
function toPascalCase(name) {
  return name.toLowerCase().replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/_/g, '')
}

/**
 * Map data types to language types
 * @param {string} dataType - SQL data type
 * @param {string} language - Target language
 * @returns {string}
 */
function mapDataType(dataType, language) {
  const upperType = (dataType || '').toUpperCase()
  
  if (language === 'java') {
    if (upperType.includes('INT')) return 'Integer'
    if (upperType.includes('VARCHAR') || upperType.includes('NVARCHAR')) return 'String'
    if (upperType.includes('DECIMAL') || upperType.includes('NUMERIC')) return 'BigDecimal'
    if (upperType.includes('DATE')) return 'LocalDate'
    if (upperType.includes('TIMESTAMP')) return 'LocalDateTime'
    if (upperType.includes('BOOLEAN')) return 'Boolean'
    return 'Object'
  }
  
  if (language === 'typescript' || language === 'javascript') {
    if (upperType.includes('INT')) return 'number'
    if (upperType.includes('VARCHAR') || upperType.includes('NVARCHAR')) return 'string'
    if (upperType.includes('DECIMAL') || upperType.includes('NUMERIC')) return 'number'
    if (upperType.includes('DATE') || upperType.includes('TIMESTAMP')) return 'Date'
    if (upperType.includes('BOOLEAN')) return 'boolean'
    return 'any'
  }
  
  return dataType
}

/**
 * Generate CRUD template
 * @param {string} entityName - Entity name
 * @param {string} language - Target language
 * @param {Array} columns - Table columns
 * @param {boolean} comments - Include comments
 * @returns {string}
 */
function generateCRUDTemplate(entityName, language, columns, comments) {
  const camelName = toCamelCase(entityName)
  const pascalName = toPascalCase(entityName)

  if (language === 'typescript') {
    let code = ''
    if (comments) {
      code += `/**\n * CRUD operations for ${entityName}\n * Auto-generated template\n */\n\n`
    }
    code += `export interface I${pascalName} {\n`
    if (columns) {
      for (const col of columns) {
        const colName = col.COLUMN_NAME || col.column_name
        const camelCol = toCamelCase(colName)
        const type = mapDataType(col.DATA_TYPE_NAME || col.data_type, language)
        code += `  ${camelCol}: ${type};\n`
      }
    }
    code += `}\n\n`
    code += `export class ${pascalName}Service {\n`
    code += `  async create(item: I${pascalName}): Promise<I${pascalName}> {\n`
    code += `    // TODO: Implement create\n`
    code += `    return item;\n`
    code += `  }\n\n`
    code += `  async read(id: any): Promise<I${pascalName} | null> {\n`
    code += `    // TODO: Implement read\n`
    code += `    return null;\n`
    code += `  }\n\n`
    code += `  async update(id: any, item: I${pascalName}): Promise<I${pascalName}> {\n`
    code += `    // TODO: Implement update\n`
    code += `    return item;\n`
    code += `  }\n\n`
    code += `  async delete(id: any): Promise<boolean> {\n`
    code += `    // TODO: Implement delete\n`
    code += `    return true;\n`
    code += `  }\n\n`
    code += `  async list(): Promise<I${pascalName}[]> {\n`
    code += `    // TODO: Implement list\n`
    code += `    return [];\n`
    code += `  }\n`
    code += `}\n`
    return code
  }

  // JavaScript version
  let code = ''
  if (comments) {
    code += `/**\n * CRUD operations for ${entityName}\n * Auto-generated template\n */\n\n`
  }
  code += `class ${pascalName}Service {\n`
  code += `  async create(item) {\n`
  code += `    // TODO: Implement create\n`
  code += `    return item;\n`
  code += `  }\n\n`
  code += `  async read(id) {\n`
  code += `    // TODO: Implement read\n`
  code += `    return null;\n`
  code += `  }\n\n`
  code += `  async update(id, item) {\n`
  code += `    // TODO: Implement update\n`
  code += `    return item;\n`
  code += `  }\n\n`
  code += `  async delete(id) {\n`
  code += `    // TODO: Implement delete\n`
  code += `    return true;\n`
  code += `  }\n\n`
  code += `  async list() {\n`
  code += `    // TODO: Implement list\n`
  code += `    return [];\n`
  code += `  }\n`
  code += `}\n\n`
  code += `module.exports = ${pascalName}Service;\n`
  return code
}

/**
 * Generate Service template
 * @param {string} entityName - Entity name
 * @param {string} language - Target language
 * @param {boolean} comments - Include comments
 * @returns {string}
 */
function generateServiceTemplate(entityName, language, comments) {
  const pascalName = toPascalCase(entityName)

  if (language === 'typescript') {
    let code = ''
    if (comments) {
      code += `/**\n * Business service for ${entityName}\n * Auto-generated template\n */\n\n`
    }
    code += `export class ${pascalName}Service {\n`
    code += `  constructor() { }\n\n`
    code += `  async process(data: any): Promise<any> {\n`
    code += `    // TODO: Implement business logic\n`
    code += `    return data;\n`
    code += `  }\n`
    code += `}\n`
    return code
  }

  let code = ''
  if (comments) {
    code += `/**\n * Business service for ${entityName}\n * Auto-generated template\n */\n\n`
  }
  code += `class ${pascalName}Service {\n`
  code += `  async process(data) {\n`
  code += `    // TODO: Implement business logic\n`
  code += `    return data;\n`
  code += `  }\n`
  code += `}\n\n`
  code += `module.exports = ${pascalName}Service;\n`
  return code
}

/**
 * Generate Repository template
 * @param {string} entityName - Entity name
 * @param {string} language - Target language
 * @param {Array} columns - Table columns
 * @param {boolean} comments - Include comments
 * @returns {string}
 */
function generateRepositoryTemplate(entityName, language, columns, comments) {
  const pascalName = toPascalCase(entityName)

  if (language === 'typescript') {
    let code = ''
    if (comments) {
      code += `/**\n * Repository for ${entityName}\n * Auto-generated template\n */\n\n`
    }
    code += `export class ${pascalName}Repository {\n`
    code += `  private table = '${entityName}';\n\n`
    code += `  async findAll(): Promise<any[]> {\n`
    code += `    // TODO: Implement query\n`
    code += `    return [];\n`
    code += `  }\n\n`
    code += `  async findById(id: any): Promise<any | null> {\n`
    code += `    // TODO: Implement query\n`
    code += `    return null;\n`
    code += `  }\n\n`
    code += `  async save(item: any): Promise<any> {\n`
    code += `    // TODO: Implement save\n`
    code += `    return item;\n`
    code += `  }\n\n`
    code += `  async delete(id: any): Promise<boolean> {\n`
    code += `    // TODO: Implement delete\n`
    code += `    return true;\n`
    code += `  }\n`
    code += `}\n`
    return code
  }

  let code = ''
  if (comments) {
    code += `/**\n * Repository for ${entityName}\n * Auto-generated template\n */\n\n`
  }
  code += `class ${pascalName}Repository {\n`
  code += `  constructor() {\n`
  code += `    this.table = '${entityName}';\n`
  code += `  }\n\n`
  code += `  async findAll() {\n`
  code += `    // TODO: Implement query\n`
  code += `    return [];\n`
  code += `  }\n\n`
  code += `  async findById(id) {\n`
  code += `    // TODO: Implement query\n`
  code += `    return null;\n`
  code += `  }\n\n`
  code += `  async save(item) {\n`
  code += `    // TODO: Implement save\n`
  code += `    return item;\n`
  code += `  }\n\n`
  code += `  async delete(id) {\n`
  code += `    // TODO: Implement delete\n`
  code += `    return true;\n`
  code += `  }\n`
  code += `}\n\n`
  code += `module.exports = ${pascalName}Repository;\n`
  return code
}

/**
 * Generate Mapper template
 * @param {string} entityName - Entity name
 * @param {string} language - Target language
 * @param {Array} columns - Table columns
 * @param {boolean} comments - Include comments
 * @returns {string}
 */
function generateMapperTemplate(entityName, language, columns, comments) {
  const pascalName = toPascalCase(entityName)

  if (language === 'typescript') {
    let code = ''
    if (comments) {
      code += `/**\n * Mapper for ${entityName}\n * Auto-generated template\n */\n\n`
    }
    code += `export class ${pascalName}Mapper {\n`
    code += `  static toDomain(raw: any): any {\n`
    code += `    // TODO: Map database record to domain object\n`
    code += `    return raw;\n`
    code += `  }\n\n`
    code += `  static toDatabase(domain: any): any {\n`
    code += `    // TODO: Map domain object to database record\n`
    code += `    return domain;\n`
    code += `  }\n\n`
    code += `  static toDTO(domain: any): any {\n`
    code += `    // TODO: Map domain object to DTO\n`
    code += `    return domain;\n`
    code += `  }\n`
    code += `}\n`
    return code
  }

  let code = ''
  if (comments) {
    code += `/**\n * Mapper for ${entityName}\n * Auto-generated template\n */\n\n`
  }
  code += `class ${pascalName}Mapper {\n`
  code += `  static toDomain(raw) {\n`
  code += `    // TODO: Map database record to domain object\n`
  code += `    return raw;\n`
  code += `  }\n\n`
  code += `  static toDatabase(domain) {\n`
  code += `    // TODO: Map domain object to database record\n`
  code += `    return domain;\n`
  code += `  }\n\n`
  code += `  static toDTO(domain) {\n`
  code += `    // TODO: Map domain object to DTO\n`
  code += `    return domain;\n`
  code += `  }\n`
  code += `}\n\n`
  code += `module.exports = ${pascalName}Mapper;\n`
  return code
}

/**
 * Generate DTO template
 * @param {string} entityName - Entity name
 * @param {string} language - Target language
 * @param {Array} columns - Table columns
 * @param {boolean} comments - Include comments
 * @returns {string}
 */
function generateDTOTemplate(entityName, language, columns, comments) {
  const pascalName = toPascalCase(entityName)

  if (language === 'typescript') {
    let code = ''
    if (comments) {
      code += `/**\n * Data Transfer Object for ${entityName}\n * Auto-generated template\n */\n\n`
    }
    code += `export class ${pascalName}DTO {\n`
    if (columns && columns.length > 0) {
      for (const col of columns) {
        const colName = col.COLUMN_NAME || col.column_name
        const camelCol = toCamelCase(colName)
        const type = mapDataType(col.DATA_TYPE_NAME || col.data_type, language)
        code += `  ${camelCol}: ${type};\n`
      }
    } else {
      code += `  // TODO: Add properties\n`
    }
    code += `}\n`
    return code
  }

  let code = ''
  if (comments) {
    code += `/**\n * Data Transfer Object for ${entityName}\n * Auto-generated template\n */\n\n`
  }
  code += `class ${pascalName}DTO {\n`
  code += `  constructor(data = {}) {\n`
  code += `    Object.assign(this, data);\n`
  code += `  }\n`
  code += `}\n\n`
  code += `module.exports = ${pascalName}DTO;\n`
  return code
}

/**
 * Generate Entity template
 * @param {string} entityName - Entity name
 * @param {string} language - Target language
 * @param {Array} columns - Table columns
 * @param {boolean} comments - Include comments
 * @returns {string}
 */
function generateEntityTemplate(entityName, language, columns, comments) {
  const pascalName = toPascalCase(entityName)

  if (language === 'typescript') {
    let code = ''
    if (comments) {
      code += `/**\n * Entity: ${entityName}\n * Auto-generated template\n */\n\n`
    }
    code += `export interface I${pascalName}Entity {\n`
    if (columns && columns.length > 0) {
      for (const col of columns) {
        const colName = col.COLUMN_NAME || col.column_name
        const camelCol = toCamelCase(colName)
        const type = mapDataType(col.DATA_TYPE_NAME || col.data_type, language)
        const nullable = (col.IS_NULLABLE === 'Y' || col.is_nullable === 'YES') ? '?' : ''
        code += `  ${camelCol}${nullable}: ${type};\n`
      }
    }
    code += `}\n`
    return code
  }

  let code = ''
  if (comments) {
    code += `/**\n * Entity: ${entityName}\n * Auto-generated template\n */\n\n`
  }
  code += `class ${pascalName}Entity {\n`
  code += `  constructor(data = {}) {\n`
  code += `    Object.assign(this, data);\n`
  code += `  }\n`
  code += `}\n\n`
  code += `module.exports = ${pascalName}Entity;\n`
  return code
}

/**
 * Generate Query template
 * @param {string} entityName - Entity name
 * @param {string} language - Target language
 * @param {boolean} comments - Include comments
 * @returns {string}
 */
function generateQueryTemplate(entityName, language, comments) {
  if (language === 'sql') {
    let code = ''
    if (comments) {
      code += `-- Queries for ${entityName}\n-- Auto-generated template\n\n`
    }
    code += `-- Select all\n`
    code += `SELECT * FROM ${entityName};\n\n`
    code += `-- Select by ID\n`
    code += `SELECT * FROM ${entityName} WHERE ID = ?;\n\n`
    code += `-- Insert\n`
    code += `INSERT INTO ${entityName} () VALUES ();\n\n`
    code += `-- Update\n`
    code += `UPDATE ${entityName} SET WHERE ID = ?;\n\n`
    code += `-- Delete\n`
    code += `DELETE FROM ${entityName} WHERE ID = ?;\n`
    return code
  }

  let code = ''
  if (comments) {
    code += `/**\n * Queries for ${entityName}\n * Auto-generated template\n */\n\n`
  }
  code += `const queries = {\n`
  code += `  findAll: \`SELECT * FROM ${entityName}\`,\n`
  code += `  findById: \`SELECT * FROM ${entityName} WHERE ID = ?\`,\n`
  code += `  insert: \`INSERT INTO ${entityName} () VALUES ()\`,\n`
  code += `  update: \`UPDATE ${entityName} SET WHERE ID = ?\`,\n`
  code += `  delete: \`DELETE FROM ${entityName} WHERE ID = ?\`\n`
  code += `};\n\n`
  code += `module.exports = queries;\n`
  return code
}

/**
 * Generate Test template
 * @param {string} entityName - Entity name
 * @param {string} language - Target language
 * @param {boolean} comments - Include comments
 * @returns {string}
 */
function generateTestTemplate(entityName, language, comments) {
  const pascalName = toPascalCase(entityName)

  if (language === 'typescript') {
    let code = ''
    if (comments) {
      code += `/**\n * Test suite for ${entityName}\n * Auto-generated template\n */\n\n`
    }
    code += `import { describe, it, expect } from '@jest/globals';\n`
    code += `import ${pascalName}Service from './${pascalName}.service';\n\n`
    code += `describe('${pascalName}Service', () => {\n`
    code += `  let service: ${pascalName}Service;\n\n`
    code += `  beforeEach(() => {\n`
    code += `    service = new ${pascalName}Service();\n`
    code += `  });\n\n`
    code += `  it('should create', () => {\n`
    code += `    expect(service).toBeDefined();\n`
    code += `  });\n\n`
    code += `  it('should process data', async () => {\n`
    code += `    const result = await service.process({});\n`
    code += `    expect(result).toBeDefined();\n`
    code += `  });\n`
    code += `});\n`
    return code
  }

  let code = ''
  if (comments) {
    code += `/**\n * Test suite for ${entityName}\n * Auto-generated template\n */\n\n`
  }
  code += `const { describe, it, expect } = require('@jest/globals');\n`
  code += `const ${pascalName}Service = require('./${pascalName}.service');\n\n`
  code += `describe('${pascalName}Service', () => {\n`
  code += `  let service;\n\n`
  code += `  beforeEach(() => {\n`
  code += `    service = new ${pascalName}Service();\n`
  code += `  });\n\n`
  code += `  it('should create', () => {\n`
  code += `    expect(service).toBeDefined();\n`
  code += `  });\n\n`
  code += `  it('should process data', async () => {\n`
  code += `    const result = await service.process({});\n`
  code += `    expect(result).toBeDefined();\n`
  code += `  });\n`
  code += `});\n`
  return code
}

/**
 * Generate Migration template
 * @param {string} entityName - Entity name
 * @param {string} language - Target language
 * @param {boolean} comments - Include comments
 * @returns {string}
 */
function generateMigrationTemplate(entityName, language, comments) {
  if (language === 'sql') {
    let code = ''
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('T')[0]
    if (comments) {
      code += `-- Migration: Create ${entityName}\n-- Generated: ${new Date().toISOString()}\n\n`
    }
    code += `CREATE TABLE ${entityName} (\n`
    code += `  ID BIGINT PRIMARY KEY AUTO_INCREMENT,\n`
    code += `  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`
    code += `  UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`
    code += `  -- TODO: Add columns\n`
    code += `);\n\n`
    code += `CREATE INDEX idx_${entityName}_created ON ${entityName}(CREATED_AT);\n`
    return code
  }

  let code = ''
  const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('T')[0]
  if (comments) {
    code += `/**\n * Migration: Create ${entityName}\n * Generated: ${new Date().toISOString()}\n */\n\n`
  }
  code += `module.exports = {\n`
  code += `  up: async (connection) => {\n`
  code += `    // TODO: Implement migration up\n`
  code += `  },\n\n`
  code += `  down: async (connection) => {\n`
  code += `    // TODO: Implement migration down\n`
  code += `  }\n`
  code += `};\n`
  return code
}

export default { command, aliases, describe, builder, handler }
