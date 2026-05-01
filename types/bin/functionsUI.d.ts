export function handler(argv: any): Promise<void>;
export function getFunctions(prompts: any): Promise<void>;
export const command: "functionsUI [schema] [function]";
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
    functionName: {
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
};
