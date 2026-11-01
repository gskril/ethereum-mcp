import type { CallToolResult, McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'

type Tool<T extends z.ZodObject<any>> = {
  schema: T
  execute: (args: z.infer<T>) => Promise<CallToolResult> | CallToolResult
}

// Helper function to create tools with proper type inference
export function createTool<T extends z.ZodObject<any>>(tool: Tool<T>) {
  return tool
}

// Registers a tool and logs its name, outcome and duration. Arguments are
// intentionally left out of the logs.
export function registerTool<T extends z.ZodObject<any>>(
  server: McpServer,
  name: string,
  description: string,
  tool: Tool<T>
) {
  server.registerTool(
    name,
    { description, inputSchema: tool.schema as z.ZodObject<any> },
    async (args) => {
      const start = Date.now()
      let isError = true

      try {
        const result = await tool.execute(args as z.infer<T>)
        isError = !!result.isError
        return result
      } finally {
        console.log({
          event: 'tool_call',
          tool: name,
          isError,
          durationMs: Date.now() - start,
        })
      }
    }
  )
}
