export function handler(argv: any): void;
export function getBAS(): Promise<void>;
export const command: "openbas";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
