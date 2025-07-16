# Remote MCP Server for Ethereum Tools

Add the following to your MCP client (Cursor, Claude Desktop, etc.) config:

```json
{
  "mcpServers": {
    "ethereum": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:8787/mcp"]
    }
  }
}
```

Some clients (like Cursor) also support a simplified config:

```json
{
  "mcpServers": {
    "ethereum": {
      "url": "http://localhost:8787/mcp"
    }
  }
}
```

You might need to restart some clients (like Claude Desktop) for the tools to become available.
