/**
 * Get cf cli version
 * @returns {Promise<String>}
 */
export function getVersion(): Promise<string>;
/**
 * Read central configuration file for CF CLI
 * @returns {Promise<object>}
 */
export function getCFConfig(): Promise<object>;
/**
 * Clear CF config cache (useful for testing or forced refresh)
 * @returns {void}
 */
export function clearCFConfigCache(): void;
/**
 * Get target organization
 * @returns {Promise<object>}
 */
export function getCFOrg(): Promise<object>;
/**
 * Get target organization name
 * @returns {Promise<string>}
 */
export function getCFOrgName(): Promise<string>;
/**
 * Get target organization GUID
 * @returns {Promise<string>}
 */
export function getCFOrgGUID(): Promise<string>;
/**
 * Get target space details
 * @returns {Promise<object>}
 */
export function getCFSpace(): Promise<object>;
/**
 * Get target space name
 * @returns {Promise<string>}
 */
export function getCFSpaceName(): Promise<string>;
/**
 * Get target space GUID
 * @returns {Promise<string>}
 */
export function getCFSpaceGUID(): Promise<string>;
/**
 * Get current targets
 * @returns {Promise<object>}
 */
export function getCFTarget(): Promise<object>;
/**
 * Get all instances of service plan hana
 * @returns {Promise<object>}
 */
export function getHANAInstances(): Promise<object>;
/**
 * Get instances of service plan hana that match input name
 * @param {string} name - service instance name
 * @returns {Promise<object>}
 */
export function getHANAInstanceByName(name: string): Promise<object>;
/**
 * Get status of hana instance
 * @param {string} hanaInstanceGUID - HANA Service instance GUID
 * @returns {Promise<string>}
 */
export function getHANAInstanceStatus(hanaInstanceGUID: string): Promise<string>;
/**
 * Get all HDI service instances
 * @returns {Promise<object>}
 */
export function getHDIInstances(): Promise<object>;
/**
 * Get all SBSS service instances
 * @returns {Promise<object>}
 */
export function getSbssInstances(): Promise<object>;
/**
 * Get all SecureStore service instances
 * @returns {Promise<object>}
 */
export function getSecureStoreInstances(): Promise<object>;
/**
 * Get all Schema service instances
 * @returns {Promise<object>}
 */
export function getSchemaInstances(): Promise<object>;
/**
 * Get all User Provided Service Instances
 * @returns {Promise<object>}
 */
export function getUpsInstances(): Promise<object>;
/**
 * Start HANA Cloud Instance
 * @param {string} name - HANA Cloud instance name
 * @returns {Promise<string>}
 */
export function startHana(name: string): Promise<string>;
/**
 * Stop HANA Cloud Instance
 * @param {string} name - HANA Cloud instance name
 * @returns {Promise<string>}
 */
export function stopHana(name: string): Promise<string>;
/**
 * Get Cloud Foundry service instance parameters
 * @param {string} serviceInstanceGUID - Service instance GUID
 * @returns {Promise<object>}
 */
export function getCFServiceInstanceParameters(serviceInstanceGUID: string): Promise<object>;
