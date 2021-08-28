export function handler(argv: any): void;
export function getUsers(prompts: any): Promise<any>;
export const command: "users [user]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
