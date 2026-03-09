import cdsPlugin from '@sap/eslint-plugin-cds';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/dist/**',
      '**/build/**',
      '**/types/**',
      '**/mochawesome-report/**',
      '**/.nyc_output/**',
      '**/docs/.vitepress/cache/**'
    ]
  },
  cdsPlugin.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        // Mocha globals
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    rules: {}
  }
];
