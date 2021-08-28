export function handler(argv: any): void;
export function getProcedures(prompts: any): Promise<any>;
export const command: "procedures [schema] [procedure]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
