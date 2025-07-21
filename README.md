# Remote MCP Server for Ethereum Tools

Avaiable tools by category:

- ABI: `encode-abi-parameters`, `decode-abi-parameters`, `decode-function-data`, `encode-function-data`, `fetch-abi`, `function-selector`
- Crypto: `keccak256-hash`
- ENS: `resolve-ens-address`, `resolve-ens-name`

## Installation

Add the following to your MCP client (Cursor, Claude Desktop, etc.) config:

```json
{
  "mcpServers": {
    "ethereum": {
      "command": "npx",
      "args": ["mcp-remote", "https://ethereum-mcp.gregskril.workers.dev/mcp"]
    }
  }
}
```

Some clients (like Cursor) also support a simplified config:

```json
{
  "mcpServers": {
    "ethereum": {
      "url": "https://ethereum-mcp.gregskril.workers.dev/mcp"
    }
  }
}
```

You might need to restart some clients (like Claude Desktop) for the tools to become available.
