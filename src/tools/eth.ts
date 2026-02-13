import { createPublicClient, http } from 'viem'
import { isAddress, isHex } from 'viem/utils'
import { z } from 'zod'

import { chainFromName } from '../lib/chains'
import { createTool } from '../lib/utils'

export const ethCall = createTool({
  schema: z.object({
    to: z.string().refine(isAddress).describe('The address of the contract'),
    data: z.string().refine(isHex).describe('The data to call the contract'),
    chain: z
      .string()
      .refine((chain) => !!chainFromName(chain), {
        message: 'Unsupported chain',
      })
      .describe(
        'The EVM chain name like "ethereum"/"mainnet", "base", "arbitrum", "optimism"'
      ),
  }),
  execute: async ({ to, data, chain: chainName }) => {
    const chain = chainFromName(chainName)

    if (!chain) {
      return {
        content: [
          { type: 'text', text: 'Cannot find client. Unsupported chain.' },
        ],
      }
    }

    const client = createPublicClient({
      chain,
      transport: http(),
    })

    try {
      const result = await client.call({
        to,
        data,
      })

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      }
    } catch (error) {
      const err = error as Error

      return {
        content: [
          { type: 'text', text: `Error calling contract: ${err.message}` },
        ],
      }
    }
  },
})
