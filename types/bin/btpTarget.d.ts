/**
 * Get BTP hierarchy data for UI
 * @returns {Promise<object>}
 */
export function getBTPTargetUI(): Promise<object>;
/**
 * Handler function for setting BTP target from UI
 * @param {object} argv - Command line arguments
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
export const command: "btpTarget";
export const aliases: string[];
export const describe: string;
export const builder: any;
