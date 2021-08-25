export var command: string;
export var aliases: string[];
export var describe: any;
export var builder: any;
export function handler(argv: any): void;
export namespace inputPrompts {
    namespace cf {
        export const description: any;
        export const type: string;
        const _default: boolean;
        export { _default as default };
        export const required: boolean;
    }
}
export function listInstances(prompts: any): Promise<({
    name: any;
    created_at: any;
} | {
    name: any;
    credentials: string;
})[]>;
