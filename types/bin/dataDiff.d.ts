/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export function handler(argv: object): Promise<void>;
/**
 * Show differences between two datasets
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export function dataDiffMain(prompts: object): Promise<void>;
export const command: "dataDiff";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export const inputPrompts: Readonly<{
    table1: {
        description: string;
        type: string;
        required: boolean;
    };
    table2: {
        description: string;
        type: string;
        required: boolean;
    };
    schema1: {
        description: string;
        type: string;
        required: boolean;
    };
    schema2: {
        description: string;
        type: string;
        required: boolean;
    };
    keyColumns: {
        description: string;
        type: string;
        required: boolean;
    };
    compareColumns: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    output: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    format: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    showValues: {
        description: string;
        type: string;
        required: boolean;
        default: boolean;
        ask: () => boolean;
    };
    limit: {
        description: string;
        type: string;
        required: boolean;
        default: number;
        ask: () => boolean;
    };
    timeout: {
        description: string;
        type: string;
        required: boolean;
        default: number;
        ask: () => boolean;
    };
    profile: {
        description: string;
        type: string;
        required: boolean;
        ask: () => void;
    };
    dryRun: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
}>;
