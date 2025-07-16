import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { createPublicClient, http, isAddress } from 'viem'
import { mainnet } from 'viem/chains'
import { z } from 'zod'

export const ResolveEnsNameSchema = z.object({
  name: z.string(),
})

export async function resolveEnsName({
  name,
}: z.infer<typeof ResolveEnsNameSchema>): Promise<CallToolResult> {
  const client = createPublicClient({
    transport: http(),
    chain: mainnet,
  })

  const address = await client.getEnsAddress({ name })

  return {
    content: [{ type: 'text', text: address ?? 'No address found' }],
  }
}

///////////////////////////////////////////////////////////////////////////////

export const ResolveEnsAddressSchema = z.object({
  address: z.string().refine(isAddress, {
    message: 'Invalid address',
  }),
})

export async function resolveEnsAddress({
  address,
}: z.infer<typeof ResolveEnsAddressSchema>): Promise<CallToolResult> {
  const client = createPublicClient({
    transport: http(),
    chain: mainnet,
  })

  const name = await client.getEnsName({ address })

  return {
    content: [{ type: 'text', text: name ?? 'No name found' }],
  }
}
