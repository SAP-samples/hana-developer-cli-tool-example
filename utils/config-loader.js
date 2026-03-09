// @ts-check
/**
 * @module config-loader - Load hana-cli configuration from .hana-cli-config or hana-cli.config.js
 */

import fs from 'fs'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * Load configuration from .hana-cli-config or hana-cli.config.js
 * Checks current working directory first, then user home directory
 * @returns {Promise<Object>} Configuration object or empty object if not found
 */
export async function loadConfig() {
    const cwd = process.cwd()
    const homeDir = os.homedir()
    
    // Try .hana-cli-config (JSON) in current working directory first
    let configPath = path.join(cwd, '.hana-cli-config')
    if (fs.existsSync(configPath)) {
        try {
            const content = fs.readFileSync(configPath, 'utf-8')
            const config = JSON.parse(content)
            console.debug(`Loaded config from .hana-cli-config (${configPath})`)
            return config
        } catch (err) {
            console.warn(`Failed to parse .hana-cli-config: ${err.message}`)
        }
    }
    
    // Try hana-cli.config.js (JavaScript/CommonJS) in current working directory
    configPath = path.join(cwd, 'hana-cli.config.js')
    if (fs.existsSync(configPath)) {
        try {
            const config = await import(`file://${configPath}?t=${Date.now()}`)
            const configExport = config.default || config
            console.debug(`Loaded config from hana-cli.config.js (${configPath})`)
            return configExport
        } catch (err) {
            console.warn(`Failed to load hana-cli.config.js: ${err.message}`)
        }
    }
    
    // Try .hana-cli-config in home directory
    configPath = path.join(homeDir, '.hana-cli-config')
    if (fs.existsSync(configPath)) {
        try {
            const content = fs.readFileSync(configPath, 'utf-8')
            const config = JSON.parse(content)
            console.debug(`Loaded config from ~/.hana-cli-config (${configPath})`)
            return config
        } catch (err) {
            console.warn(`Failed to parse ~/.hana-cli-config: ${err.message}`)
        }
    }
    
    // Try hana-cli.config.js in home directory
    configPath = path.join(homeDir, 'hana-cli.config.js')
    if (fs.existsSync(configPath)) {
        try {
            const config = await import(`file://${configPath}?t=${Date.now()}`)
            const configExport = config.default || config
            console.debug(`Loaded config from ~/.hana-cli.config.js (${configPath})`)
            return configExport
        } catch (err) {
            console.warn(`Failed to load ~/.hana-cli.config.js: ${err.message}`)
        }
    }
    
    return {}
}

/**
 * Apply configuration to environment variables
 * Allows config to override or set environment variables
 * @param {Object} config Configuration object
 */
export function applyConfigToEnv(config) {
    if (!config) return
    
    // Map config keys to environment variables
    const envMapping = {
        HANA_HOST: 'host',
        HANA_PORT: 'port',
        HANA_USER: 'user',
        HANA_PASSWORD: 'password',
        HANA_DATABASE: 'database',
        HANA_LOG_LEVEL: 'logLevel',
        NODE_ENV: 'nodeEnv'
    }
    
    // Set environment variables from config if not already set
    for (const [envVar, configKey] of Object.entries(envMapping)) {
        if (config[configKey] && !process.env[envVar]) {
            process.env[envVar] = String(config[configKey])
        }
    }
    
    // Handle nested profiles - set HANA_PROFILE if default profile is specified
    if (config.defaultProfile && !process.env.HANA_PROFILE) {
        process.env.HANA_PROFILE = config.defaultProfile
    }
}

/**
 * Get configuration value, with support for nested keys (e.g., "profiles.development.host")
 * @param {Object} config Configuration object
 * @param {string} key Configuration key (supports dot notation for nested access)
 * @param {*} defaultValue Default value if key not found
 * @returns {*} Configuration value or default
 */
export function getConfigValue(config, key, defaultValue = undefined) {
    if (!config) return defaultValue
    
    const keys = key.split('.')
    let value = config
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k]
        } else {
            return defaultValue
        }
    }
    
    return value
}
