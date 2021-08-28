export function handler(argv: any): void;
export function getChangeLog(): Promise<void>;
export const command: "changelog";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
