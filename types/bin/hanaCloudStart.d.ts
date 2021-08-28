export function handler(argv: any): void;
export function hcStart(prompts: any): Promise<void>;
export const command: "hcStart [name]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
