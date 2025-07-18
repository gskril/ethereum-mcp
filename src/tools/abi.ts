import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import {
  decodeAbiParameters as decodeAbiParametersViem,
  decodeFunctionData,
  encodeAbiParameters as encodeAbiParametersViem,
  encodeFunctionData,
  isAddress,
  isHex,
  toFunctionSelector,
} from 'viem/utils'
import { z } from 'zod'

import { replaceBigInts } from '../utils/replaceBigints'

export const EncodeAbiSchema = z.object({
  abi: z.string().describe('The ABI of the contract'),
  functionName: z.string().describe('The name of the function to encode'),
  args: z.array(z.any()).describe('The arguments to encode'),
})

export async function encodeAbi({
  abi,
  functionName,
  args,
}: z.infer<typeof EncodeAbiSchema>): Promise<CallToolResult> {
  const encoded = encodeFunctionData({
    abi: JSON.parse(abi),
    functionName,
    args,
  })

  return {
    content: [{ type: 'text', text: encoded }],
  }
}

////////////////////////////////////////////////////////////////////////////////

export const DecodeAbiSchema = z.object({
  abi: z.string().describe('The ABI of the contract'),
  data: z
    .string()
    .refine(isHex, {
      message: 'Data must be a hex string',
    })
    .describe('The hex data to decode'),
})

export function decodeAbi({
  abi,
  data,
}: z.infer<typeof DecodeAbiSchema>): CallToolResult {
  const decoded = decodeFunctionData({
    abi: JSON.parse(abi),
    data,
  })

  return {
    content: [{ type: 'text', text: JSON.stringify(decoded, null, 2) }],
  }
}

////////////////////////////////////////////////////////////////////////////////

export const FunctionSelectorSchema = z.object({
  abiItem: z
    .string()
    .describe(
      'The Solidity function, event or error like `function ownerOf(uint256 tokenId)`'
    ),
})

export function functionSelector({
  abiItem,
}: z.infer<typeof FunctionSelectorSchema>): CallToolResult {
  const selector = toFunctionSelector(abiItem)

  return {
    content: [{ type: 'text', text: selector }],
  }
}

////////////////////////////////////////////////////////////////////////////////

export const EncodeAbiParametersSchema = z.object({
  params: z
    .array(z.object({ type: z.string(), name: z.string().optional() }))
    .describe(
      "Array of ABI types like `[{ type: 'uint32' }, { type: 'bytes32' }]`"
    ),
  values: z.array(z.any()).describe('The values to encode'),
})

export function encodeAbiParameters({
  params,
  values,
}: z.infer<typeof EncodeAbiParametersSchema>): CallToolResult {
  const encoded = encodeAbiParametersViem(params, values)

  return {
    content: [{ type: 'text', text: encoded }],
  }
}

////////////////////////////////////////////////////////////////////////////////

export const DecodeAbiParametersSchema = z.object({
  params: z
    .array(z.object({ type: z.string(), name: z.string().optional() }))
    .describe(
      "Array of ABI types like `[{ type: 'uint32' }, { type: 'bytes32' }]`"
    ),
  data: z
    .string()
    .refine(isHex, {
      message: 'Data must be a hex string',
    })
    .describe('The hex data to decode'),
})

export function decodeAbiParameters({
  params,
  data,
}: z.infer<typeof DecodeAbiParametersSchema>): CallToolResult {
  const decoded = decodeAbiParametersViem(params, data)

  // Replace bigint with string
  const formatted = replaceBigInts(decoded, (x) => x.toString())

  return {
    content: [{ type: 'text', text: JSON.stringify(formatted, null, 2) }],
  }
}

////////////////////////////////////////////////////////////////////////////////

export const FetchAbiSchema = z.object({
  address: z
    .string()
    .refine(isAddress, {
      message: 'Address must be a valid address',
    })
    .describe('The address of the contract'),
  network: z
    .enum([
      'mainnet',
      'goerli',
      'sepolia',
      'avalanche',
      'avalancheFuji',
      'arbitrum',
      'arbitrumGoerli',
      'arbitrumNova',
      'base',
      'baseGoerli',
      'bsc',
      'bscTestnet',
      'fantom',
      'fantomTestnet',
      'polygon',
      'polygonMumbai',
      'polygonZkEvm',
      'polygonZkEvmTestnet',
      'optimism',
      'optimismGoerli',
      'gnosis',
    ])
    .default('mainnet')
    .describe(
      'The network of the contract. If not provided, the default is mainnet.'
    ),
})

export async function fetchAbi({
  address,
  network,
}: z.infer<typeof FetchAbiSchema>): Promise<CallToolResult> {
  const res = await fetch(`https://abidata.net/${address}?network=${network}`)
  const data = await res.json()

  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  }
}
