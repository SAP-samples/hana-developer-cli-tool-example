/**
 * Smart search system
 * Comprehensive search across commands, parameters, workflows, examples, and documentation
 */
import { COMMAND_METADATA_MAP, getAllWorkflows } from './command-metadata.js';
import { getCommandExamples, getCommandPresets } from './examples-presets.js';
/**
 * Calculate relevance score for search term against text
 */
function calculateRelevance(searchTerm, text) {
    const lowerSearch = searchTerm.toLowerCase();
    const lowerText = text.toLowerCase();
    const words = lowerSearch.split(/\s+/);
    let score = 0;
    // Exact match
    if (lowerText === lowerSearch) {
        score += 100;
    }
    // Contains exact phrase
    if (lowerText.includes(lowerSearch)) {
        score += 50;
    }
    // Contains all words
    const containsAll = words.every(word => lowerText.includes(word));
    if (containsAll) {
        score += 30;
    }
    // Contains some words
    const wordMatches = words.filter(word => lowerText.includes(word)).length;
    score += wordMatches * 10;
    // Word at start bonus
    if (lowerText.startsWith(lowerSearch)) {
        score += 20;
    }
    return score;
}
/**
 * Search commands
 */
function searchCommands(query) {
    const results = [];
    for (const [command, metadata] of Object.entries(COMMAND_METADATA_MAP)) {
        let relevance = 0;
        // Check command name
        relevance += calculateRelevance(query, command) * 2;
        // Check tags
        if (metadata.tags) {
            for (const tag of metadata.tags) {
                relevance += calculateRelevance(query, tag);
            }
        }
        // Check use cases
        if (metadata.useCases) {
            for (const useCase of metadata.useCases) {
                relevance += calculateRelevance(query, useCase);
            }
        }
        // Check category
        if (metadata.category) {
            relevance += calculateRelevance(query, metadata.category);
        }
        if (relevance > 0) {
            results.push({
                type: 'command',
                name: command,
                relevance,
                description: metadata.useCases?.[0] || `${command} command`,
                category: metadata.category,
                tags: metadata.tags,
                howToUse: `Use hana_${command} command`,
                relatedResults: metadata.relatedCommands?.map(c => `hana_${c}`),
            });
        }
    }
    return results;
}
/**
 * Search workflows
 */
function searchWorkflows(query) {
    const workflows = getAllWorkflows();
    const results = [];
    for (const workflow of workflows) {
        let relevance = 0;
        relevance += calculateRelevance(query, workflow.name);
        relevance += calculateRelevance(query, workflow.description);
        relevance += calculateRelevance(query, workflow.goal);
        if (workflow.tags) {
            for (const tag of workflow.tags) {
                relevance += calculateRelevance(query, tag);
            }
        }
        if (relevance > 0) {
            results.push({
                type: 'workflow',
                name: workflow.name,
                relevance,
                description: workflow.description,
                tags: workflow.tags,
                howToUse: `Use hana_workflow_by_id with id="${workflow.id}"`,
            });
        }
    }
    return results;
}
/**
 * Search examples
 */
function searchExamples(query) {
    const results = [];
    const commands = Object.keys(COMMAND_METADATA_MAP);
    for (const command of commands) {
        const examples = getCommandExamples(command);
        for (const example of examples) {
            let relevance = 0;
            relevance += calculateRelevance(query, example.scenario);
            relevance += calculateRelevance(query, example.description);
            if (example.notes) {
                relevance += calculateRelevance(query, example.notes);
            }
            if (relevance > 0) {
                results.push({
                    type: 'example',
                    name: `${command}: ${example.scenario}`,
                    relevance,
                    description: example.description,
                    howToUse: `Use hana_examples with command="${command}" to see this example`,
                });
            }
        }
    }
    return results;
}
/**
 * Search presets
 */
function searchPresets(query) {
    const results = [];
    const commands = Object.keys(COMMAND_METADATA_MAP);
    for (const command of commands) {
        const presets = getCommandPresets(command);
        for (const preset of presets) {
            let relevance = 0;
            relevance += calculateRelevance(query, preset.name);
            relevance += calculateRelevance(query, preset.description);
            if (preset.whenToUse) {
                relevance += calculateRelevance(query, preset.whenToUse);
            }
            if (relevance > 0) {
                results.push({
                    type: 'preset',
                    name: `${command}: ${preset.name}`,
                    relevance,
                    description: preset.description,
                    howToUse: `Use hana_parameter_presets with command="${command}" to see this preset`,
                });
            }
        }
    }
    return results;
}
/**
 * Perform comprehensive smart search
 */
export function smartSearch(query, scope = 'all', limit = 20) {
    let allResults = [];
    // Search based on scope
    if (scope === 'all' || scope === 'commands') {
        allResults.push(...searchCommands(query));
    }
    if (scope === 'all' || scope === 'workflows') {
        allResults.push(...searchWorkflows(query));
    }
    if (scope === 'all' || scope === 'examples') {
        allResults.push(...searchExamples(query));
    }
    if (scope === 'all' || scope === 'presets') {
        allResults.push(...searchPresets(query));
    }
    // Sort by relevance
    allResults.sort((a, b) => b.relevance - a.relevance);
    // Limit results
    const results = allResults.slice(0, limit);
    // Generate suggestions if few results
    const suggestions = [];
    if (results.length < 3) {
        suggestions.push('Try using different keywords');
        suggestions.push('Use hana_discover_categories to browse by category');
        suggestions.push('Use hana_recommend to describe what you want to do');
    }
    return {
        query,
        totalResults: allResults.length,
        results,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
}
/**
 * Get search suggestions based on partial query
 */
export function getSearchSuggestions(partialQuery) {
    const suggestions = new Set();
    const lowerQuery = partialQuery.toLowerCase();
    // Suggest command names
    for (const command of Object.keys(COMMAND_METADATA_MAP)) {
        if (command.toLowerCase().startsWith(lowerQuery)) {
            suggestions.add(command);
        }
    }
    // Suggest tags
    for (const metadata of Object.values(COMMAND_METADATA_MAP)) {
        if (metadata.tags) {
            for (const tag of metadata.tags) {
                if (tag.toLowerCase().startsWith(lowerQuery)) {
                    suggestions.add(tag);
                }
            }
        }
    }
    return Array.from(suggestions).slice(0, 10);
}
//# sourceMappingURL=smart-search.js.map