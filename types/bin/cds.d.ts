export function handler(argv: any): Promise<void>;
export function cdsBuild(prompts: any): Promise<void>;
export function getIndex(odataURL: any, entity: any): string;
export const command: "cds [schema] [table]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
