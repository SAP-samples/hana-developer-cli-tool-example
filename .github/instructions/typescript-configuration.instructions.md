---
description: "Use when creating or updating TypeScript configuration files. Enforces consistent compiler options, module resolution strategies, type generation from JavaScript sources, declaration file management, and dual-config patterns for mixed JS/TS projects. Ensures TypeScript integration supports both ESM and type safety while maintaining project structure."
applyTo: "tsconfig.json,**/tsconfig.json,**/tsconfig.*.json"
---

# TypeScript Configuration Guidelines

Use this guide when creating or modifying TypeScript configuration files (`tsconfig.json`) in the project.

## Scope and Purpose

This guide applies to TypeScript configuration in:

- Root `tsconfig.json` - Type generation from JavaScript sources
- `mcp-server/tsconfig.json` - TypeScript source compilation
- Subdirectory-specific TypeScript configs
- Build-specific TypeScript configs (e.g., `tsconfig.build.json`)

## Critical Principles

1. **Dual Config Strategy**: Root config for type generation, subproject configs for compilation
2. **ESM Compatibility**: Use Node16/NodeNext module resolution for ESM projects
3. **Strict Mode**: Enable strict type checking for maximum safety
4. **Declaration Files**: Generate `.d.ts` files for external consumption
5. **Source Maps**: Enable source maps for debugging compiled code
6. **Incremental Builds**: Use incremental compilation for faster rebuilds
7. **Path Mappings**: Configure path aliases for clean imports
8. **Type-Only Imports**: Use `"importsNotUsedAsValues": "error"` to enforce type-only imports

## Root Configuration Pattern (Type Generation from JS)

### Pattern: Generate Types from JavaScript Sources

This project uses JavaScript with JSDoc comments for the main CLI. TypeScript is configured to extract type definitions:

```json
{
  "compilerOptions": {
    // Enable type checking and declaration generation from JS
    "allowJs": true,                    // Process .js files
    "checkJs": true,                    // Type-check .js files
    "declaration": true,                // Generate .d.ts files
    "emitDeclarationOnly": true,        // ONLY generate declarations
    
    // Module system
    "module": "ESNext",                 // Use latest ECMAScript modules
    "moduleResolution": "node",         // Node.js style resolution
    "target": "ES2022",                 // Modern JavaScript features
    
    // Output configuration
    "outDir": "./types",                // Type declarations go here
    "rootDir": ".",                     // Source root
    
    // Type checking strictness
    "strict": false,                    // Lenient for JS sources
    "noImplicitAny": false,             // Allow implicit any in JS
    "strictNullChecks": false,          // No null checks for JS
    
    // Other options
    "esModuleInterop": true,            // CommonJS/ESM interop
    "skipLibCheck": true,               // Skip library type checks
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true           // Import JSON files
  },
  
  "include": [
    "bin/**/*.js",
    "routes/**/*.js",
    "utils/**/*.js",
    "index.js"
  ],
  
  "exclude": [
    "node_modules",
    "tests",
    "coverage",
    "types",
    "**/*.test.js",
    "**/*.Test.js"
  ]
}
```

### Usage: Type Generation Script

```json
{
  "scripts": {
    "types:generate": "tsc --project tsconfig.json",
    "types:watch": "tsc --project tsconfig.json --watch",
    "types:clean": "rimraf types"
  }
}
```

## MCP Server Configuration Pattern (TypeScript Source)

### Pattern: Compile TypeScript to JavaScript

The MCP server is written in TypeScript and compiled to JavaScript:

