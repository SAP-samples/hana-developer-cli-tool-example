export function handler(argv: any): void;
export function rename(result: any): Promise<void>;
export const command: "massRename";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
