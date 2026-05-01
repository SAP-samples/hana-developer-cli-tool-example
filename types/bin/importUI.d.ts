export function handler(argv: any): Promise<void>;
export const command: "importUI [filename] [table]";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
export const inputPrompts: {
    port: {
        description: string;
        type: string;
        required: boolean;
        ask: () => void;
    };
    host: {
        description: string;
        type: string;
        required: boolean;
        ask: () => void;
    };
    filename: {
        description: string;
        type: string;
        required: boolean;
    };
    table: {
        description: string;
        type: string;
        required: boolean;
    };
    schema: {
        description: string;
        type: string;
        required: boolean;
    };
    output: {
        description: string;
        type: string;
        required: boolean;
    };
    matchMode: {
        description: string;
        type: string;
        required: boolean;
    };
    truncate: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    batchSize: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    worksheet: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    startRow: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    skipEmptyRows: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    excelCacheMode: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    dryRun: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    maxFileSizeMB: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    timeoutSeconds: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    nullValues: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    skipWithErrors: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    maxErrorsAllowed: {
        description: string;
        type: string;
        required: boolean;
        ask: () => boolean;
    };
    profile: {
        description: string;
        type: string;
        required: boolean;
        ask: () => void;
    };
};
