import { useSchemaCache } from '../composables/useSchemaCache'

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'ALTER', 'DROP', 'TABLE', 'VIEW', 'INDEX',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'CROSS', 'ON',
  'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'HAVING',
  'DISTINCT', 'AS', 'NULL', 'IS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'LIMIT', 'OFFSET', 'TOP', 'UNION', 'ALL', 'EXISTS',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'IFNULL',
  'CAST', 'CONVERT', 'SUBSTRING', 'LENGTH', 'TRIM', 'UPPER', 'LOWER',
  'SCHEMA', 'DATABASE', 'PROCEDURE', 'FUNCTION', 'TRIGGER',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'UNIQUE',
  'WITH', 'RECURSIVE', 'EXPLAIN', 'PLAN'
]

export function createSqlCompletionProvider(monaco: any) {
  const { getSchemas, getTables, getColumns } = useSchemaCache()

  return {
    triggerCharacters: ['.', ' ', '"'],

    async provideCompletionItems(model: any, position: any) {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      })

      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      const lineText = model.getLineContent(position.lineNumber)
      const beforeCursor = lineText.substring(0, position.column - 1)

      const dotMatch = beforeCursor.match(/["']?(\w+)["']?\.\s*$/)
      if (dotMatch) {
        const prefix = dotMatch[1]
        const schemas = await getSchemas()
        if (schemas.some(s => s.toUpperCase() === prefix.toUpperCase())) {
          const tables = await getTables(prefix)
          return {
            suggestions: tables.map(t => ({
              label: t.name,
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: `"${t.name}"`,
              range,
              detail: `${t.type} in ${t.schema}`
            }))
          }
        }

        const upperText = textUntilPosition.toUpperCase()
        const fromMatch = upperText.match(/FROM\s+["']?(\w+)["']?\.["']?(\w+)["']?/i)
        if (fromMatch) {
          const cols = await getColumns(fromMatch[1], fromMatch[2])
          return {
            suggestions: cols.map(c => ({
              label: c.name,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: `"${c.name}"`,
              range,
              detail: `${c.dataType}${c.length ? `(${c.length})` : ''}`
            }))
          }
        }

        return { suggestions: [] }
      }

      const upperBefore = beforeCursor.toUpperCase().trimEnd()
      const afterKeyword = upperBefore.match(/(?:FROM|JOIN|INTO|UPDATE)\s*$/i)

      if (afterKeyword) {
        const schemas = await getSchemas()
        const currentSchema = schemas.length > 0 ? schemas[0] : null
        const suggestions: any[] = schemas.map(s => ({
          label: s,
          kind: monaco.languages.CompletionItemKind.Module,
          insertText: `"${s}"`,
          range,
          detail: 'Schema'
        }))

        if (currentSchema) {
          const tables = await getTables(currentSchema)
          suggestions.push(...tables.map(t => ({
            label: t.name,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: `"${t.schema}"."${t.name}"`,
            range,
            detail: `${t.type} in ${t.schema}`,
            sortText: '0' + t.name
          })))
        }

        return { suggestions }
      }

      const suggestions: any[] = SQL_KEYWORDS.map(kw => ({
        label: kw,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: kw,
        range,
        sortText: '1' + kw
      }))

      const schemas = await getSchemas()
      suggestions.push(...schemas.slice(0, 20).map(s => ({
        label: s,
        kind: monaco.languages.CompletionItemKind.Module,
        insertText: `"${s}"`,
        range,
        detail: 'Schema',
        sortText: '2' + s
      })))

      return { suggestions }
    }
  }
}
