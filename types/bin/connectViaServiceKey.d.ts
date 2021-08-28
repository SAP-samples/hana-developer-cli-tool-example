export function handler(argv: any): void;
export function setKeyDetails(input: any): Promise<void>;
export function saveEnv(options: any, input: any): Promise<void>;
export const command: "serviceKey [instance] [key]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
