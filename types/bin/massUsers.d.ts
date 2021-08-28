export function handler(argv: any): void;
export function massUsers(prompts: any): Promise<void>;
export const command: "massUsers [user] [password]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
