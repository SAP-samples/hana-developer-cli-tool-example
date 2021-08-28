export const command: "readMe";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
export function handler(): Promise<void>;
