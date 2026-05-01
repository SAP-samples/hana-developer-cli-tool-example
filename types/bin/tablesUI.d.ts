export function handler(argv: any): Promise<void>;
export function getTables(prompts: any): Promise<void>;
export const command: "tablesUI [schema] [table]";
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
    limit: {
        description: string;
        type: string;
        required: boolean;
    };
    profile: {
        description: string;
        type: string;
        required: boolean;
        ask: () => void;
    };
};
