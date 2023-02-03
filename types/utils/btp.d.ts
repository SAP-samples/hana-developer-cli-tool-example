/**
 * Get btp CLI version
 * @returns {Promise<String>}
 */
export function getVersion(): Promise<string>;
/**
 * Read central configuration file for BTP CLI
 * @returns {Promise<object>}
 */
export function getBTPConfig(): Promise<object>;
/**
 * Get current targets
 * @returns {Promise<object>}
 */
export function getBTPTarget(): Promise<object>;
/**
 * Get target Global Account
 * @returns {Promise<object>}
 */
export function getBTPGlobalAccount(): Promise<object>;
/**
 * Get target Sub-Account
 * @returns {Promise<string>}
 */
export function getBTPSubAccount(): Promise<string>;
/**
 * Get all Subscriptions
 * @returns {Promise<object>}
 */
export function getBTPSubscriptions(): Promise<object>;
/**
 * Get HANA Cloud Tools Subscription
 * @returns {Promise<object>}
 */
export function getHANACloudSub(): Promise<object>;
/**
 * Get HANA Cloud Tools Subscription URL
 * @returns {Promise<string>}
 */
export function getHANACloudSubURL(): Promise<string>;
/**
 * Get Business Application Studio Subscription
 * @returns {Promise<object>}
 */
export function getBASSub(): Promise<object>;
/**
 * Get HANA Cloud Tools Subscription URL
 * @returns {Promise<string>}
 */
export function getBASSubURL(): Promise<string>;
/**
 * Get Global Account Hierarchy
 * @returns {Promise<object>}
 */
export function getBTPHierarchy(): Promise<object>;
/**
 * Get all Sub-Accounts
 * @returns {Promise<object>}
 */
export function getBTPSubAccounts(): Promise<object>;
/**
 * Get all Subscriptions
 * @returns {Promise<object>}
 */
export function getBTPPlans(): Promise<object>;
/**
 * Get HANA Plan
 * @returns {Promise<object>}
 */
export function getHANAPlan(): Promise<object>;
/**
 * Get all Service Instances
 * @returns {Promise<object>}
 */
export function getBTPServiceInstances(): Promise<object>;
/**
 * Get Service Instance Details
 * @param {string} id - service instance id
 * @returns {Promise<object>}
 */
export function getBTPServiceInstanceDetails(id: string): Promise<object>;
/**
 * Set Target Subaccount
 * @param {string} subAccount - BTP Subaccount
 * @returns {Promise<object>}
 */
export function setBTPSubAccount(subAccount: string): Promise<object>;
/**
 * Get all Service Instances Parameters
 * @param {string} id - service instance id
 * @returns {Promise<object>}
 */
export function getBTPServiceInstanceParameters(id: string): Promise<object>;
/**
 * Get HANA Cloud Service Instance(s)
 * @returns {Promise<object>}
 */
export function getHANAServiceInstances(): Promise<object>;
/**
 * Get status of hana instance
 * @param {object} serviceParameters - HANA Service instance Parameters
 * @returns {Promise<string>}
 */
export function getHANAInstanceStatus(serviceParameters: object): Promise<string>;
/**
 * Get instances of service plan hana that match input name
 * @param {string} name - service instance name
 * @returns {Promise<object>}
 */
export function getHANAInstanceByName(name: string): Promise<object>;
/**
 * Start HANA Cloud Instance
 * @param {string} name - HANA Cloud instance name
 * @returns any
 */
export function startHana(name: string): Promise<string>;
/**
 * Stop HANA Cloud Instance
 * @param {string} name - HANA Cloud instance name
 * @returns any
 */
export function stopHana(name: string): Promise<string>;
