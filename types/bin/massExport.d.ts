export function handler(argv: any): Promise<void>;
export function exportObjects(prompts: any): Promise<void>;
export const command: "massExport [schema] [object]";
export const aliases: string[];
export const describe: string;
export function builder(yargs: any): any;
