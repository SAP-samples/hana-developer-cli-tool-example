import { COMMAND_METADATA_MAP } from './command-metadata.js';

/**
 * JSON Schema type for MCP tool parameters
 */
export interface JSONSchema {
  type?: string;
  properties?: Record<string, any>;
  required?: string[];
  items?: any;
  enum?: any[];
  default?: any;
  description?: string;
}

/**
 * Converts a yargs builder object to JSON Schema format for MCP tool parameters
 */
export function yargsBuilderToJsonSchema(builder: any): JSONSchema {
  if (!builder || typeof builder !== 'object') {
    return {
      type: 'object',
      properties: {},
      required: []
    };
  }

  const properties: Record<string, JSONSchema> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(builder)) {
    if (!value || typeof value !== 'object') continue;

    const option = value as any;
    const property: JSONSchema = {};

    // Map yargs types to JSON Schema types
    if (option.type === 'string') {
      property.type = 'string';
    } else if (option.type === 'number') {
      property.type = 'number';
    } else if (option.type === 'boolean') {
      property.type = 'boolean';
    } else if (option.type === 'array') {
      property.type = 'array';
      property.items = { type: 'string' };
    } else {
      // Default to string if type not specified
      property.type = 'string';
    }

    // Add description if available
    if (option.describe || option.description) {
      property.description = option.describe || option.description;
    }

    // Add default value if available
    if (option.default !== undefined) {
      property.default = option.default;
    }

    // Add enum/choices if available
    if (option.choices && Array.isArray(option.choices)) {
      property.enum = option.choices;
    }

    properties[key] = property;

    // Mark as required if demandOption is true
    if (option.demandOption === true || option.required === true) {
      required.push(key);
    }
  }

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined
  };
}

/**
 * Extracts command information from a yargs command module
 */
export interface CommandInfo {
  name: string;
  aliases?: string[];
  description: string;
  category?: string;
  tags?: string[];
  useCases?: string[];
  relatedCommands?: string[];
  schema: JSONSchema;
}

/**
 * Creates a mock yargs instance that captures options passed via .options()
 * while supporting the full chaining API that builder functions expect.
 */
function createYargsMock(): { mock: any; captured: Record<string, any> } {
  const captured: Record<string, any> = {};

  const mock: any = new Proxy({}, {
    get(_target, prop) {
      if (prop === 'options' || prop === 'option') {
        return (opts: any) => {
          if (opts && typeof opts === 'object') {
            Object.assign(captured, opts);
          }
          return mock;
        };
      }
      if (prop === 'positional') {
        return (name: string, opts: any) => {
          if (name && opts && typeof opts === 'object') {
            captured[name] = opts;
          }
          return mock;
        };
      }
      return (..._args: any[]) => mock;
    }
  });

  return { mock, captured };
}

/**
 * Attempts to get the builder object from a command module
 * Handles both direct object builders and function-based builders
 */
function getBuilderObject(commandModule: any): any {
  if (!commandModule.builder) {
    return {};
  }

  if (typeof commandModule.builder === 'object' && typeof commandModule.builder !== 'function') {
    return commandModule.builder;
  }

  if (typeof commandModule.builder === 'function') {
    try {
      const { mock, captured } = createYargsMock();
      commandModule.builder(mock);
      return captured;
    } catch (e) {
      // Builder failed even with mock — return empty
    }
  }

  return {};
}

export function extractCommandInfo(commandModule: any): CommandInfo {
  const name = typeof commandModule.command === 'string' 
    ? commandModule.command.split(' ')[0] 
    : 'unknown';
  
  const aliases = Array.isArray(commandModule.aliases) 
    ? commandModule.aliases 
    : [];
  
  const description = commandModule.describe || commandModule.description || `Execute ${name} command`;
  
  // Get builder object, handling both direct objects and functions
  const builderObject = getBuilderObject(commandModule);
  const schema = yargsBuilderToJsonSchema(builderObject);

  // Get metadata if available
  const metadata = COMMAND_METADATA_MAP[name];

  return {
    name,
    aliases,
    description,
    category: metadata?.category,
    tags: metadata?.tags,
    useCases: metadata?.useCases,
    relatedCommands: metadata?.relatedCommands,
    schema
  };
}