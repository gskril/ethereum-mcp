import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { namehash as namehashViem } from 'viem/ens'
import { isAddress } from 'viem/utils'
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

////////////////////////////////////////////////////////////////////////////////

export const namehash = createTool({
  schema: z.object({
    name: z.string(),
  }),
  execute: ({ name }) => {
    return {
      content: [{ type: 'text', text: namehashViem(name) }],
    }
  },
})

////////////////////////////////////////////////////////////////////////////////

export const convertEvmChainIdToCoinType = createTool({
  schema: z.object({
    chainId: z.number(),
  }),
  execute: ({ chainId }) => {
    const cointype = chainId === 1 ? 60 : (0x80000000 | chainId) >>> 0

    return {
      content: [{ type: 'text', text: cointype.toString() }],
    }
  },
})
