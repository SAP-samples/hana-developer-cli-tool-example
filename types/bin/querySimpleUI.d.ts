export function handler(argv: any): void;
export function dbQuery(prompts: any): Promise<void>;
export const command: "querySimpleUI";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
