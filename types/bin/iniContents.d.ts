export function handler(argv: any): void;
export function iniContents(prompts: any): Promise<any>;
export const command: "iniContents [file] [section]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
