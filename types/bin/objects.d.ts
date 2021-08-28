export function handler(argv: any): void;
export function getObjects(prompts: any): Promise<any>;
export const command: "objects [schema] [object]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
