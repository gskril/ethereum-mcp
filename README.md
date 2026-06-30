# Remote MCP Server for Ethereum Tools

Available tools by category:

- ABI: `encode-abi-parameters`, `decode-abi-parameters`, `decode-function-data`, `encode-function-data`, `fetch-abi`, `function-selector`
- Crypto: `keccak256-hash`
- ENS: `chain-id-to-cointype`, `check-ens-name-availability`, `namehash`, `resolve-ens-address`, `resolve-ens-name`
- ETH: `eth-call`

## Installation

Most MCP clients connect to remote servers directly over Streamable HTTP. Add this to your client config:

```json
{
  "mcpServers": {
    "ethereum": {
      "url": "https://ethereum-mcp.gregskril.workers.dev/mcp"
    }
  }
}
```

### Stdio-only clients

If your client only launches local subprocesses (no `url` support), use `mcp-remote` as a bridge:

```json
{
  "mcpServers": {
    "ethereum": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://ethereum-mcp.gregskril.workers.dev/mcp"]
    }
  }
}
```

This spawns a local Node process that translates stdio to HTTP. Prefer native `url` config when your client supports it.
