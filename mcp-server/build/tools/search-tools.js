import { jsonResponse, errorResponse } from './types.js';
import { docsSearch } from '../docs-search.js';
import { smartSearch } from '../smart-search.js';
export function getSearchToolDefinitions() {
    return [
        {
            name: 'hana_search',
            description: 'Search across all hana-cli resources: documentation, commands, workflows, examples, and presets. Use scope to narrow results. Default searches everything with relevance scoring.',
            inputSchema: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Search query (keywords or phrases)' },
                    scope: {
                        type: 'string',
                        enum: ['all', 'docs', 'commands', 'workflows', 'examples', 'presets'],
                        description: 'What to search. "all" (default) searches everything, "docs" searches documentation website only, others search command metadata.',
                    },
                    category: { type: 'string', description: 'Optional: limit doc search to specific category (getting-started, commands, features, api-reference, development)' },
                    docType: {
                        type: 'string',
                        enum: ['tutorial', 'command', 'api', 'feature', 'troubleshooting', 'development', 'general'],
                        description: 'Optional: filter docs by document type',
                    },
                    limit: { type: 'number', default: 10, description: 'Maximum number of results to return (default: 10)' },
                },
                required: ['query'],
            },
        },
        {
            name: 'hana_get_doc',
            description: 'Retrieve the full content of a specific documentation page. Use after hana_search to get complete details from a relevant document.',
            inputSchema: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Document path from search results (e.g., "01-getting-started/installation.md", "02-commands/data-tools/import.md")' },
                },
                required: ['path'],
            },
        },
    ];
}
export function handleSearchTool(commandName, args) {
    if (commandName === 'search') {
        const query = args?.query;
        if (!query)
            return errorResponse('Error: query parameter is required');
        const scope = args?.scope || 'all';
        const limit = args?.limit || 10;
        const category = args?.category;
        const docType = args?.docType;
        const results = [];
        if (scope === 'all' || scope === 'docs') {
            if (docsSearch.isAvailable()) {
                const docResults = docsSearch.search(query, { category, docType, limit });
                results.push(...docResults.map(r => ({
                    type: 'documentation',
                    title: r.document.title,
                    path: r.document.path,
                    category: r.document.category,
                    relevance: r.relevance,
                    excerpt: r.snippet || r.document.excerpt,
                    url: `https://sap-samples.github.io/hana-developer-cli-tool-example/${r.document.path.replace('.md', '.html')}`,
                })));
            }
        }
        if (scope === 'all' || scope !== 'docs') {
            const smartScope = scope === 'all' ? 'all' : scope;
            const smartResults = smartSearch(query, smartScope, limit);
            if (smartResults.results) {
                results.push(...smartResults.results.map((r) => ({
                    type: r.type,
                    name: r.name,
                    relevance: r.relevance,
                    description: r.description,
                    howToUse: r.howToUse,
                })));
            }
        }
        results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
        const limited = results.slice(0, limit);
        return jsonResponse({
            query, scope, totalResults: limited.length,
            results: limited,
            tip: limited.length > 0
                ? 'Use hana_get_doc with the path to read full documentation content'
                : 'No matches found. Try different keywords or use hana_discover_categories to browse.',
        });
    }
    if (commandName === 'get_doc') {
        const path = args?.path;
        if (!path)
            return errorResponse('Error: path parameter is required');
        if (!docsSearch.isAvailable()) {
            return errorResponse('Documentation index not available. Run "npm run build:docs-index" in the project root.');
        }
        const document = docsSearch.getDocument(path);
        const content = docsSearch.getDocumentContent(path);
        if (!document || !content) {
            return jsonResponse({
                error: `Document not found: ${path}`,
                tip: 'Use hana_search to find valid document paths',
            });
        }
        return jsonResponse({
            title: document.title, path: document.path,
            category: document.category, docType: document.docType,
            url: `https://sap-samples.github.io/hana-developer-cli-tool-example/${path.replace('.md', '.html')}`,
            headings: document.headings, content, relatedLinks: document.links,
            lastModified: document.lastModified,
        });
    }
    return null;
}
//# sourceMappingURL=search-tools.js.map