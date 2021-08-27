export function handler(argv: any): void;
export function activate(prompts: any): Promise<void>;
export const command: "adminHDIGroup [user] [group]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
