export function handler(argv: any): void;
export function getRoles(prompts: any): Promise<any>;
export const command: "roles [schema] [role]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
