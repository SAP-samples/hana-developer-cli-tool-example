/**
 * Documentation search class
 *
 * IMPORTANT: This class runs within the MCP (Model Context Protocol) server.
 * MCP communicates via JSON-RPC over STDIO. Any output to stdout (console.log)
 * will break the protocol. Always use console.error() for logging instead,
 * which writes to stderr and won't interfere with MCP communication.
 */
export class DocsSearch {
    index: any;
    documentsMap: Map<any, any>;
    docsDir: string;
    /**
     * Load the pre-built documentation index
     */
    loadIndex(): void;
    /**
     * Check if index is available
     */
    isAvailable(): boolean;
    /**
     * Get index statistics
     */
    getStats(): {
        error: string;
        totalDocuments?: undefined;
        categories?: undefined;
        docTypes?: undefined;
        buildDate?: undefined;
        version?: undefined;
    } | {
        totalDocuments: any;
        categories: any;
        docTypes: string[];
        buildDate: any;
        version: any;
        error?: undefined;
    };
    /**
     * Calculate relevance score for a search query against a document
     */
    calculateRelevance(query: any, doc: any): {
        score: number;
        matchedKeywords: any[];
    };
    /**
     * Search documentation
     */
    search(query: any, options?: {}): any[];
    /**
     * Create a snippet highlighting the search term
     */
    createSnippet(text: any, query: any, maxLength?: number): any;
    /**
     * Get document by path
     */
    getDocument(path: any): any;
    /**
     * Get full document content
     */
    getDocumentContent(path: any): string;
    /**
     * List all documents in a category
     */
    listByCategory(category: any): any;
    /**
     * List all documents of a specific type
     */
    listByType(docType: any): any;
    /**
     * Get documents by keyword
     */
    findByKeyword(keyword: any): any;
    /**
     * Get all categories
     */
    getCategories(): any;
    /**
     * Get all document types
     */
    getDocTypes(): string[];
    /**
     * Search suggestions based on partial query
     */
    getSuggestions(partialQuery: any, limit?: number): any[];
}
export const docsSearch: DocsSearch;
