/**
 * MCP Resources for SAP HANA CLI
 *
 * Resources are named, readable content that agents can discover and access.
 * They provide documentation, guides, and reference material.
 */
export interface Resource {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}
/**
 * List all available resources
 */
export declare function listResources(): Resource[];
/**
 * Read a specific resource
 */
export declare function readResource(uri: string): Promise<{
    uri: string;
    mimeType: string;
    text: string;
}>;
