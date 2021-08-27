export var command: string;
export var aliases: string[];
export var describe: string;
export var builder: import("yargs").CommandBuilder<{}, {}>;
export function handler(argv: any): void;
export function iniFiles(prompts: any): Promise<any>;
