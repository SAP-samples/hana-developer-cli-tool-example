export function handler(argv: any): void;
export function getTriggers(prompts: any): Promise<any>;
export const command: "triggers [schema] [trigger] [target]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
