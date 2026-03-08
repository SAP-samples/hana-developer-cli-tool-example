/**
 * Perform comprehensive smart search
 */
export function smartSearch(query: any, scope?: string, limit?: number): {
    query: any;
    totalResults: number;
    results: {
        type: string;
        name: string;
        relevance: number;
        description: string;
        howToUse: string;
    }[];
    suggestions: string[] | undefined;
};
/**
 * Get search suggestions based on partial query
 */
export function getSearchSuggestions(partialQuery: any): any[];
