import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { McpAgent } from 'agents/mcp'

import {
  DecodeAbiSchema,
  EncodeAbiSchema,
  FunctionSelectorSchema,
  decodeAbi,
  encodeAbi,
  functionSelector,
} from './tools/abi'
import {
  Keccak256HashSchema,
  createWallet,
  keccak256Hash,
} from './tools/crypto'
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

    // Encode ABI
    this.server.tool(
      'encode-abi',
      'Encode a function call into a hex string',
      EncodeAbiSchema.shape,
      encodeAbi
    )

    // Decode ABI
    this.server.tool(
      'decode-abi',
      'Decode a hex string into a function call',
      DecodeAbiSchema.shape,
      decodeAbi
    )

    // Function selector
    this.server.tool(
      'function-selector',
      [
        'Get the function selector for a Solidity function from the function signature or full function, event or error.',
        'Examples: `function ownerOf(uint256 tokenId) returns (address)`,',
        'or you can extract `function checkPrice(string calldata token)` from the full function like `function checkPrice(string calldata token) public view returns (uint256 price, string memory priceStr) { ... }`',
      ].join('\n'),
      FunctionSelectorSchema.shape,
      functionSelector
    )

    // Keccak256 hash
    this.server.tool(
      'keccak256-hash',
      'Get the Keccak256 hash of a value',
      Keccak256HashSchema.shape,
      keccak256Hash
    )

    // Generate burner wallet
    this.server.tool(
      'create-wallet',
      'Generate a burner wallet with a private key and address',
      createWallet
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
