export function handler(argv: any): void;
export function traceContents(prompts: any): Promise<any>;
export const command: "traceContents [host] [file]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
