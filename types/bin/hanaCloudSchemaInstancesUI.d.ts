export function handler(argv: any): void;
export function listInstances(prompts: any): Promise<void>;
export const command: "schemaInstancesUI";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
