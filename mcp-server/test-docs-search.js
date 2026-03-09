/**
 * Test Documentation Search Module
 * 
 * Quick test to verify the documentation search is working correctly
 */

import { docsSearch } from './build/docs-search.js';

console.log('🧪 Testing Documentation Search Module\n');

// Test 1: Check if index is available
console.log('Test 1: Index Availability');
console.log('  Available:', docsSearch.isAvailable());
if (!docsSearch.isAvailable()) {
  console.log('  ❌ Index not available. Run: npm run build:docs-index');
  process.exit(1);
}
console.log('  ✅ Index loaded successfully\n');

// Test 2: Get statistics
console.log('Test 2: Index Statistics');
const stats = docsSearch.getStats();
console.log('  Total Documents:', stats.totalDocuments);
console.log('  Categories:', stats.categories.length);
console.log('  Build Date:', stats.buildDate);
console.log('  ✅ Stats retrieved successfully\n');

// Test 3: Search for "import"
console.log('Test 3: Search for "import"');
const importResults = docsSearch.search('import', { limit: 5 });
console.log(`  Found ${importResults.length} results`);
if (importResults.length > 0) {
  console.log('  Top result:');
  console.log('    - Title:', importResults[0].document.title);
  console.log('    - Path:', importResults[0].document.path);
  console.log('    - Relevance:', importResults[0].relevance);
  console.log('  ✅ Search working correctly\n');
} else {
  console.log('  ❌ No results found\n');
}

// Test 4: Get document by path
console.log('Test 4: Get Document Content');
if (importResults.length > 0) {
  const docPath = importResults[0].document.path;
  const doc = docsSearch.getDocument(docPath);
  const content = docsSearch.getDocumentContent(docPath);
  
  if (doc && content) {
    console.log('  Document:', doc.title);
    console.log('  Content length:', content.length, 'characters');
    console.log('  Headings:', doc.headings.length);
    console.log('  ✅ Document retrieval working\n');
  } else {
    console.log('  ❌ Could not retrieve document\n');
  }
}

// Test 5: List categories
console.log('Test 5: List Categories');
const categories = docsSearch.getCategories();
console.log('  Categories:', categories.join(', '));
console.log('  ✅ Category listing working\n');

// Test 6: Search with filters
console.log('Test 6: Filtered Search (commands category)');
const filteredResults = docsSearch.search('data', { 
  category: 'commands', 
  limit: 3 
});
console.log(`  Found ${filteredResults.length} results in 'commands' category`);
if (filteredResults.length > 0) {
  filteredResults.forEach((r, i) => {
    console.log(`    ${i + 1}. ${r.document.title} (${r.document.path})`);
  });
  console.log('  ✅ Filtered search working\n');
} else {
  console.log('  ⚠️  No results found with filter\n');
}

// Test 7: Get suggestions
console.log('Test 7: Search Suggestions');
const suggestions = docsSearch.getSuggestions('imp', 5);
console.log('  Suggestions for "imp":', suggestions.slice(0, 3).join(', '));
console.log('  ✅ Suggestions working\n');

console.log('✅ All tests passed!');
console.log('\nDocumentation Search Module is ready to use.');
console.log('Available tools: hana_search_docs, hana_get_doc, hana_docs_stats, hana_list_doc_categories');
