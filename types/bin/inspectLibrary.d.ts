export function handler(argv: any): void;
export function libraryInspect(prompts: any): Promise<void>;
export const command: "inspectLibrary [schema] [library]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
