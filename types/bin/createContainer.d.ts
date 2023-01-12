export function handler(argv: any): void;
export function activate(prompts: any): Promise<void>;
export function saveEnv(options: any, container: any, userDT: any, userRT: any, passwordDT: any, passwordRT: any, encrypt: any): Promise<void>;
export const command: "createContainer [container] [group]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
