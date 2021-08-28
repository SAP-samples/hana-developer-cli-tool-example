export function handler(argv: any): void;
export function listInstances(prompts: any): Promise<{
    name: any;
    last_operation: string;
}[]>;
export const command: "hdi";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
export namespace inputPrompts {
    namespace cf {
        export const description: string;
        export const type: string;
        const _default: boolean;
        export { _default as default };
        export const required: boolean;
    }
}
