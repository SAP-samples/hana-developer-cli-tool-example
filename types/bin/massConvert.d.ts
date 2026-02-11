export function handler(argv: any): Promise<void>;
export function getTables(prompts: any): Promise<void>;
export const command: "massConvert [schema] [table] [view]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
