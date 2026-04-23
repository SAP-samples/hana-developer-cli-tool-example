import { COMMAND_METADATA_MAP } from './command-metadata.js';
/**
 * Converts a yargs builder object to JSON Schema format for MCP tool parameters
 */
export function yargsBuilderToJsonSchema(builder) {
    if (!builder || typeof builder !== 'object') {
        return {
            type: 'object',
            properties: {},
            required: []
        };
    }
    const properties = {};
    const required = [];
    for (const [key, value] of Object.entries(builder)) {
        if (!value || typeof value !== 'object')
            continue;
        const option = value;
        const property = {};
        // Map yargs types to JSON Schema types
        if (option.type === 'string') {
            property.type = 'string';
        }
        else if (option.type === 'number') {
            property.type = 'number';
        }
        else if (option.type === 'boolean') {
            property.type = 'boolean';
        }
        else if (option.type === 'array') {
            property.type = 'array';
            property.items = { type: 'string' };
        }
        else {
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
 * Creates a mock yargs instance that captures options passed via .options()
 * while supporting the full chaining API that builder functions expect.
 */
function createYargsMock() {
    const captured = {};
    const mock = new Proxy({}, {
        get(_target, prop) {
            if (prop === 'options' || prop === 'option') {
                return (opts) => {
                    if (opts && typeof opts === 'object') {
                        Object.assign(captured, opts);
                    }
                    return mock;
                };
            }
            if (prop === 'positional') {
                return (name, opts) => {
                    if (name && opts && typeof opts === 'object') {
                        captured[name] = opts;
                    }
                    return mock;
                };
            }
            return (..._args) => mock;
        }
    });
    return { mock, captured };
}
/**
 * Attempts to get the builder object from a command module
 * Handles both direct object builders and function-based builders
 */
function getBuilderObject(commandModule) {
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
        }
        catch (e) {
            // Builder failed even with mock — return empty
        }
    }
    return {};
}
export function extractCommandInfo(commandModule) {
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
//# sourceMappingURL=command-parser.js.map