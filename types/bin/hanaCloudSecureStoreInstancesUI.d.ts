export function handler(argv: any): void;
export function listInstances(prompts: any): Promise<void>;
export const command: "securestoreUI";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
