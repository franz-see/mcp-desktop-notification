import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { sendNotification } from './notification';
import { NotificationRequest } from './types';

export async function runMCPServer(): Promise<void> {
  const server = new Server(
    {
      name: 'desktop-notification',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'send_notification',
          description: 'Send a desktop alert notification (typically more urgent)',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'The title of the alert',
              },
              message: {
                type: 'string',
                description: 'The alert message content',
              },
            },
            required: ['title', 'message'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'send_notification') {
      const req = args as unknown as NotificationRequest;

      try {
        await sendNotification(req.title, req.message, '', '@sound.mp3');
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully sent alert: '${req.title}'`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to send notification: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}