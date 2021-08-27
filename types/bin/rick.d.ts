export var command: string;
export var describe: string;
export var builder: import("yargs").CommandBuilder<{}, {}>;
export function handler(): Promise<void>;
