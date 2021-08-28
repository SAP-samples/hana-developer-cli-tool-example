export function handler(argv: any): void;
export function dbConnect(input: any): Promise<void>;
export function saveEnv(options: any): Promise<void>;
export const command: "connect [user] [password]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