```json
{
  "compilerOptions": {
    // Language and environment
    "target": "ES2022",                 // Modern JavaScript target
    "lib": ["ES2022"],                  // Standard library
    "module": "Node16",                 // ESM with Node.js resolution
    "moduleResolution": "Node16",       // Match Node.js ESM behavior
    
    // Output configuration
    "outDir": "./dist",                 // Compiled JS output
    "rootDir": "./src",                 // TypeScript sources
    "declaration": true,                // Generate .d.ts
    "declarationMap": true,             // Map declarations to source
    "sourceMap": true,                  // Enable debugging
    
    // Strict type checking
    "strict": true,                     // All strict checks
    "noImplicitAny": true,              // Explicit types required
    "strictNullChecks": true,           // Null safety
    "strictFunctionTypes": true,        // Function signature checks
    "strictBindCallApply": true,        // Bind/call/apply checks
    "strictPropertyInitialization": true, // Class property init
    "noImplicitThis": true,             // Explicit 'this' typing
    "alwaysStrict": true,               // Use strict mode
    
    // Additional checks
    "noUnusedLocals": true,             // Error on unused variables
    "noUnusedParameters": true,         // Error on unused parameters
    "noImplicitReturns": true,          // All paths must return
    "noFallthroughCasesInSwitch": true, // Switch case fallthrough
    "noUncheckedIndexedAccess": true,   // Index access safety
    
    // Interop and compatibility
    "esModuleInterop": true,            // CommonJS interop
    "allowSyntheticDefaultImports": true, // Synthetic defaults
    "resolveJsonModule": true,          // Import JSON
    "isolatedModules": true,            // Per-file transpilation
    
    // Performance
    "incremental": true,                // Faster rebuilds
    "tsBuildInfoFile": "./dist/.tsbuildinfo",
    
    // Other
    "skipLibCheck": true,               // Skip lib checks
    "forceConsistentCasingInFileNames": true
  },
  
  "include": [
    "src/**/*"
  ],
  
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### Usage: TypeScript Compilation Scripts

```json
{
  "scripts": {
    "build": "tsc --project mcp-server/tsconfig.json",
    "build:watch": "tsc --project mcp-server/tsconfig.json --watch",
    "clean": "rimraf mcp-server/dist",
    "prebuild": "npm run clean"
  }
}
```

## Module Resolution Strategies

### Pattern: Node16/NodeNext for ESM Projects

```json
{
  "compilerOptions": {
    "module": "Node16",              // or "NodeNext"
    "moduleResolution": "Node16",    // or "NodeNext"
    
    // CRITICAL: All relative imports must include .js extension
    // Even though source files are .ts!
    // ✓ import { foo } from './bar.js'
    // ✗ import { foo } from './bar'
  }
}
```

**Important**: With `Node16`/`NodeNext`, you must:
- Include `.js` extension in imports, even for `.ts` files
- Use `type: "module"` in package.json
- Export package.json exports field

### Pattern: Classic Node Resolution for Legacy

```json
{
  "compilerOptions": {
    "module": "CommonJS",            // CJS output
    "moduleResolution": "node",      // Classic Node resolution
    
    // Can omit extensions in imports
    // ✓ import { foo } from './bar'
  }
}
```

## Path Mapping Configuration

### Pattern: Path Aliases for Clean Imports

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],              // Import with @/utils/helper
      "@utils/*": ["src/utils/*"],   // Import with @utils/helper
      "@types/*": ["src/types/*"],   // Import with @types/interfaces
      "@bin/*": ["bin/*"],           // Import with @bin/command
      "@routes/*": ["routes/*"]      // Import with @routes/api
    }
  }
}
```

**Note**: Path mapping requires runtime support:
- For Node.js: Use `tsx`, `ts-node` with `tsconfig-paths`, or custom loader
- For bundlers: Most support paths natively
- For production: Compile paths away or use runtime resolver

### Pattern: Monorepo Project References

```json
{
  "compilerOptions": {
    "composite": true,               // Enable project references
    "declaration": true,
    "declarationMap": true
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/utils" }
  ]
}
```

## Strict Mode Configuration

### Pattern: Gradual Strict Adoption

```json
{
  "compilerOptions": {
    // Start with these
    "strict": false,
    "noImplicitAny": true,           // Phase 1: Explicit any
    "strictNullChecks": true,        // Phase 2: Null safety
    
    // Then enable
    "strictFunctionTypes": true,     // Phase 3: Function checks
    "strictBindCallApply": true,     // Phase 4: Call checks
    "strictPropertyInitialization": true, // Phase 5: Class properties
    
    // Finally
    "strict": true                   // Enable all strict checks
  }
}
```

