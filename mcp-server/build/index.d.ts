#!/usr/bin/env node
/**
 * MCP Server for SAP HANA CLI
 *
 * CRITICAL: This file implements the Model Context Protocol (MCP) server.
 * MCP communicates via JSON-RPC over STDIO. All logging MUST use console.error()
 * to write to stderr, never console.log() which writes to stdout.
 *
 * Any non-JSON output to stdout will break the protocol and cause errors like:
 * "Failed to parse message: ..."
 *
 * Use console.error() for all logging throughout this file and in modules it imports.
 */
export {};
//# sourceMappingURL=index.d.ts.map