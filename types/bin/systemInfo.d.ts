/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export function handler(argv: object): void;
/**
 * Display system information in various formats
 * @param {object} prompts - Input prompts with output format selection
 * @returns {Promise<void>}
 */
export function sysInfo(prompts: object): Promise<void>;
/**
 * Output basic system information including HANA version and system overview
 * @returns {Promise<void>}
 */
export function basicOutput(): Promise<void>;
/**
 * Output environment connection configuration
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export function environmentOutput(prompts: object): Promise<void>;
/**
 * Output connection details in DBX-compatible format
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export function dbxOutput(prompts: object): Promise<void>;
export const command: "systemInfo";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
export namespace inputPrompts {
    namespace output {
        let description: string;
        let type: string;
        let required: boolean;
    }
}
