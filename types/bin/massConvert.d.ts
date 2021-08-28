export function handler(argv: any): void;
export function getTables(prompts: any): Promise<void>;
export const command: "massConvert [schema] [table]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
