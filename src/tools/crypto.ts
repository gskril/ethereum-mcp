import { isHex, keccak256, toHex } from 'viem/utils'
import { z } from 'zod'

import { createTool } from '../lib/utils'

export const keccak256Hash = createTool({
  schema: z.object({
    value: z.string().describe('The value to encode'),
  }),
  execute: async ({ value }) => {
    const encoded = keccak256(isHex(value) ? value : toHex(value))

    return {
      content: [{ type: 'text', text: encoded }],
    }
  },
})
