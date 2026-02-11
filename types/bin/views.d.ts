export function handler(argv: any): Promise<void>;
/**
 * Get list of views from database
 * @param {object} prompts - Input prompts with schema, view, and limit
 * @returns {Promise<Array>} - Array of view objects
 */
export function getViews(prompts: object): Promise<any[]>;
export const command: "views [schema] [view]";
export const aliases: string[];
export const describe: string;
export const builder: any;
