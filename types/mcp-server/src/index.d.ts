#!/usr/bin/env node
/**
 * MCP Server for SAP HANA CLI
 *
 * CRITICAL: MCP communicates via JSON-RPC over STDIO. All logging MUST use
 * console.error() (stderr), never console.log() (stdout). Any non-JSON output
 * to stdout will break the protocol.
 */
export {};
