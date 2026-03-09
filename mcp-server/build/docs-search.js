/**
 * Documentation Search Module
 *
 * Provides efficient search capabilities across the pre-built documentation index.
 * Supports full-text search, category filtering, and document retrieval.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Documentation search class
 *
 * IMPORTANT: This class runs within the MCP (Model Context Protocol) server.
 * MCP communicates via JSON-RPC over STDIO. Any output to stdout (console.log)
 * will break the protocol. Always use console.error() for logging instead,
 * which writes to stderr and won't interfere with MCP communication.
 */
export class DocsSearch {
    index = null;
    documentsMap = new Map();
    docsDir;
    constructor() {
        // Path to docs directory relative to mcp-server
        this.docsDir = join(__dirname, '..', '..', 'docs');
        this.loadIndex();
    }
    /**
     * Load the pre-built documentation index
     */
    loadIndex() {
        try {
            const indexPath = join(__dirname, '..', 'docs-index.json');
            const indexContent = readFileSync(indexPath, 'utf-8');
            this.index = JSON.parse(indexContent);
            // Build a map for quick document lookup
            if (this.index) {
                this.index.documents.forEach(doc => {
                    this.documentsMap.set(doc.path, doc);
                });
            }
            console.error(`[DocsSearch] Loaded index with ${this.index?.totalDocuments || 0} documents`);
        }
        catch (error) {
            console.error('[DocsSearch] Failed to load documentation index:', error);
            this.index = null;
        }
    }
    /**
     * Check if index is available
     */
    isAvailable() {
        return this.index !== null;
    }
    /**
     * Get index statistics
     */
    getStats() {
        if (!this.index) {
            return { error: 'Index not available' };
        }
        return {
            totalDocuments: this.index.totalDocuments,
            categories: this.index.categories,
            docTypes: Object.keys(this.index.index.byType),
            buildDate: this.index.buildDate,
            version: this.index.version
        };
    }
    /**
     * Calculate relevance score for a search query against a document
     */
    calculateRelevance(query, doc) {
        const lowerQuery = query.toLowerCase();
        const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
        let score = 0;
        const matchedKeywords = [];
        // Exact title match (highest priority)
        if (doc.title.toLowerCase() === lowerQuery) {
            score += 100;
        }
        else if (doc.title.toLowerCase().includes(lowerQuery)) {
            score += 50;
        }
        // Title word matches
        const titleWords = doc.title.toLowerCase().split(/\s+/);
        queryWords.forEach(word => {
            if (titleWords.includes(word)) {
                score += 20;
            }
        });
        // Keyword matches
        doc.keywords.forEach(keyword => {
            queryWords.forEach(word => {
                if (keyword.includes(word) || word.includes(keyword)) {
                    score += 15;
                    if (!matchedKeywords.includes(keyword)) {
                        matchedKeywords.push(keyword);
                    }
                }
            });
            // Exact keyword match
            if (keyword === lowerQuery) {
                score += 30;
            }
        });
        // Excerpt matches
        const lowerExcerpt = doc.excerpt.toLowerCase();
        queryWords.forEach(word => {
            if (lowerExcerpt.includes(word)) {
                score += 5;
            }
        });
        // Heading matches
        doc.headings.forEach(heading => {
            const lowerHeading = heading.text.toLowerCase();
            queryWords.forEach(word => {
                if (lowerHeading.includes(word)) {
                    score += 10;
                }
            });
        });
        // Category match
        if (doc.category.toLowerCase().includes(lowerQuery)) {
            score += 15;
        }
        return { score, matchedKeywords };
    }
    /**
     * Search documentation
     */
    search(query, options = {}) {
        if (!this.index) {
            return [];
        }
        const { category, docType, limit = 10 } = options;
        const results = [];
        // Filter documents by category and type if specified
        let documentsToSearch = this.index.documents;
        if (category) {
            const categoryDocs = this.index.index.byCategory[category] || [];
            documentsToSearch = documentsToSearch.filter(doc => categoryDocs.includes(doc.path));
        }
        if (docType) {
            const typeDocs = this.index.index.byType[docType] || [];
            documentsToSearch = documentsToSearch.filter(doc => typeDocs.includes(doc.path));
        }
        // Calculate relevance for each document
        documentsToSearch.forEach(doc => {
            const { score, matchedKeywords } = this.calculateRelevance(query, doc);
            if (score > 0) {
                results.push({
                    document: doc,
                    relevance: score,
                    matchedKeywords,
                    snippet: this.createSnippet(doc.excerpt, query)
                });
            }
        });
        // Sort by relevance and limit results
        results.sort((a, b) => b.relevance - a.relevance);
        return results.slice(0, limit);
    }
    /**
     * Create a snippet highlighting the search term
     */
    createSnippet(text, query, maxLength = 200) {
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);
        if (index === -1) {
            return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
        }
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + query.length + 150);
        let snippet = text.substring(start, end);
        if (start > 0)
            snippet = '...' + snippet;
        if (end < text.length)
            snippet = snippet + '...';
        return snippet;
    }
    /**
     * Get document by path
     */
    getDocument(path) {
        return this.documentsMap.get(path) || null;
    }
    /**
     * Get full document content
     */
    getDocumentContent(path) {
        try {
            const fullPath = join(this.docsDir, path);
            return readFileSync(fullPath, 'utf-8');
        }
        catch (error) {
            console.error(`[DocsSearch] Failed to read document ${path}:`, error);
            return null;
        }
    }
    /**
     * List all documents in a category
     */
    listByCategory(category) {
        if (!this.index) {
            return [];
        }
        const docPaths = this.index.index.byCategory[category] || [];
        return docPaths
            .map(path => this.documentsMap.get(path))
            .filter((doc) => doc !== undefined);
    }
    /**
     * List all documents of a specific type
     */
    listByType(docType) {
        if (!this.index) {
            return [];
        }
        const docPaths = this.index.index.byType[docType] || [];
        return docPaths
            .map(path => this.documentsMap.get(path))
            .filter((doc) => doc !== undefined);
    }
    /**
     * Get documents by keyword
     */
    findByKeyword(keyword) {
        if (!this.index) {
            return [];
        }
        const lowerKeyword = keyword.toLowerCase();
        const docPaths = this.index.index.byKeyword[lowerKeyword] || [];
        return docPaths
            .map(path => this.documentsMap.get(path))
            .filter((doc) => doc !== undefined);
    }
    /**
     * Get all categories
     */
    getCategories() {
        return this.index?.categories || [];
    }
    /**
     * Get all document types
     */
    getDocTypes() {
        return this.index ? Object.keys(this.index.index.byType) : [];
    }
    /**
     * Search suggestions based on partial query
     */
    getSuggestions(partialQuery, limit = 5) {
        if (!this.index || partialQuery.length < 2) {
            return [];
        }
        const lowerQuery = partialQuery.toLowerCase();
        const suggestions = new Set();
        // Suggest matching keywords
        Object.keys(this.index.index.byKeyword).forEach(keyword => {
            if (keyword.startsWith(lowerQuery)) {
                suggestions.add(keyword);
            }
        });
        // Suggest matching titles
        this.index.documents.forEach(doc => {
            const lowerTitle = doc.title.toLowerCase();
            if (lowerTitle.includes(lowerQuery)) {
                suggestions.add(doc.title);
            }
        });
        return Array.from(suggestions).slice(0, limit);
    }
}
// Export singleton instance
export const docsSearch = new DocsSearch();
//# sourceMappingURL=docs-search.js.map