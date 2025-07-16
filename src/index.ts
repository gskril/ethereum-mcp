import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { McpAgent } from 'agents/mcp'

import {
  ResolveEnsAddressSchema,
  ResolveEnsNameSchema,
  resolveEnsAddress,
  resolveEnsName,
} from './tools/ens'

// Define our MCP agent with tools
export class EthereumMCP extends McpAgent {
  server = new McpServer({
    name: 'ethereum',
    title: 'Ethereum Developer Tools',
    version: '0.0.1',
  })

  async init() {
    // Forward ENS resolution
    this.server.tool(
      'resolve-ens-name',
      'Get an Ethereum address from an ENS name',
      ResolveEnsNameSchema.shape,
      resolveEnsName
    )

    // Reverse ENS resolution
    this.server.tool(
      'resolve-ens-address',
      'Get an ENS name from an Ethereum address',
      ResolveEnsAddressSchema.shape,
      resolveEnsAddress
    )
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url)

    if (url.pathname === '/sse' || url.pathname === '/sse/message') {
      return EthereumMCP.serveSSE('/sse').fetch(request, env, ctx)
    }

    if (url.pathname === '/mcp') {
      return EthereumMCP.serve('/mcp').fetch(request, env, ctx)
    }

    return new Response('Not found', { status: 404 })
  },
}
