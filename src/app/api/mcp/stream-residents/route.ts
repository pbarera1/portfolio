// src/app/api/mcp/stream-residents/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { logObservation, queryObservations } from '@/lib/residents';
import { supabaseAdmin } from '@/lib/supabase';

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
                serverInfo: { name: 'streaming-residents-mcp', version: '0.1.0' },
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
                    name: 'log_observation',
                    description: 'Insert a resident observation (returns observation id). Pass {"confirm": true} to actually save.',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        resident_name: {
                          type: 'string',
                          description: 'Name of the resident'
                        },
                        note: {
                          type: 'string',
                          description: 'Observation note to log'
                        },
                        confirm: {
                          type: 'boolean',
                          description: 'Set to true to actually save the observation',
                          default: false
                        },
                      },
                      required: ['resident_name', 'note'],
                    },
                  },
                  {
                    name: 'query_observations',
                    description: 'Fetch recent observations for a resident. Use before summarizing last N days.',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        resident_name: {
                          type: 'string',
                          description: 'Name of the resident to query'
                        },
                        since_days: {
                          type: 'integer',
                          description: 'Number of days to look back',
                          minimum: 1,
                          maximum: 365,
                          default: 7
                        },
                      },
                      required: ['resident_name'],
                    },
                  },
                ]
              }
            });
            return;
          }

          // Call tools
          if (method === 'tools/call') {
            const { name, arguments: args } = params ?? {};

            if (name === 'log_observation') {
              const schema = z.object({
                resident_name: z.string().min(1),
                note: z.string().min(1),
                confirm: z.boolean().optional().default(false),
              });

              const parsed = schema.safeParse(args);
              if (!parsed.success) {
                sendMessage({
                  jsonrpc: '2.0',
                  id,
                  error: { code: -32602, message: 'Invalid params', data: parsed.error.errors },
                });
                return;
              }

              const { resident_name, note, confirm } = parsed.data;

              if (!confirm) {
                sendMessage({
                  jsonrpc: '2.0',
                  id,
                  result: {
                    content: [
                      {
                        type: 'text',
                        text: `About to save: "${note}" for ${resident_name}. Call again with {"confirm": true} to proceed.`,
                      },
                    ],
                  }
                });
                return;
              }

              // Duplicate guard
              try {
                const sb = supabaseAdmin();
                const cutoff = new Date(Date.now() - 10 * 60_000).toISOString();
                const { data: dup, error: dupErr } = await sb
                  .from('observations')
                  .select('id, residents!inner(name)')
                  .eq('residents.name', resident_name)
                  .eq('note', note)
                  .gte('created_at', cutoff)
                  .limit(1);
                if (dupErr) throw dupErr;
                if ((dup?.length ?? 0) > 0) {
                  sendMessage({
                    jsonrpc: '2.0',
                    id,
                    result: {
                      content: [{ type: 'text', text: 'Skipped: recent duplicate note (10 min).' }],
                    }
                  });
                  return;
                }
              } catch (e) {
                console.warn('[dup check] continuing despite error:', e);
              }

              const obsId = await logObservation(resident_name, note);
              sendMessage({
                jsonrpc: '2.0',
                id,
                result: { content: [{ type: 'text', text: `Saved. observation_id=${obsId}` }] },
              });
              return;
            }

            if (name === 'query_observations') {
              const schema = z.object({
                resident_name: z.string().min(1),
                since_days: z.number().int().min(1).max(365).default(7),
              });

              const parsed = schema.safeParse(args);
              if (!parsed.success) {
                sendMessage({
                  jsonrpc: '2.0',
                  id,
                  error: { code: -32602, message: 'Invalid params', data: parsed.error.errors },
                });
                return;
              }

              const { resident_name, since_days } = parsed.data;

              // Query with inner join to filter by resident name
              const sb = supabaseAdmin();
              const { data, error } = await sb
                .from('observations')
                .select('id, note, created_at, residents!inner(name)')
                .eq('residents.name', resident_name)
                .gte('created_at', new Date(Date.now() - since_days * 86_400_000).toISOString())
                .order('created_at', { ascending: false });

              if (error) {
                sendMessage({
                  jsonrpc: '2.0',
                  id,
                  error: { code: -32603, message: 'Internal error', data: error.message },
                });
                return;
              }

              const rows = data ?? [];
              sendMessage({
                jsonrpc: '2.0',
                id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text:
                        rows.length === 0
                          ? `No notes for ${resident_name} in last ${since_days} days.`
                          : JSON.stringify(rows, null, 2),
                    },
                  ],
                }
              });
              return;
            }

            sendMessage({
              jsonrpc: '2.0',
              id,
              error: { code: -32601, message: `Unknown tool: ${name}` },
            });
            return;
          }

          sendMessage({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: 'Method not found' }
          });

        } catch (e: any) {
          console.error('[Streaming Residents MCP] Unhandled error:', e);
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
    endpoint: '/api/mcp/stream-residents',
    streaming: true,
    features: ['residents', 'observations', 'streaming']
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
