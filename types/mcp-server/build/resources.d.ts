/**
 * List all available resources
 */
export function listResources(): {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}[];
/**
 * Read a specific resource
 */
export function readResource(uri: any): Promise<{
    uri: any;
    mimeType: string;
    text: string;
}>;