### Pattern: Maximum Strictness

```json
{
  "compilerOptions": {
    // All built-in strict checks
    "strict": true,
    
    // Additional strict checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "exactOptionalPropertyTypes": true,
    "useUnknownInCatchVariables": true
  }
}
```

## Declaration File Generation

### Pattern: Generate Type Declarations

```json
{
  "compilerOptions": {
    "declaration": true,             // Generate .d.ts files
    "declarationMap": true,          // Generate .d.ts.map files
    "emitDeclarationOnly": false,    // Also emit JavaScript
    "declarationDir": "./types"      // Alternative output location
  }
}
```

### Pattern: Types-Only Output

```json
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,     // ONLY generate .d.ts, no .js
    "outDir": "./types"
  }
}
```

## Source Maps Configuration

### Pattern: Development with Source Maps

```json
{
  "compilerOptions": {
    "sourceMap": true,               // Generate .js.map
    "inlineSourceMap": false,        // Separate map file
    "inlineSources": false,          // Don't embed sources
    "declarationMap": true           // Generate .d.ts.map
  }
}
```

### Pattern: Production without Source Maps

```json
{
  "compilerOptions": {
    "sourceMap": false,              // No source maps
    "removeComments": true,          // Strip comments
    "declaration": true              // Still generate types
  }
}
```

## Incremental Compilation

### Pattern: Enable Incremental Builds

```json
{
  "compilerOptions": {
    "incremental": true,             // Enable incremental compilation
    "tsBuildInfoFile": "./dist/.tsbuildinfo",  // Build info location
    "composite": false               // Not part of project references
  }
}
```

## Type Checking Configuration

### Pattern: Type Checking JavaScript

```json
{
  "compilerOptions": {
    "allowJs": true,                 // Process .js files
    "checkJs": true,                 // Type-check .js files
    "maxNodeModuleJsDepth": 1,       // Type-check deps too
    
    // Use JSDoc for types
    // @type, @param, @returns
  }
}
```

### Pattern: Skip Library Type Checks

```json
{
  "compilerOptions": {
    "skipLibCheck": true,            // Don't check .d.ts in node_modules
    "skipDefaultLibCheck": true      // Don't check default libs
  }
}
```

## Include/Exclude Patterns

### Pattern: Comprehensive Include/Exclude

```json
{
  "include": [
    "src/**/*",                      // All source files
    "bin/**/*.js",                   // CLI scripts
    "types/**/*.d.ts"                // Type declarations
  ],
  
  "exclude": [
    "node_modules",                  // Third-party code
    "dist",                          // Build output
    "coverage",                      // Test coverage
    "**/*.test.ts",                  // Test files
    "**/*.spec.ts",
    "**/*.test.js",
    "**/*.Test.js",
    "**/__tests__/**",               // Test directories
    "**/__mocks__/**",               // Mock directories
    "mochawesome-report"             // Test reports
  ]
}
```

## Environment-Specific Configurations

### Pattern: Development vs Production Configs

```json
// tsconfig.json (base)
{
  "compilerOptions": {
    // Shared options
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

// tsconfig.dev.json (development)
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": true,
    "noUnusedLocals": false,         // Lenient during dev
    "noUnusedParameters": false
  }
}

// tsconfig.build.json (production)
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": false,
    "removeComments": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "exclude": ["**/*.test.ts", "**/*.spec.ts"]
}
```

### Usage in Scripts

```json
{
  "scripts": {
    "dev": "tsc --watch --project tsconfig.dev.json",
    "build": "tsc --project tsconfig.build.json"
  }
}
```

## Library Target Configuration

### Pattern: Publish Types for Library

