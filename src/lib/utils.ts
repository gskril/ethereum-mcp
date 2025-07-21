import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

// Helper function to create tools with proper type inference
export function createTool<T extends z.ZodObject<any>>({
  schema,
  execute,
}: {
  schema: T
  execute: (args: z.infer<T>) => Promise<CallToolResult> | CallToolResult
}) {
  return { schema, execute }
}
