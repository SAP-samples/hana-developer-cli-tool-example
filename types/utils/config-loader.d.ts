/**
 * Load configuration from .hana-cli-config or hana-cli.config.js
 * Checks current working directory first, then user home directory
 * @returns {Promise<Object>} Configuration object or empty object if not found
 */
export function loadConfig(): Promise<Object>;
/**
 * Apply configuration to environment variables
 * Allows config to override or set environment variables
 * @param {Object} config Configuration object
 */
export function applyConfigToEnv(config: Object): void;
/**
 * Get configuration value, with support for nested keys (e.g., "profiles.development.host")
 * @param {Object} config Configuration object
 * @param {string} key Configuration key (supports dot notation for nested access)
 * @param {*} defaultValue Default value if key not found
 * @returns {*} Configuration value or default
 */
export function getConfigValue(config: Object, key: string, defaultValue?: any): any;
