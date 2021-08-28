export function handler(argv: any): void;
export function getContainers(prompts: any): Promise<void>;
export const command: "containersUI [containerGroup] [container]";
export const aliases: string[];
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
