import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { McpAgent } from 'agents/mcp'

import {
  decodeAbi,
  decodeAbiParameters,
  encodeAbi,
  encodeAbiParameters,
  fetchAbi,
  functionSelector,
} from './tools/abi'
import { keccak256Hash } from './tools/crypto'
import {
  convertEvmChainIdToCoinType,
  namehash,
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
    // Encode ABI parameters
    this.server.tool(
      'encode-abi-parameters',
      [
        'Generates ABI encoded data given a set of ABI parameters and their corresponding values.',
        'Example: params: `[{ type: "uint32" }, { type: "bytes" }]`, values: `[1, "0x1234567890"]`',
      ].join('\n'),
      encodeAbiParameters.schema.shape,
      encodeAbiParameters.execute
    )

    // Decode ABI parameters
    this.server.tool(
      'decode-abi-parameters',
      'Decodes ABI encoded data (a hex string) into a set of ABI parameters and their corresponding values.',
      decodeAbiParameters.schema.shape,
      decodeAbiParameters.execute
    )

    // Decode ABI
    this.server.tool(
      'decode-function-data',
      'Decode a hex string into a function call',
      decodeAbi.schema.shape,
      decodeAbi.execute
    )

    // Encode ABI
    this.server.tool(
      'encode-function-data',
      'Encode a function call into a hex string',
      encodeAbi.schema.shape,
      encodeAbi.execute
    )

    // Fetch ABI
    this.server.tool(
      'fetch-abi',
      'Fetch the ABI for a smart contract',
      fetchAbi.schema.shape,
      fetchAbi.execute
    )

    // Function selector
    this.server.tool(
      'function-selector',
      [
        'Get the function selector for a Solidity function from the function signature or full function, event or error.',
        'Examples: `function ownerOf(uint256 tokenId) returns (address)`,',
        'or you can extract `function checkPrice(string calldata token)` from the full function like `function checkPrice(string calldata token) public view returns (uint256 price, string memory priceStr) { ... }`',
      ].join('\n'),
      functionSelector.schema.shape,
      functionSelector.execute
    )

    // Keccak256 hash
    this.server.tool(
      'keccak256-hash',
      'Get the Keccak256 hash of a value',
      keccak256Hash.schema.shape,
      keccak256Hash.execute
    )

    // Convert EVM chain id to cointype
    this.server.tool(
      'chain-id-to-cointype',
      'Convert an EVM chain ID to an ENS cointype',
      convertEvmChainIdToCoinType.schema.shape,
      convertEvmChainIdToCoinType.execute
    )

    // Namehash
    this.server.tool(
      'namehash',
      'Get the Namehash of an ENS name, often referred to as a node',
      namehash.schema.shape,
      namehash.execute
    )

    // Reverse ENS resolution
    this.server.tool(
      'resolve-ens-address',
      'Get an ENS name from an Ethereum address',
      resolveEnsAddress.schema.shape,
      resolveEnsAddress.execute
    )

    // Forward ENS resolution
    this.server.tool(
      'resolve-ens-name',
      'Get an Ethereum address from an ENS name',
      resolveEnsName.schema.shape,
      resolveEnsName.execute
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
