export function handler(argv: any): void;
export function listInstances(prompts: any): Promise<{
    name: any;
    last_operation: string;
}[]>;
export const command: "sbss";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
export namespace inputPrompts {
    namespace cf {
        export let description: string;
        export let type: string;
        let _default: boolean;
        export { _default as default };
        export let required: boolean;
    }
}
