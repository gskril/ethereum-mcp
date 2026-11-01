import { McpServer } from '@modelcontextprotocol/server'
import { createMcpHandler } from 'agents/mcp/server'

import packageJson from '../package.json'
import { registerTool } from './lib/utils'
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
  checkNameAvailability,
  convertEvmChainIdToCoinType,
  namehash,
  resolveEnsAddress,
  resolveEnsName,
} from './tools/ens'
import { ethCall } from './tools/eth'

// A fresh server is created per request; none of these tools use sessions
function createServer() {
  const server = new McpServer({
    name: 'ethereum',
    title: 'Ethereum MCP',
    version: packageJson.version,
    description:
      'Read-only MCP server for Ethereum and ENS development—ABI work, contract reads, name resolution, and hashing.',
    websiteUrl: 'https://github.com/gskril/ethereum-mcp',
    icons: [
      {
        src: 'https://raw.githubusercontent.com/gskril/ethereum-mcp/main/favicon.ico',
        mimeType: 'image/x-icon',
        sizes: ['48x48'],
      },
    ],
  })

  // Encode ABI parameters
  registerTool(
    server,
    'encode-abi-parameters',
    [
      'Generates ABI encoded data given a set of ABI parameters and their corresponding values.',
      'Example: params: `[{ type: "uint32" }, { type: "bytes" }]`, values: `[1, "0x1234567890"]`',
    ].join('\n'),
    encodeAbiParameters
  )

  // Decode ABI parameters
  registerTool(
    server,
    'decode-abi-parameters',
    'Decodes ABI encoded data (a hex string) into a set of ABI parameters and their corresponding values.',
    decodeAbiParameters
  )

  // Decode ABI
  registerTool(
    server,
    'decode-function-data',
    'Decode a hex string into a function call',
    decodeAbi
  )

  // Encode ABI
  registerTool(
    server,
    'encode-function-data',
    'Encode a function call into a hex string',
    encodeAbi
  )

  // Fetch ABI
  registerTool(
    server,
    'fetch-abi',
    'Fetch the ABI for a smart contract',
    fetchAbi
  )

  // Function selector
  registerTool(
    server,
    'function-selector',
    [
      'Get the function selector for a Solidity function from the function signature or full function, event or error.',
      'Examples: `function ownerOf(uint256 tokenId) returns (address)`,',
      'or you can extract `function checkPrice(string calldata token)` from the full function like `function checkPrice(string calldata token) public view returns (uint256 price, string memory priceStr) { ... }`',
    ].join('\n'),
    functionSelector
  )

  // Keccak256 hash
  registerTool(
    server,
    'keccak256-hash',
    'Get the Keccak256 hash of a value',
    keccak256Hash
  )

  // Convert EVM chain id to cointype
  registerTool(
    server,
    'chain-id-to-cointype',
    'Convert an EVM chain ID to an ENS cointype',
    convertEvmChainIdToCoinType
  )

  // Check ENS name availability
  registerTool(
    server,
    'check-ens-name-availability',
    'Check if a .eth name is available to register in ENS',
    checkNameAvailability
  )

  // Namehash
  registerTool(
    server,
    'namehash',
    'Get the Namehash of an ENS name, often referred to as a node',
    namehash
  )

  // Reverse ENS resolution
  registerTool(
    server,
    'resolve-ens-address',
    'Get an ENS name from an Ethereum address',
    resolveEnsAddress
  )

  // Forward ENS resolution
  registerTool(
    server,
    'resolve-ens-name',
    'Get an Ethereum address from an ENS name',
    resolveEnsName
  )

  // ETH call
  registerTool(
    server,
    'eth-call',
    'Read data from a smart contract using an address and ABI-encoded function data',
    ethCall
  )

  return server
}

const handler = createMcpHandler(createServer)

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url)

    if (url.pathname === '/mcp') {
      return handler(request, env, ctx)
    }

    return new Response('Not found', { status: 404 })
  },
}
