export var command: string;
export var aliases: string[];
export var describe: string;
export var builder: import("yargs").CommandBuilder<{}, {}>;
export function handler(argv: any): void;
export namespace inputPrompts {
    namespace cf {
        export const description: string;
        export const type: string;
        const _default: boolean;
        export { _default as default };
        export const required: boolean;
    }
}
export function listInstances(prompts: any): Promise<{
    name: any;
    last_operation: string;
}[]>;
