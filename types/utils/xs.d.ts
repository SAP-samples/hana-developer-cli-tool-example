/**
 * Read central configuration file for XSA CLI
 * @returns {Promise<object>}
 */
export function getCFConfig(): Promise<object>;
/**
 * Get target organziation
 * @returns {Promise<object>}
 */
export function getCFOrg(): Promise<object>;
/**
 * Get target orgnaization name
 * @returns {Promise<string>}
 */
export function getCFOrgName(): Promise<string>;
/**
 * Get target orgnaization GUID
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
 * Get currrent targets
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
 * Get all service plans
 * @param {string} serviceGUID - service GUID
 * @returns {Promise<object>}
 */
export function getServicePlans(serviceGUID: string): Promise<object>;
/**
 * Get all services
 * @returns {Promise<object>}
 */
export function getServices(): Promise<object>;
/**
 * Get Service Plan GUID
 * @param {string} serviceGUID  - Service GUID
 * @param {string} servicePlan  - Service Plan Name
 * @returns {Promise<string>}
 */
export function getServicePlanGUID(serviceGUID: string, servicePlan: string): Promise<string>;
/**
 * Get Service GUID
 * @param {string} service - Service name
 * @returns {Promise<string>}
 */
export function getServiceGUID(service: string): Promise<string>;
/**
 * Get all HDI service instances
 * @returns {Promise<object>}
 */
export function getHDIInstances(): Promise<object>;
/**
 * Get all User Provided Service Instances
 * @returns {Promise<object>}
 */
export function getUpsInstances(): Promise<object>;
