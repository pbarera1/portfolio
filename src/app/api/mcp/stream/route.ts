// src/app/api/mcp/stream/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const sendMessage = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      const processRequest = async () => {
        try {
          const body = await request.json();
          const { id, method, params } = body as {
            id: number | string | null;
            method: string;
            params?: any;
          };

          // Initialize
          if (method === 'initialize') {
            sendMessage({
              jsonrpc: '2.0',
              id,
              result: {
                protocolVersion: '2025-03-26',
                serverInfo: { name: 'streaming-mcp', version: '0.1.0' },
                capabilities: {
                  tools: {}
                },
              },
            });
            return;
          }

          // List tools
          if (method === 'tools/list') {
            sendMessage({
              jsonrpc: '2.0',
              id,
              result: {
                tools: [
                  {
                    name: 'echo',
                    description: 'A simple echo tool for testing',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          description: 'Message to echo back'
                        }
                      },
                      required: ['message']
                    }
                  },
                  {
                    name: 'streaming_echo',
                    description: 'A streaming echo tool that sends multiple messages',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          description: 'Message to echo back'
                        },
                        count: {
                          type: 'integer',
                          description: 'Number of messages to send',
                          default: 3
                        }
                      },
                      required: ['message']
                    }
                  }
                ]
              }
            });
            return;
          }

          // Call tools
          if (method === 'tools/call') {
            const { name, arguments: args } = params ?? {};

            if (name === 'echo') {
              sendMessage({
                jsonrpc: '2.0',
                id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: `Echo: ${args?.message || 'No message provided'}`
                    }
                  ]
                }
              });
              return;
            }

            if (name === 'streaming_echo') {
              const message = args?.message || 'No message provided';
              const count = args?.count || 3;

              // Send multiple messages with delays to demonstrate streaming
              for (let i = 1; i <= count; i++) {
                await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
                sendMessage({
                  jsonrpc: '2.0',
                  id,
                  result: {
                    content: [
                      {
                        type: 'text',
                        text: `Streaming Echo ${i}/${count}: ${message}`
                      }
                    ]
                  }
                });
              }
              return;
            }

            sendMessage({
              jsonrpc: '2.0',
              id,
              error: { code: -32601, message: `Unknown tool: ${name}` }
            });
            return;
          }

          sendMessage({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: 'Method not found' }
          });

        } catch (e: any) {
          console.error('[Streaming MCP] Unhandled error:', e);
          sendMessage({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32000, message: e?.message ?? 'Server error' }
          });
        } finally {
          controller.close();
        }
      };

      processRequest();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export function GET() {
  return new Response(JSON.stringify({
    ok: true,
    endpoint: '/api/mcp/stream',
    streaming: true
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
