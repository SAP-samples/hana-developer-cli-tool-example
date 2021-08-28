export const command: "rick";
export const describe: string;
export const builder: import("yargs").CommandBuilder<{}, {}>;
export function handler(): Promise<void>;
