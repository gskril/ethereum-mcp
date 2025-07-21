import { createPublicClient, http, isAddress } from 'viem'
import { mainnet } from 'viem/chains'
import { z } from 'zod'

import { createTool } from '../lib/utils'

export const resolveEnsName = createTool({
  schema: z.object({
    name: z.string(),
  }),
  execute: async ({ name }) => {
    const client = createPublicClient({
      transport: http(),
      chain: mainnet,
    })

    const address = await client.getEnsAddress({ name })

    return {
      content: [{ type: 'text', text: address ?? 'No address found' }],
    }
  },
})

////////////////////////////////////////////////////////////////////////////////

export const resolveEnsAddress = createTool({
  schema: z.object({
    address: z.string().refine(isAddress, {
      message: 'Invalid address',
    }),
  }),
  execute: async ({ address }) => {
    const client = createPublicClient({
      transport: http(),
      chain: mainnet,
    })

    const name = await client.getEnsName({ address })

    return {
      content: [{ type: 'text', text: name ?? 'No name found' }],
    }
  },
})
