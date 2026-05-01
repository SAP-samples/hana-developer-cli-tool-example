export function handler(argv: any): Promise<void>;
export function tableInspect(prompts: any): Promise<void>;
export const command: "inspectTableUI [schema] [table]";
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
    output: {
        description: string;
        type: string;
        required: boolean;
    };
    useHanaTypes: {
        description: string;
        type: string;
    };
    useExists: {
        description: string;
        type: string;
    };
    useQuoted: {
        description: string;
        type: string;
    };
    noColons: {
        type: string;
        description: string;
    };
};
