export function handler(argv: any): void;
export function getViews(prompts: any): Promise<any>;
export const command: "views [schema] [view]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
