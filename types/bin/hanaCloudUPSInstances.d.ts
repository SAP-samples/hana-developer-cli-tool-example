export function handler(argv: any): Promise<void>;
export function listInstances(prompts: any): Promise<({
    name: any;
    created_at: any;
} | {
    name: any;
    credentials: string;
})[]>;
export const command: "ups";
export const aliases: string[];
export const describe: string;
export const builder: any;
export namespace inputPrompts {
    namespace cf {
        export let description: string;
        export let type: string;
        let _default: boolean;
        export { _default as default };
        export let required: boolean;
    }
}
