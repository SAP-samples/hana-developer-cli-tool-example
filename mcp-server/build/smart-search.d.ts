/**
 * Smart search system
 * Comprehensive search across commands, parameters, workflows, examples, and documentation
 */
export interface SearchResult {
    type: 'command' | 'workflow' | 'example' | 'parameter' | 'preset';
    name: string;
    relevance: number;
    description: string;
    category?: string;
    tags?: string[];
    howToUse?: string;
    relatedResults?: string[];
}
export interface SearchResults {
    query: string;
    totalResults: number;
    results: SearchResult[];
    suggestions?: string[];
}
/**
 * Perform comprehensive smart search
 */
export declare function smartSearch(query: string, scope?: string, limit?: number): SearchResults;
/**
 * Get search suggestions based on partial query
 */
export declare function getSearchSuggestions(partialQuery: string): string[];
//# sourceMappingURL=smart-search.d.ts.map