export function handler(argv: any): void;
export function sysInfo(prompts: any): Promise<void>;
export function basicOutput(): Promise<void>;
export function environmentOutput(prompts: any): Promise<void>;
export function dbxOutput(prompts: any): Promise<any>;
export const command: "systemInfo";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
export namespace inputPrompts {
    namespace output {
        const description: string;
        const type: string;
        const required: boolean;
    }
}