```json
{
  "compilerOptions": {
    "declaration": true,             // Generate .d.ts
    "declarationMap": true,          // Source mapping
    "outDir": "./dist",
    "rootDir": "./src"
  },
  
  // In package.json
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

## JSDoc in JavaScript Files

### Pattern: Type Annotations in JS

```javascript
/**
 * @param {string} name - User name
 * @param {number} age - User age
 * @returns {Promise<User>} User object
 */
async function createUser(name, age) {
  // Implementation
}

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {number} age
 */

/**
 * @type {import('./types').DatabaseClient}
 */
let dbClient;

/**
 * @template T
 * @param {T[]} items
 * @returns {T | undefined}
 */
function first(items) {
  return items[0];
}
```

## Cross-Platform Compatibility

### Pattern: Windows-Compatible Paths

```json
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true,  // Case-sensitive imports
    
    // Use forward slashes
    "outDir": "./dist",              // Not ".\\dist"
    "rootDir": "./src",              // Not ".\\src"
    
    "paths": {
      "@utils/*": ["src/utils/*"]    // Not ["src\\utils\\*"]
    }
  }
}
```

## Performance Optimization

### Pattern: Faster Type Checking

```json
{
  "compilerOptions": {
    "skipLibCheck": true,            // Skip lib checks
    "incremental": true,             // Incremental builds
    "isolatedModules": true,         // Per-file mode
    
    // Exclude unnecessary files
  },
  
  "exclude": [
    "node_modules",
    "**/*.test.ts",
    "coverage"
  ]
}
```

## Common Mistakes to Avoid

❌ **Using `module: "ESNext"` with `moduleResolution: "node"`** → Inconsistent resolution

❌ **Forgetting `.js` extension with Node16** → Module not found errors

❌ **`emitDeclarationOnly: true` without `declaration: true`** → No output

❌ **Not excluding test files** → Unnecessary compilation

❌ **Strict mode on JavaScript sources** → Too many errors

❌ **Path mappings without runtime support** → Production import errors

❌ **`checkJs: true` without `allowJs: true`** → Won't type-check JS

❌ **Mixing CJS and ESM output** → Module system conflicts

❌ **No `skipLibCheck` in large projects** → Slow compilation

❌ **Using deprecated options** → Future incompatibility

## Validation Checklist

Before committing TypeScript configuration:

- [ ] Module system matches package.json type
- [ ] Include/exclude patterns are correct
- [ ] Strict checks appropriate for codebase maturity
- [ ] Source maps configured for environment
- [ ] Declaration files generated if library
- [ ] Path mappings have runtime support
- [ ] Incremental compilation enabled
- [ ] Cross-platform path compatibility
- [ ] ESM imports use .js extensions (Node16/NodeNext)
- [ ] Configuration tested with `tsc --noEmit`

## Multiple TypeScript Configurations

### Pattern: Root + Subproject Configs

```
project/
├── tsconfig.json              # Type generation from JS
├── package.json               # "type": "module"
├── bin/                       # JavaScript CLI
├── routes/                    # JavaScript routes
├── utils/                     # JavaScript utilities
└── mcp-server/
    ├── tsconfig.json          # TypeScript compilation
    ├── package.json           # Subproject config
    └── src/                   # TypeScript sources
```

**Root tsconfig.json**: Type generation only
- `allowJs: true`, `checkJs: true`
- `emitDeclarationOnly: true`
- Include JS sources

**mcp-server/tsconfig.json**: Full TypeScript compilation
- `allowJs: false` (TS only)
- `strict: true` (full strictness)
- Compile to dist/

## Documentation Requirements

TypeScript configurations should include:
- Comment explaining config purpose (type gen vs compilation)
- Module resolution strategy reasoning
- Strict mode rationale
- Include/exclude pattern documentation
- Output directory structure
- Integration with build scripts

## Reference Examples in This Repository

- `tsconfig.json` - Root configuration for JS type generation
- `mcp-server/tsconfig.json` - MCP server TypeScript compilation
- `package.json` scripts - Type generation and build commands
- `.github/instructions/utility-module-development.instructions.md` - JSDoc patterns
