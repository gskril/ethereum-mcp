import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { isHex, keccak256, toHex } from 'viem/utils'
import { z } from 'zod'

export const Keccak256HashSchema = z.object({
  value: z.string().describe('The value to encode'),
})

export function keccak256Hash({
  value,
}: z.infer<typeof Keccak256HashSchema>): CallToolResult {
  const encoded = keccak256(isHex(value) ? value : toHex(value))

  return {
    content: [{ type: 'text', text: encoded }],
  }
}
