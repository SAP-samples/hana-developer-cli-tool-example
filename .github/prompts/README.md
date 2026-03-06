# Custom Prompts

This folder contains custom prompt templates used to guide changes in specific areas of the repository.

Canonical docs: [`docs/05-development/copilot/prompts.md`](../../docs/05-development/copilot/prompts.md)

For contributor guidance, see the [Contributing section](../../docs/05-development/index.md#contributing).

## When to use which prompt

- **Update Markdown Docs** (`update-markdown-docs.prompt.md`): Use for any documentation changes under `docs/`, especially command docs in `docs/02-commands/`.
- **Update VitePress Config** (`update-vitepress-config.prompt.md`): Use for changes in `docs/.vitepress/` (sidebar, theme, Mermaid, nav, base URL).
- **Update GitHub Workflow** (`update-github-workflow.prompt.md`): Use for `.github/workflows/*.yml` or `.yaml` changes.
- **Update TypeScript Config** (`update-tsconfig.prompt.md`): Use for `tsconfig.json` updates (root or subprojects like `mcp-server`).
- **Update Package Scripts** (`update-package-scripts.prompt.md`): Use when adding or modifying scripts in any `package.json`.
- **Update Tooling Configs** (`update-tool-configs.prompt.md`): Use for lint/test/coverage config files such as `.eslintrc.*`, `.prettierrc.*`, `.nycrc.*`, `.mocharc.*`, `.markdownlintrc.*`, `.editorconfig`.
- **Update Automation Scripts** (`update-automation-scripts.prompt.md`): Use for root automation scripts (`generate-*`, `enhance-*`, `update-*`, `populate-*`).
- **Update MCP Server** (`update-mcp-server.prompt.md`): Use for `mcp-server/src/**/*.ts` changes.

## Related Copilot customization

- [Agents overview](../AGENTS.md)
- [Docs automation skill](../skills/docs-automation/SKILL.md)
- [CLI command development skill](../skills/cli-command-development/SKILL.md)
- [MCP server workflows skill](../skills/mcp-server-workflows/SKILL.md)
