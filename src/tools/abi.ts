import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import {
  decodeFunctionData,
  encodeFunctionData,
  isHex,
  toFunctionSelector,
} from 'viem'
import { z } from 'zod'

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
