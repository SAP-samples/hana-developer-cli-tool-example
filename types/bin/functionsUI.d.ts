export function handler(argv: any): void;
export function getFunctions(prompts: any): Promise<void>;
export const command: "functionsUI [schema] [function]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
