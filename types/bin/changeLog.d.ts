export function handler(): Promise<void>;
export function getChangeLog(): Promise<void>;
export const command: "changes";
export const aliases: string[];
export const describe: string;
