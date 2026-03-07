/**
 * Documentation Search Module
 *
 * Provides efficient search capabilities across the pre-built documentation index.
 * Supports full-text search, category filtering, and document retrieval.
 */
interface DocumentHeading {
    level: number;
    text: string;
    anchor: string;
}
interface DocumentLink {
    text: string;
    url: string;
}
interface DocumentMetadata {
    path: string;
    title: string;
    category: string;
    docType: 'tutorial' | 'command' | 'api' | 'feature' | 'troubleshooting' | 'development' | 'general';
    keywords: string[];
    excerpt: string;
    headings: DocumentHeading[];
    links: DocumentLink[];
    size: number;
    lastModified: string;
}
interface SearchResult {
    document: DocumentMetadata;
    relevance: number;
    matchedKeywords: string[];
    snippet?: string;
}
interface SearchOptions {
    category?: string;
    docType?: string;
    limit?: number;
    includeContent?: boolean;
}
/**
 * Documentation search class
 *
 * IMPORTANT: This class runs within the MCP (Model Context Protocol) server.
 * MCP communicates via JSON-RPC over STDIO. Any output to stdout (console.log)
 * will break the protocol. Always use console.error() for logging instead,
 * which writes to stderr and won't interfere with MCP communication.
 */
export declare class DocsSearch {
    private index;
    private documentsMap;
    private docsDir;
    constructor();
    /**
     * Load the pre-built documentation index
     */
    private loadIndex;
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
        totalDocuments: number;
        categories: string[];
        docTypes: string[];
        buildDate: string;
        version: string;
        error?: undefined;
    };
    /**
     * Calculate relevance score for a search query against a document
     */
    private calculateRelevance;
    /**
     * Search documentation
     */
    search(query: string, options?: SearchOptions): SearchResult[];
    /**
     * Create a snippet highlighting the search term
     */
    private createSnippet;
    /**
     * Get document by path
     */
    getDocument(path: string): DocumentMetadata | null;
    /**
     * Get full document content
     */
    getDocumentContent(path: string): string | null;
    /**
     * List all documents in a category
     */
    listByCategory(category: string): DocumentMetadata[];
    /**
     * List all documents of a specific type
     */
    listByType(docType: string): DocumentMetadata[];
    /**
     * Get documents by keyword
     */
    findByKeyword(keyword: string): DocumentMetadata[];
    /**
     * Get all categories
     */
    getCategories(): string[];
    /**
     * Get all document types
     */
    getDocTypes(): string[];
    /**
     * Search suggestions based on partial query
     */
    getSuggestions(partialQuery: string, limit?: number): string[];
}
export declare const docsSearch: DocsSearch;
export {};
