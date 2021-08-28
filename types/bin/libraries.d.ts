export function handler(argv: any): void;
export function getLibraries(prompts: any): Promise<any>;
export const command: "libraries [schema] [library]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
