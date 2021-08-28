export function handler(): Promise<void>;
export const command: "matrix";
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
