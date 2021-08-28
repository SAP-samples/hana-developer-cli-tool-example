export function handler(argv: any): void;
export function readMe(prompts: any): Promise<void>;
export const command: "readMeUI";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
